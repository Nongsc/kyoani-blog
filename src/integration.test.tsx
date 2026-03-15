/**
 * 集成测试：完整用户流程
 * 测试目标：验证从数据获取到渲染的完整流程
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MarkdownRenderer } from './components/article/MarkdownRenderer';
import { extractHeadings } from './lib/articles';
import { Heading, Article } from './types/article';

describe('集成测试：完整用户流程', () => {
  beforeEach(() => {
    class MockIntersectionObserver {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    }
    global.IntersectionObserver = MockIntersectionObserver as any;
  });

  describe('文章渲染流程', () => {
    it('应该正确渲染完整的Markdown文章', () => {
      const articleContent = `
# 文章标题

这是一篇完整的文章示例。

## 第一章

这是第一章的内容，包含**粗体**和*斜体*文本。

### 1.1 子章节

列表示例：
- 项目1
- 项目2
- 项目3

代码示例：
\`\`\`javascript
function hello() {
  console.log('Hello, World!');
}
\`\`\`

## 第二章

表格示例：

| 列1 | 列2 | 列3 |
|-----|-----|-----|
| 数据1 | 数据2 | 数据3 |

引用示例：

> 这是一段引用文本

链接和图片示例：

[访问官网](https://example.com)

![示例图片](https://example.com/image.jpg)
      `.trim();

      const headings = extractHeadings(articleContent);
      const { container } = render(<MarkdownRenderer content={articleContent} headings={headings} />);

      // 验证标题渲染
      expect(container.querySelector('h1')).toBeTruthy();
      expect(container.querySelectorAll('h2').length).toBeGreaterThan(0);
      expect(container.querySelectorAll('h3').length).toBeGreaterThan(0);

      // 验证文本格式
      expect(container.querySelector('strong')).toBeTruthy();
      expect(container.querySelector('em')).toBeTruthy();

      // 验证列表
      expect(container.querySelector('ul')).toBeTruthy();
      expect(container.querySelectorAll('li').length).toBeGreaterThan(0);

      // 验证代码块
      expect(container.querySelector('pre')).toBeTruthy();
      expect(container.querySelector('code')).toBeTruthy();

      // 验证表格
      expect(container.querySelector('table')).toBeTruthy();
      expect(container.querySelectorAll('th').length).toBeGreaterThan(0);
      expect(container.querySelectorAll('td').length).toBeGreaterThan(0);

      // 验证引用
      expect(container.querySelector('blockquote')).toBeTruthy();

      // 验证链接和图片
      expect(container.querySelector('a')).toBeTruthy();
      expect(container.querySelector('img')).toBeTruthy();
    });

    it('标题ID应该与目录导航匹配', () => {
      const content = `
# 主标题
## 章节一
### 子章节1-1
### 子章节1-2
## 章节二
### 子章节2-1
      `.trim();

      const headings = extractHeadings(content);
      const { container } = render(<MarkdownRenderer content={content} headings={headings} />);

      // 验证每个标题都有对应的ID
      headings.forEach(heading => {
        const element = container.querySelector(`#${CSS.escape(heading.id)}`);
        expect(element).toBeTruthy();
        expect(element?.textContent).toContain(heading.text);
      });
    });

    it('重复标题应该有唯一ID', () => {
      const content = `
## 介绍
## 介绍
## 介绍
      `.trim();

      const headings = extractHeadings(content);
      const { container } = render(<MarkdownRenderer content={content} headings={headings} />);

      // 验证ID唯一性
      const ids = headings.map(h => h.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(headings.length);

      // 验证DOM中的ID也是唯一的
      const h2Elements = container.querySelectorAll('h2');
      const domIds = Array.from(h2Elements).map(el => el.id);
      const uniqueDomIds = new Set(domIds);
      expect(uniqueDomIds.size).toBe(h2Elements.length);
    });
  });

  describe('安全性和性能集成测试', () => {
    it('应该安全渲染包含XSS向量的文章', () => {
      const maliciousContent = `
# 正常标题

<script>alert('XSS')</script>

**粗体文本**

<img src="x" onerror="alert('XSS')">

[恶意链接](javascript:alert('XSS'))

<iframe src="https://evil.com"></iframe>

正常内容继续...
      `.trim();

      const headings = extractHeadings(maliciousContent);
      const { container } = render(<MarkdownRenderer content={maliciousContent} headings={headings} />);

      // 验证恶意内容被过滤
      expect(container.querySelector('script')).toBeNull();
      expect(container.querySelector('iframe')).toBeNull();
      expect(container.innerHTML).not.toContain('javascript:alert');
      expect(container.innerHTML).not.toContain('onerror');

      // 验证正常内容被渲染
      expect(container.querySelector('h1')).toBeTruthy();
      expect(container.querySelector('strong')).toBeTruthy();
    });

    it('应该正确处理大型文章', () => {
      // 生成大型文章（10000字）
      let largeContent = '# 大型文章\n\n';
      for (let i = 0; i < 100; i++) {
        largeContent += `## 章节 ${i}\n\n`;
        for (let j = 0; j < 10; j++) {
          largeContent += `这是第 ${i} 章节的第 ${j} 段内容。 `;
        }
        largeContent += '\n\n';
      }

      const startTime = performance.now();
      const headings = extractHeadings(largeContent);
      const { container } = render(<MarkdownRenderer content={largeContent} headings={headings} />);
      const endTime = performance.now();

      const duration = endTime - startTime;

      // 验证性能在可接受范围内
      expect(duration).toBeLessThan(3000); // 3秒
      expect(headings.length).toBe(101); // 1个主标题 + 100个章节

      // 验证内容正确渲染
      expect(container.querySelectorAll('h2').length).toBe(100);
    });
  });

  describe('外部链接安全集成测试', () => {
    it('所有外部链接应该有安全属性', () => {
      const content = `
[外部1](https://example1.com)
[内部](/about)
[外部2](https://example2.com)
[邮箱](mailto:test@example.com)
[外部3](http://example3.com)
      `.trim();

      const { container } = render(<MarkdownRenderer content={content} headings={[]} />);
      const links = Array.from(container.querySelectorAll('a'));

      const externalLinks = links.filter(link => {
        const href = link.getAttribute('href');
        return href && (href.startsWith('http://') || href.startsWith('https://'));
      });

      externalLinks.forEach(link => {
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });

      // 内部链接和邮箱链接不应该有target="_blank"
      const internalLink = links.find(link => link.getAttribute('href') === '/about');
      expect(internalLink).not.toHaveAttribute('target', '_blank');

      const mailtoLink = links.find(link => link.getAttribute('href')?.startsWith('mailto:'));
      expect(mailtoLink).not.toHaveAttribute('target', '_blank');
    });
  });

  describe('图片渲染集成测试', () => {
    it('所有图片应该有lazy loading和alt属性', () => {
      const content = `
![图片1](https://example.com/image1.jpg)
![图片2](https://example.com/image2.jpg)
![](https://example.com/decorative.jpg)
      `.trim();

      const { container } = render(<MarkdownRenderer content={content} headings={[]} />);
      const images = container.querySelectorAll('img');

      expect(images.length).toBe(3);

      images.forEach(img => {
        expect(img).toHaveAttribute('loading', 'lazy');
        expect(img).toHaveAttribute('alt'); // alt属性应该存在（可以为空）
      });
    });
  });

  describe('代码块渲染集成测试', () => {
    it('应该正确渲染多种语言的代码块', () => {
      const content = `
\`\`\`javascript
const js = 'JavaScript';
\`\`\`

\`\`\`typescript
const ts: string = 'TypeScript';
\`\`\`

\`\`\`python
python = 'Python'
\`\`\`

\`\`\`rust
let rust = "Rust";
\`\`\`
      `.trim();

      const { container } = render(<MarkdownRenderer content={content} headings={[]} />);
      const codeBlocks = container.querySelectorAll('pre');

      expect(codeBlocks.length).toBe(4);
      
      // 验证代码块被正确渲染
      codeBlocks.forEach(block => {
        expect(block.querySelector('code')).toBeTruthy();
      });
    });
  });

  describe('目录导航集成测试', () => {
    it('应该为所有标题生成正确的ID', () => {
      const content = `
# 主标题
## 第二章
### 第二章第一节
#### 第二章第一节小节
##### 五级标题
###### 六级标题
      `.trim();

      const headings = extractHeadings(content);
      const { container } = render(<MarkdownRenderer content={content} headings={headings} />);

      // 验证每个级别的标题都有ID
      expect(container.querySelector('h1')?.id).toBeTruthy();
      expect(container.querySelector('h2')?.id).toBeTruthy();
      expect(container.querySelector('h3')?.id).toBeTruthy();
      expect(container.querySelector('h4')?.id).toBeTruthy();
      expect(container.querySelector('h5')?.id).toBeTruthy();
      expect(container.querySelector('h6')?.id).toBeTruthy();

      // 验证headingIdMap正确性
      headings.forEach(heading => {
        const element = container.querySelector(`#${CSS.escape(heading.id)}`);
        expect(element).toBeTruthy();
      });
    });
  });

  describe('边界情况集成测试', () => {
    it('应该正确处理空文章', () => {
      const content = '';
      const headings = extractHeadings(content);
      const { container } = render(<MarkdownRenderer content={content} headings={headings} />);

      expect(container.querySelector('.prose')).toBeTruthy();
      expect(container.textContent?.trim()).toBe('');
    });

    it('应该正确处理只有空格的文章', () => {
      const content = '   \n\n   \n   ';
      const headings = extractHeadings(content);
      const { container } = render(<MarkdownRenderer content={content} headings={headings} />);

      expect(container.querySelector('.prose')).toBeTruthy();
    });

    it('应该正确处理纯文本文章（无Markdown格式）', () => {
      const content = '这是一段纯文本，没有任何Markdown格式。';
      const headings = extractHeadings(content);
      const { container } = render(<MarkdownRenderer content={content} headings={headings} />);

      expect(container.textContent).toContain('这是一段纯文本');
      expect(headings).toEqual([]);
    });

    it('应该正确处理HTML实体', () => {
      const content = `
# 标题 &amp; 符号

内容中包含 &lt;标签&gt; 和 &amp; 符号。

\`\`\`
代码块中的 &lt;tag&gt;
\`\`\`
      `.trim();

      const headings = extractHeadings(content);
      const { container } = render(<MarkdownRenderer content={content} headings={headings} />);

      // HTML实体应该被正确解析
      expect(container.textContent).toContain('&');
      expect(container.textContent).toContain('<标签>');
    });
  });
});
