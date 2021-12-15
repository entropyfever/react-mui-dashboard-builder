import React from 'react';

export interface DashboardBuilderProviderProps {}

export const DashboardBuilderProvider: React.FC<DashboardBuilderProviderProps> = ({ children }) => {
  return (
    <div>{ children }</div>
  );
}
