import React from 'react';
import { DashboardBuilderProvider, DashboardBuilderProviderProps } from '..';
import { render, screen } from '@testing-library/react';

const defaultProps: DashboardBuilderProviderProps = {
  
};

const setup = (props = defaultProps) => render(<DashboardBuilderProvider {...props} />);

describe('DashboardBuilderProvider', () => {
  it('renders', () => {
    setup({children: 'foo'});
    expect(screen.getByText('foo'));
  });
});
