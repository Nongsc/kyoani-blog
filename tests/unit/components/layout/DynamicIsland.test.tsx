import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DynamicIsland } from '@/components/layout/DynamicIsland/DynamicIsland';

// Mock music config API
vi.mock('@/lib/music', () => ({
  getMusicConfig: vi.fn(() => Promise.resolve(null)),
}));

describe('DynamicIsland', () => {
  it('should render collapsed state by default', () => {
    render(<DynamicIsland />);
    expect(screen.getByText('Home')).toBeInTheDocument();
  });
});
