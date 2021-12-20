import React from 'react';
import { TreeNode, TreeNodeProps } from '..';
import { render, screen } from '@testing-library/react';

const defaultProps: TreeNodeProps = {
  
};

const setup = (props = defaultProps) => render(<TreeNode {...props} />);

describe('TreeNode', () => {
  it('renders', () => {
    setup({children: 'foo'});
    expect(screen.getByText('foo'));
  });
});
