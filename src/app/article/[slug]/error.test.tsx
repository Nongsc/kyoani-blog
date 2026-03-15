import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ArticleError from '@/app/article/[slug]/error';

/**
 * 测试目标: 验证 error.tsx 组件的功能
 * 
 * 潜在问题:
 * 1. 错误信息未正确显示
 * 2. 重试功能不工作
 * 3. 返回首页链接失效
 * 4. 错误 digest 未显示
 */

describe('ArticleError Component', () => {
  const mockReset = vi.fn();
  
  beforeEach(() => {
    mockReset.mockClear();
  });

  it('should display error message', () => {
    const error = new Error('Failed to load article');
    render(<ArticleError error={error} reset={mockReset} />);
    
    expect(screen.getByText('文章加载失败')).toBeTruthy();
    expect(screen.getByText('Failed to load article')).toBeTruthy();
  });

  it('should display default message when error has no message', () => {
    const error = new Error();
    render(<ArticleError error={error} reset={mockReset} />);
    
    expect(screen.getByText(/抱歉，加载文章时遇到了问题/)).toBeTruthy();
  });

  it('should call reset function when retry button clicked', async () => {
    const error = new Error('Test error');
    render(<ArticleError error={error} reset={mockReset} />);
    
    const retryButton = screen.getByRole('button', { name: /重试/ });
    fireEvent.click(retryButton);
    
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('should have link to homepage', () => {
    const error = new Error('Test error');
    render(<ArticleError error={error} reset={mockReset} />);
    
    const homeLink = screen.getByRole('link', { name: /返回首页/ });
    expect(homeLink.getAttribute('href')).toBe('/');
  });

  it('should display error digest when present', () => {
    const error = Object.assign(new Error('Test error'), { 
      digest: 'error-12345' 
    });
    render(<ArticleError error={error} reset={mockReset} />);
    
    expect(screen.getByText(/error-12345/)).toBeTruthy();
  });

  it('should not display error digest when absent', () => {
    const error = new Error('Test error');
    render(<ArticleError error={error} reset={mockReset} />);
    
    expect(screen.queryByText(/错误代码:/)).toBeNull();
  });
});
