import type { MutableRefObject } from 'react';

export interface TreeItem{
  id: string;
  children: this[];
  collapsed?: boolean;
}

export const createTreeItem = <T extends TreeItem>(): TreeItem => {
  return {
    id: 'root',
    children: []
  }
}

export type TreeItems = TreeItem[];

export interface FlattenedItem extends TreeItem {
  parentId: null | string;
  depth: number;
  index: number;
}

export type SensorContext = MutableRefObject<{
  items: FlattenedItem[];
  offset: number;
}>;
