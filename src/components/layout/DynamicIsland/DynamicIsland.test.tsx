import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DynamicIsland } from './DynamicIsland';

describe('DynamicIsland', () => {
  it('should render collapsed state by default', () => {
    render(<DynamicIsland />);
    expect(screen.getByText('灵动岛')).toBeInTheDocument();
  });
});
