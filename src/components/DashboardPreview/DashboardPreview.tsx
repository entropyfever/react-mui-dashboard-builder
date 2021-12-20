import React from 'react';
import './dashboardPreview.scss';
import {TreeNode} from "../TreeNode";

export interface DashboardPreviewProps {
  style?:  React.CSSProperties;
  className?: string;
}

export const DashboardPreview: React.FC<DashboardPreviewProps> = (
  {
    className,
    style,
  }) => {

  return (
    <div className={className} style={style}>
      <TreeNode nodeId={'root'} />
    </div>
  );
}
