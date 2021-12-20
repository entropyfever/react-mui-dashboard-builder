import React from 'react';

export interface DashboardPreviewProps {}

export const DashboardPreview: React.FC<DashboardPreviewProps> = ({ children }) => {
  return (
    <div>{ children }</div>
  );
}
