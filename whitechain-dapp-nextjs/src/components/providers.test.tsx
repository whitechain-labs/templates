import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Providers } from './providers';

// Example provider test: the app renders inside the provider tree.
describe('Providers', () => {
  it('renders the app content within the provider tree', () => {
    render(
      <Providers>
        <p>app content</p>
      </Providers>,
    );
    expect(screen.getByText('app content')).toBeInTheDocument();
  });
});
