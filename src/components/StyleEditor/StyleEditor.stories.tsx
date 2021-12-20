import React from 'react';

export interface StyleEditorProps {}

export const StyleEditor: React.FC<StyleEditorProps> = ({ children }) => {
  return (
    <div>{ children }</div>
  );
}
