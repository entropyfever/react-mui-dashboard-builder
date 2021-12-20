import React from 'react';

export interface TreeNodeProps {}

export const TreeNode: React.FC<TreeNodeProps> = ({ children }) => {
  return (
    <div>{ children }</div>
  );
}
