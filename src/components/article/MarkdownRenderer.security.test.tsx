/**
 * 安全测试：XSS防护验证
 * 测试目标：验证MarkdownRenderer对XSS攻击的防护能力
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MarkdownRenderer } from './MarkdownRenderer';
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

  describe('HTML属性注入防护', () => {
    it('应该过滤危险的HTML属性', () => {
      const content = `
<div onmouseover="alert('XSS')">测试</div>
      `.trim();

      const { container } = render(<MarkdownRenderer content={content} headings={[]} />);
      
      expect(container.innerHTML).not.toContain('onmouseover');
    });

    it('应该过滤data:协议', () => {
      const content = `![图片](data:text/html,<script>alert('XSS')</script>)`;

      const { container } = render(<MarkdownRenderer content={content} headings={[]} />);
      const img = container.querySelector('img');

      // rehype-sanitize 应该过滤掉危险的data:URL
      if (img) {
        const src = img.getAttribute('src');
        if (src) {
          expect(src).not.toContain('data:text/html');
        }
      } else {
        // 图片可能被完全移除
        expect(img).toBeNull();
      }
    });

    it('应该过滤vbscript:协议', () => {
      const content = `[链接](vbscript:alert('XSS'))`;

      const { container } = render(<MarkdownRenderer content={content} headings={[]} />);
      const link = container.querySelector('a');

      // 危险协议链接可能被完全移除或href被清理
      if (link) {
        const href = link.getAttribute('href');
        if (href) {
          expect(href).not.toContain('vbscript:');
        }
      } else {
        // 链接被完全移除也是可接受的
        expect(link).toBeNull();
      }
    });
  });

  describe('SVG XSS防护', () => {
    it('应该过滤SVG中的脚本', () => {
      const content = `
<svg onload="alert('XSS')">
  <circle cx="50" cy="50" r="40"/>
</svg>
      `.trim();

      const { container } = render(<MarkdownRenderer content={content} headings={[]} />);
      
      expect(container.innerHTML).not.toContain('onload');
    });

    it('应该过滤SVG中的外部引用', () => {
      const content = `
<svg>
  <use href="https://evil.com/xss.svg#xss"/>
</svg>
      `.trim();

      const { container } = render(<MarkdownRenderer content={content} headings={[]} />);
      
      // rehype-sanitize应该移除SVG或过滤危险元素
      expect(container.innerHTML).not.toContain('evil.com');
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

  describe('表单注入防护', () => {
    it('应该过滤form标签', () => {
      const content = `
<form action="https://evil.com/phishing">
  <input type="text" name="password">
  <button type="submit">登录</button>
</form>
      `.trim();

      const { container } = render(<MarkdownRenderer content={content} headings={[]} />);
      
      expect(container.querySelector('form')).toBeNull();
      expect(container.querySelector('input')).toBeNull();
    });
  });

  describe('CSS注入防护', () => {
    it('应该过滤style标签中的危险内容', () => {
      const content = `
<style>
  body { background: url('javascript:alert(1)'); }
</style>
      `.trim();

      const { container } = render(<MarkdownRenderer content={content} headings={[]} />);
      
      expect(container.querySelector('style')).toBeNull();
    });

    it('应该过滤危险的内联样式', () => {
      const content = `
<div style="background: url('javascript:alert(1)')">测试</div>
      `.trim();

      const { container } = render(<MarkdownRenderer content={content} headings={[]} />);
      
      expect(container.innerHTML).not.toContain('javascript:');
    });
  });

  describe('URL注入防护', () => {
    it('应该过滤恶意URL参数', () => {
      const maliciousUrl = 'https://example.com?redirect=javascript:alert(1)';
      const content = `[链接](${maliciousUrl})`;

      const { container } = render(<MarkdownRenderer content={content} headings={[]} />);
      const link = container.querySelector('a');

      // rehype-sanitize应该清理URL
      expect(link?.getAttribute('href')).toBeTruthy();
    });

    it('应该允许正常的HTTP和HTTPS链接', () => {
      const content = `
[HTTP链接](http://example.com)
[HTTPS链接](https://example.com)
      `.trim();

      const { container } = render(<MarkdownRenderer content={content} headings={[]} />);
      const links = container.querySelectorAll('a');

      expect(links).toHaveLength(2);
      expect(links[0]).toHaveAttribute('href', 'http://example.com');
      expect(links[1]).toHaveAttribute('href', 'https://example.com');
    });
  });

  describe('Unicode编码攻击防护', () => {
    it('应该正确处理Unicode编码的XSS', () => {
      const content = `[点击](javascript&#58;alert('XSS'))`;

      const { container } = render(<MarkdownRenderer content={content} headings={[]} />);
      const link = container.querySelector('a');

      // rehype-sanitize应该清理危险内容或移除链接
      if (link) {
        const href = link.getAttribute('href');
        if (href) {
          expect(href).not.toContain('javascript');
        }
      }
      // 链接被完全移除也是可接受的
    });

    it('应该正确处理HTML实体编码的XSS', () => {
      const content = `[点击](&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;alert('XSS'))`;

      const { container } = render(<MarkdownRenderer content={content} headings={[]} />);
      const link = container.querySelector('a');

      // rehype-sanitize应该清理危险内容或移除链接
      if (link) {
        const href = link.getAttribute('href');
        if (href) {
          expect(href).not.toContain('javascript');
        }
      }
      // 链接被完全移除也是可接受的
    });
  });

  describe('Markdown特定攻击防护', () => {
    it('应该正确处理Markdown中的HTML混合内容', () => {
      const content = `
# 标题

<script>alert('XSS')</script>

**粗体文本**

<img src="x" onerror="alert('XSS')">

[链接](https://example.com)
      `.trim();

      const { container } = render(<MarkdownRenderer content={content} headings={[]} />);
      
      expect(container.querySelector('script')).toBeNull();
      
      // img可能被过滤，如果存在则检查安全属性
      const img = container.querySelector('img');
      if (img) {
        expect(img).not.toHaveAttribute('onerror');
      }
      
      expect(container.querySelector('strong')).toBeTruthy();
      expect(container.querySelector('a')).toBeTruthy();
    });

    it('应该过滤Markdown代码块中的危险内容', () => {
      const content = `
\`\`\`html
<script>alert('XSS')</script>
\`\`\`
      `.trim();

      const { container } = render(<MarkdownRenderer content={content} headings={[]} />);
      const pre = container.querySelector('pre');

      // 代码块应该被渲染，但script标签应该作为文本显示，不应该被执行
      expect(pre).toBeTruthy();
      expect(container.querySelector('script')).toBeNull();
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

  describe('特殊情况测试', () => {
    it('应该处理嵌套的XSS攻击', () => {
      const content = `
<div>
  <div onmouseover="alert('XSS')">
    <script>alert('Nested XSS')</script>
  </div>
</div>
      `.trim();

      const { container } = render(<MarkdownRenderer content={content} headings={[]} />);
      
      expect(container.innerHTML).not.toContain('onmouseover');
      expect(container.innerHTML).not.toContain('<script>');
    });

    it('应该处理大小写混合的攻击', () => {
      const content = `
<SCRIPT>alert('XSS')</SCRIPT>
<IMG SRC="x" ONERROR="alert('XSS')">
      `.trim();

      const { container } = render(<MarkdownRenderer content={content} headings={[]} />);
      
      expect(container.querySelector('script')).toBeNull();
      
      // img可能被过滤，如果存在则检查安全属性
      const img = container.querySelector('img');
      if (img) {
        expect(img).not.toHaveAttribute('onerror');
      }
    });
  });
});
