import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ArticleLoading from '@/app/article/[slug]/loading';

/**
 * 测试目标: 验证 loading.tsx 组件的功能
 * 
 * 潜在问题:
 * 1. 骨架屏数量不正确
 * 2. 布局与实际内容不匹配
 * 3. 响应式设计问题
 */

describe('ArticleLoading Component', () => {
  it('should render loading skeleton', () => {
    const { container } = render(<ArticleLoading />);
    
    // Should have skeleton elements
    const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should render back button skeleton', () => {
    render(<ArticleLoading />);
    
    // Should have a skeleton for back button area
    const skeletons = document.querySelectorAll('.h-9');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should render title skeleton', () => {
    const { container } = render(<ArticleLoading />);
    
    // Should have a title skeleton
    const titleSkeleton = container.querySelector('.h-10');
    expect(titleSkeleton).toBeTruthy();
  });

  it('should render content skeleton', () => {
    const { container } = render(<ArticleLoading />);
    
    // Should have multiple content lines
    const contentSkeletons = container.querySelectorAll('.space-y-4 .h-4');
    expect(contentSkeletons.length).toBeGreaterThanOrEqual(8);
  });

  it('should have correct grid layout classes', () => {
    const { container } = render(<ArticleLoading />);
    
    // Should have responsive grid layout
    const gridContainer = container.querySelector('.lg\\:grid-cols-\\[200px_1fr\\]');
    expect(gridContainer).toBeTruthy();
  });
});
