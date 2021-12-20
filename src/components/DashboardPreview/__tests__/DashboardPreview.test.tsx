import React from 'react';
import { DashboardPreview, DashboardPreviewProps } from '..';
import { render, screen } from '@testing-library/react';

const defaultProps: DashboardPreviewProps = {
  
};

const setup = (props = defaultProps) => render(<DashboardPreview {...props} />);

describe('DashboardPreview', () => {
  it('renders', () => {
    setup({children: 'foo'});
    expect(screen.getByText('foo'));
  });
});
