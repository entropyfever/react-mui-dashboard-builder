import React from 'react';
import { StyleEditor, StyleEditorProps } from '..';
import { render, screen } from '@testing-library/react';

const defaultProps: StyleEditorProps = {
  
};

const setup = (props = defaultProps) => render(<StyleEditor {...props} />);

describe('StyleEditor', () => {
  it('renders', () => {
    setup({children: 'foo'});
    expect(screen.getByText('foo'));
  });
});
