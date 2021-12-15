import React from 'react';

export interface DummyProps {}

export const Dummy: React.FC<DummyProps> = ({ children }) => {
  return (
    <div>{ children }</div>
  );
}
