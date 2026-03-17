/**
 * 安全测试：XSS防护验证
 * 测试目标：验证MarkdownRenderer对XSS攻击的防护能力
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MarkdownRenderer } from '@/components/article/MarkdownRenderer';
import { Heading } from '@/types/article';

describe('安全测试：XSS防护验证', () => {
  beforeEach(() => {
    class MockIntersectionObserver {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    }
    global.IntersectionObserver = MockIntersectionObserver as any;
  });

  describe('脚本标签防护', () => {
    it('应该过滤script标签', () => {
      const content = `
<script>alert('XSS')</script>

# 标题
      `.trim();

      const { container } = render(<MarkdownRenderer content={content} headings={[]} />);
      
      expect(container.querySelector('script')).toBeNull();
      expect(container.textContent).not.toContain("alert('XSS')");
    });

    it('应该过滤内联事件处理器', () => {
      const content = `
<img src="x" onerror="alert('XSS')">
      `.trim();

      const { container } = render(<MarkdownRenderer content={content} headings={[]} />);
      const img = container.querySelector('img');

      // img可能被过滤，如果存在则检查安全属性
      if (img) {
        expect(img).not.toHaveAttribute('onerror');
      } else {
        // img被完全移除也是可接受的
        expect(img).toBeNull();
      }
    });

    it('应该过滤javascript:协议', () => {
      const content = `[点击](javascript:alert('XSS'))`;

      const { container } = render(<MarkdownRenderer content={content} headings={[]} />);
      const link = container.querySelector('a');

      // rehype-sanitize应该完全移除危险链接或清理href
      if (link) {
        const href = link.getAttribute('href');
        if (href) {
          expect(href).not.toContain('javascript');
        }
      } else {
        // 链接可能被完全移除
        expect(link).toBeNull();
      }
    });
  });

  describe('Iframe注入防护', () => {
    it('应该过滤iframe标签', () => {
      const content = `
<iframe src="https://evil.com" width="0" height="0"></iframe>
      `.trim();

      const { container } = render(<MarkdownRenderer content={content} headings={[]} />);
      
      expect(container.querySelector('iframe')).toBeNull();
    });
  });

  describe('外部链接安全属性', () => {
    it('应该为所有外部链接添加noopener noreferrer', () => {
      const content = `
[外部链接1](https://external1.com)
[外部链接2](https://external2.com)
[内部链接](/about)
      `.trim();

      const { container } = render(<MarkdownRenderer content={content} headings={[]} />);
      const links = container.querySelectorAll('a');

      expect(links[0]).toHaveAttribute('target', '_blank');
      expect(links[0]).toHaveAttribute('rel', 'noopener noreferrer');
      
      expect(links[1]).toHaveAttribute('target', '_blank');
      expect(links[1]).toHaveAttribute('rel', 'noopener noreferrer');
      
      expect(links[2]).not.toHaveAttribute('target');
    });
  });
});
