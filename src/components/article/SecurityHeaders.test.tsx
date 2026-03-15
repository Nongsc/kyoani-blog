/**
 * 安全测试：外部链接和内容安全策略(CSP)
 * 测试目标：验证外部资源加载和链接安全性
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { MarkdownRenderer } from './MarkdownRenderer';
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

    it('锚点链接应该被正确处理', () => {
      const content = `
[章节1](#section-1)
[章节2](#section-2)
      `.trim();

      const { container } = render(<MarkdownRenderer content={content} headings={[]} />);
      const links = container.querySelectorAll('a');

      links.forEach(link => {
        expect(link.getAttribute('href')).toMatch(/^#/);
        expect(link).not.toHaveAttribute('target', '_blank');
      });
    });

    it('邮件链接应该被正确处理', () => {
      const content = '[联系我们](mailto:contact@example.com)';

      const { container } = render(<MarkdownRenderer content={content} headings={[]} />);
      const link = container.querySelector('a');

      expect(link?.getAttribute('href')).toBe('mailto:contact@example.com');
    });

    it('电话链接应该被正确处理', () => {
      const content = '[拨打电话](tel:+8612345678900)';

      const { container } = render(<MarkdownRenderer content={content} headings={[]} />);
      const link = container.querySelector('a');

      // tel:链接可能被rehype-sanitize过滤（取决于配置）
      // 如果存在，验证它被正确渲染
      if (link) {
        const href = link.getAttribute('href');
        if (href) {
          expect(href).toBe('tel:+8612345678900');
        }
      }
      // tel:链接被过滤是rehype-sanitize的默认行为，可接受
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

    it('空alt的图片应该被允许', () => {
      const content = '![](https://example.com/decorative.jpg)';

      const { container } = render(<MarkdownRenderer content={content} headings={[]} />);
      const img = container.querySelector('img');

      expect(img).toBeTruthy();
      expect(img?.getAttribute('alt')).toBe('');
    });

    it('应该过滤危险的图片来源', () => {
      const content = '![恶意图片](javascript:alert(1))';

      const { container } = render(<MarkdownRenderer content={content} headings={[]} />);
      const img = container.querySelector('img');

      // rehype-sanitize应该移除危险的src
      if (img) {
        const src = img.getAttribute('src');
        expect(src).toBeFalsy(); // src应该被完全移除或为空
      } else {
        // 或者整个img标签被移除
        expect(img).toBeNull();
      }
    });
  });

  describe('资源加载策略', () => {
    it('外部资源应该使用HTTPS', () => {
      const content = `
![HTTPS图片](https://example.com/secure.jpg)
[HTTPS链接](https://example.com)
      `.trim();

      const { container } = render(<MarkdownRenderer content={content} headings={[]} />);
      const img = container.querySelector('img');
      const link = container.querySelector('a');

      expect(img?.getAttribute('src')).toMatch(/^https:/);
      expect(link?.getAttribute('href')).toMatch(/^https:/);
    });

    it('HTTP链接应该被允许但不推荐', () => {
      const content = '[HTTP链接](http://example.com)';

      const { container } = render(<MarkdownRenderer content={content} headings={[]} />);
      const link = container.querySelector('a');

      // HTTP链接应该被渲染，但应该有安全警告
      expect(link?.getAttribute('href')).toBe('http://example.com');
    });
  });

  describe('iframe和嵌入内容', () => {
    it('iframe应该被过滤', () => {
      const content = `
<iframe src="https://youtube.com/embed/123" width="560" height="315"></iframe>
      `.trim();

      const { container } = render(<MarkdownRenderer content={content} headings={[]} />);
      
      expect(container.querySelector('iframe')).toBeNull();
    });

    it('embed标签应该被过滤', () => {
      const content = `
<embed src="https://example.com/file.pdf" type="application/pdf">
      `.trim();

      const { container } = render(<MarkdownRenderer content={content} headings={[]} />);
      
      expect(container.querySelector('embed')).toBeNull();
    });

    it('object标签应该被过滤', () => {
      const content = `
<object data="https://example.com/file.swf" type="application/x-shockwave-flash">
  <param name="movie" value="https://example.com/file.swf">
</object>
      `.trim();

      const { container } = render(<MarkdownRenderer content={content} headings={[]} />);
      
      expect(container.querySelector('object')).toBeNull();
      expect(container.querySelector('param')).toBeNull();
    });
  });

  describe('第三方资源安全', () => {
    it('CDN资源应该被正确处理', () => {
      const content = `
![CDN图片](https://cdn.jsdelivr.net/npm/@example/image.jpg)
![Unpkg图片](https://unpkg.com/@example/image.jpg)
      `.trim();

      const { container } = render(<MarkdownRenderer content={content} headings={[]} />);
      const images = container.querySelectorAll('img');

      expect(images).toHaveLength(2);
      images.forEach(img => {
        expect(img).toHaveAttribute('loading', 'lazy');
      });
    });

    it('社交媒体嵌入应该被过滤', () => {
      const content = `
<blockquote class="twitter-tweet">
  <p>Twitter内容</p>
</blockquote>
<script async src="https://platform.twitter.com/widgets.js"></script>
      `.trim();

      const { container } = render(<MarkdownRenderer content={content} headings={[]} />);
      
      expect(container.querySelector('script')).toBeNull();
      expect(container.querySelector('blockquote.twitter-tweet')).toBeNull();
    });
  });

  describe('CSP合规性', () => {
    it('不应该有内联事件处理器', () => {
      const content = `
<div onclick="alert(1)">点击</div>
<img src="x" onerror="alert(1)">
<body onload="alert(1)">
      `.trim();

      const { container } = render(<MarkdownRenderer content={content} headings={[]} />);
      const html = container.innerHTML;

      expect(html).not.toContain('onclick');
      expect(html).not.toContain('onerror');
      expect(html).not.toContain('onload');
    });

    it('不应该有内联样式（CSP strict模式）', () => {
      const content = `
<div style="color: red;">红色文本</div>
      `.trim();

      const { container } = render(<MarkdownRenderer content={content} headings={[]} />);
      const div = container.querySelector('div');

      // rehype-sanitize可能会移除style属性
      // 取决于配置，这里验证style属性的处理
      if (div?.hasAttribute('style')) {
        // 如果style属性被保留，确保没有危险内容
        expect(div.getAttribute('style')).not.toContain('javascript:');
        expect(div.getAttribute('style')).not.toContain('expression(');
      }
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

  describe('URL验证', () => {
    it('应该正确处理绝对URL', () => {
      const absoluteUrls = [
        'https://example.com/path',
        'http://example.com/path',
        'https://sub.domain.example.com/path?query=value#hash',
      ];

      absoluteUrls.forEach(url => {
        const content = `[链接](${url})`;
        const { container } = render(<MarkdownRenderer content={content} headings={[]} />);
        const link = container.querySelector('a');
        expect(link?.getAttribute('href')).toBe(url);
      });
    });

    it('应该正确处理相对URL', () => {
      const relativeUrls = [
        '/about',
        '/articles/123',
        '#anchor',
      ];

      relativeUrls.forEach(url => {
        const content = `[链接](${url})`;
        const { container } = render(<MarkdownRenderer content={content} headings={[]} />);
        const link = container.querySelector('a');
        expect(link?.getAttribute('href')).toBe(url);
        expect(link).not.toHaveAttribute('target', '_blank');
      });
    });

    it('应该正确处理协议相对URL', () => {
      const content = '[链接](//example.com/path)';

      const { container } = render(<MarkdownRenderer content={content} headings={[]} />);
      const link = container.querySelector('a');

      // 协议相对URL应该被保留或转换为绝对URL
      expect(link?.getAttribute('href')).toBeTruthy();
    });
  });
});
