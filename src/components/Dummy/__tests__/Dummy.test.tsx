import React from 'react';
import { Dummy, DummyProps } from '..';
import { render, screen } from '@testing-library/react';

const defaultProps: DummyProps = {
  
};

const setup = (props = defaultProps) => render(<Dummy {...props} />);

describe('Dummy', () => {
  it('renders', () => {
    setup({children: 'foo'});
    expect(screen.getByText('foo'));
  });
});
