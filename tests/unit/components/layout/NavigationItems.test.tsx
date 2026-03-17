import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NavigationItems } from '@/components/layout/DynamicIsland/NavigationItems';

// Mock Next.js hooks
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

describe('NavigationItems', () => {
  it('should render navigation links', () => {
    render(<NavigationItems />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
  });

  it('should mark active link', () => {
    render(<NavigationItems />);
    const homeLink = screen.getByText('Home').closest('a');
    expect(homeLink).toHaveAttribute('aria-current', 'page');
  });
});
