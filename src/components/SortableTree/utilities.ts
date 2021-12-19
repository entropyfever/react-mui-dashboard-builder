import { arrayMove } from '@dnd-kit/sortable';

import type { FlattenedItem, TreeItem } from './types';

export const iOS = /iPad|iPhone|iPod/.test(navigator.platform);

function getDragDepth(offset: number, indentationWidth: number): number {
  return Math.round(offset / indentationWidth);
}

interface IItemDepth {
  (item: FlattenedItem): number
}


const getMaxDepth: IItemDepth = function (previousItem) {
  if (previousItem) {
    return previousItem.depth + 1;
  }

  return 0;
}

const getMinDepth: IItemDepth = function (nextItem): number {
  if (nextItem) {
    return nextItem.depth;
  }

  return 0;
}

type Projection = {
  depth: number
  maxDepth: number
  minDepth: number
  parentId: string | null
}
export function getProjection(
  items: FlattenedItem[],
  activeId: string,
  overId: string,
  dragOffset: number,
  indentationWidth: number,
): Projection {
  const overItemIndex = items.findIndex(({ id }) => { return id === overId; });
  const activeItemIndex = items.findIndex(({ id }) => { return id === activeId; });
  const activeItem = items[activeItemIndex];
  const newItems = arrayMove(items, activeItemIndex, overItemIndex);
  const previousItem = newItems[overItemIndex - 1];
  const nextItem = newItems[overItemIndex + 1];
  const dragDepth = getDragDepth(dragOffset, indentationWidth);
  const projectedDepth = activeItem.depth + dragDepth;
  const maxDepth = getMaxDepth(previousItem);
  const minDepth = getMinDepth(nextItem);
  let depth = projectedDepth;

  if (projectedDepth >= maxDepth) {
    depth = maxDepth;
  } else if (projectedDepth < minDepth) {
    depth = minDepth;
  }
  function getParentId(): (string | null) {
    if (0 === depth || !previousItem) {
      return null;
    }

    if (depth === previousItem.depth) {
      return previousItem.parentId;
    }

    if (depth > previousItem.depth) {
      return previousItem.id;
    }

    const newParent = newItems
      .slice(0, overItemIndex)
      .reverse()
      .find((item) => { return item.depth === depth; })?.parentId;

    return newParent ?? null;
  }

  return { depth, maxDepth, minDepth, parentId: getParentId() };
}

function flatten<T extends TreeItem>(
  items: T[],
  parentId: string | null = null,
  depth = 0,
): (T & FlattenedItem)[] {


  return items.reduce<(T & FlattenedItem)[]>((acc, item, index) => {

    const flattenedItem = {...item, ...{parentId, index, depth}} as (T & FlattenedItem);

    return [
      ...acc,
      flattenedItem,
      ...flatten(item.children, item.id, depth + 1),
    ];

  }, []);
}

export function flattenTree<T extends TreeItem>(items: T[]): (T & FlattenedItem)[]{
  return flatten(items);
}

export function findItem(items: TreeItem[], itemId: string): TreeItem | undefined {
  return items.find(({ id }) => { return id === itemId; });
}

export function buildTree(flattenedItems: FlattenedItem[]): TreeItem {
  const root: TreeItem = { id: 'root', children: [] };
  const nodes: Record<string, TreeItem> = { [root.id]: root };
  const items = flattenedItems
    .filter((item) => item.id !== 'root')
    .map((item) => { return { ...item, children: [] }; });

  // eslint-disable-next-line no-restricted-syntax
  for (const item of items) {
    const { id, children } = item;
    const parentId = item.parentId ?? root.id;
    const parent = nodes[parentId] ?? findItem(items, parentId);

    nodes[id] = { id, children };
    parent.children.push(item);
  }

  return root;
}

export function findItemDeep<T extends TreeItem>(
  items: T[],
  itemId: string,
): T | undefined {
  // eslint-disable-next-line no-restricted-syntax
  for (const item of items) {
    const { id, children } = item;

    if (id === itemId) {
      return item;
    }

    if (children.length) {
      const child = findItemDeep(children, itemId);

      if (child) {
        return child;
      }
    }
  }

  return undefined;
}

export function removeItem<T extends TreeItem>(items: T[], id: string): T[] {
  const newItems: T[] = [];

  // eslint-disable-next-line no-restricted-syntax
  for (const item of items) {
    if (item.id === id) {
      // eslint-disable-next-line no-continue
      continue;
    }

    if (item.children.length) {
      item.children = removeItem(item.children, id);
    }

    newItems.push(item);
  }

  return newItems;
}


export function setProperty<T extends TreeItem, K extends keyof T>(
  items: T[],
  id: string,
  property: K,
  setter: ((_value: T[K]) => T[K]),
): T[] {

  // eslint-disable-next-line no-restricted-syntax
  for (const item of items) {
    if (item.id === id) {
      item[property] = setter(item[property]);
      // eslint-disable-next-line no-continue
      continue;
    }

    if (item.children.length) {
      item.children = setProperty(item.children, id, property, setter);
    }
  }

  return [ ...items ];
}


interface TestTreeItem extends TreeItem {
  test: string
}

const x: TestTreeItem[] = []
setProperty(x, 'id', 'test', (x) => x)



function countChildren<T extends TreeItem>(items: T[], count = 0): number {
  return items.reduce((acc, { children }) => {
    if (children.length) {
      return countChildren(children, acc + 1);
    }

    return acc + 1;
  }, count);
}

export function getChildCount<T extends TreeItem>(items: T[], id: string): number {
  if (!id) {
    return 0;
  }

  const item = findItemDeep(items, id);

  return item ? countChildren(item.children) : 0;
}

export function removeChildrenOf(items: FlattenedItem[], ids: string[]): FlattenedItem[] {
  const excludeParentIds = [ ...ids ];

  return items.filter((item) => {
    if (item.parentId && excludeParentIds.includes(item.parentId)) {
      if (item.children.length) {
        excludeParentIds.push(item.id);
      }
      return false;
    }

    return true;
  });
}