import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import NotFound from '@/app/not-found';

/**
 * 测试目标: 验证 not-found.tsx 页面
 * 
 * 潜在问题:
 * 1. 404 数字显示异常
 * 2. 返回首页链接失效
 * 3. 搜索链接参数错误
 */

describe('NotFound Page', () => {
  it('should display 404 number', () => {
    const { container } = render(<NotFound />);
    
    // Check for 404 text in any element
    expect(container.textContent).toContain('404');
  });

  it('should display error title and message', () => {
    render(<NotFound />);
    
    expect(screen.getByText('页面未找到')).toBeTruthy();
    expect(screen.getByText(/您访问的页面不存在/)).toBeTruthy();
  });

  it('should have link to homepage', () => {
    render(<NotFound />);
    
    const homeLink = screen.getByRole('link', { name: /返回首页/ });
    expect(homeLink.getAttribute('href')).toBe('/');
  });

  it('should have link to search', () => {
    render(<NotFound />);
    
    const searchLink = screen.getByRole('link', { name: /搜索文章/ });
    expect(searchLink.getAttribute('href')).toBe('/?search=true');
  });

  it('should have correct layout classes', () => {
    const { container } = render(<NotFound />);
    
    // Check for min-height class on parent div
    const mainDiv = container.querySelector('.min-h-\\[60vh\\]');
    expect(mainDiv).toBeTruthy();
  });
});
