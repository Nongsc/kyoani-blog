/**
 * 安全测试：外部链接和内容安全策略(CSP)
 * 测试目标：验证外部资源加载和链接安全性
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { MarkdownRenderer } from '@/components/article/MarkdownRenderer';
import { Heading } from '@/types/article';

describe('安全测试：外部链接和CSP', () => {
  beforeEach(() => {
    class MockIntersectionObserver {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    }
    global.IntersectionObserver = MockIntersectionObserver as any;
  });

  describe('外部链接安全属性', () => {
    it('所有外部链接应该有rel="noopener noreferrer"', () => {
      const content = `
[外部1](https://example1.com)
[外部2](http://example2.com)
[外部3](https://example3.com/path?query=value)
      `.trim();

      const { container } = render(<MarkdownRenderer content={content} headings={[]} />);
      const links = container.querySelectorAll('a');

      links.forEach(link => {
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });

    it('内部链接不应该有target="_blank"', () => {
      const content = `
[内部链接1](/about)
[内部链接2](/articles/123)
[内部链接3](/tags/react)
      `.trim();

      const { container } = render(<MarkdownRenderer content={content} headings={[]} />);
      const links = container.querySelectorAll('a');

      links.forEach(link => {
        expect(link).not.toHaveAttribute('target', '_blank');
        expect(link).not.toHaveAttribute('rel', 'noopener noreferrer');
      });
    });
  });

  describe('图片安全', () => {
    it('图片应该有lazy loading属性', () => {
      const content = `
![图片1](https://example.com/image1.jpg)
![图片2](https://example.com/image2.jpg)
      `.trim();

      const { container } = render(<MarkdownRenderer content={content} headings={[]} />);
      const images = container.querySelectorAll('img');

      images.forEach(img => {
        expect(img).toHaveAttribute('loading', 'lazy');
      });
    });

    it('图片应该有alt属性', () => {
      const content = '![描述文本](https://example.com/image.jpg)';

      const { container } = render(<MarkdownRenderer content={content} headings={[]} />);
      const img = container.querySelector('img');

      expect(img).toHaveAttribute('alt', '描述文本');
    });
  });

  describe('隐私保护', () => {
    it('外部链接应该防止Referrer泄露', () => {
      const content = '[外部链接](https://external.com)';

      const { container } = render(<MarkdownRenderer content={content} headings={[]} />);
      const link = container.querySelector('a');

      // noreferrer应该防止Referer头泄露
      expect(link).toHaveAttribute('rel');
      expect(link?.getAttribute('rel')).toContain('noreferrer');
    });

    it('noopener应该防止opener攻击', () => {
      const content = '[外部链接](https://external.com)';

      const { container } = render(<MarkdownRenderer content={content} headings={[]} />);
      const link = container.querySelector('a');

      // noopener应该防止window.opener攻击
      expect(link).toHaveAttribute('rel');
      expect(link?.getAttribute('rel')).toContain('noopener');
    });
  });
});
