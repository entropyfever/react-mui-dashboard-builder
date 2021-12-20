import type { MutableRefObject } from 'react';

export interface Identifier {
  id: string
}


export interface TreeItem extends Identifier{
  children: this[];
  collapsed?: boolean;
  isLeaf: boolean
}


export const createTreeItem = <T extends TreeItem>(): TreeItem => {
  return {
    id: 'root',
    children: [],
    isLeaf: false
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
