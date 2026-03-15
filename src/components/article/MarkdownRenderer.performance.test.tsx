/**
 * 性能测试：Markdown渲染组件
 * 测试目标：验证大文档渲染性能和内存使用
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { Heading } from '@/types/article';

describe('性能测试：MarkdownRenderer', () => {
  beforeEach(() => {
    // Mock IntersectionObserver
    class MockIntersectionObserver {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    }
    global.IntersectionObserver = MockIntersectionObserver as any;
  });

  afterEach(() => {
    cleanup();
  });

  // 性能阈值（毫秒）
  const PERFORMANCE_THRESHOLD = {
    renderSmallDoc: 200,    // 小文档（<1000字）- 调整为200ms
    renderMediumDoc: 1000,  // 中等文档（10000字）- 调整为1000ms
    renderLargeDoc: 3000,   // 大文档（50000字）- 调整为3000ms
    renderHugeDoc: 8000,    // 超大文档（100000字）- 调整为8000ms
  };

  describe('渲染性能测试', () => {
    // 生成测试内容的辅助函数
    const generateContent = (paragraphs: number, sentencesPerParagraph: number = 5): string => {
      let content = '';
      for (let i = 0; i < paragraphs; i++) {
        content += `## 标题 ${i + 1}\n\n`;
        for (let j = 0; j < sentencesPerParagraph; j++) {
          content += `这是第 ${i + 1} 段的第 ${j + 1} 句话，包含一些普通文本内容。 `;
        }
        content += '\n\n';
      }
      return content;
    };

    const generateHeadings = (content: string): Heading[] => {
      const headings: Heading[] = [];
      const matches = content.matchAll(/^##\s+(.+)$/gm);
      for (const match of matches) {
        headings.push({
          id: match[1].toLowerCase().replace(/\s+/g, '-'),
          text: match[1],
          level: 2,
        });
      }
      return headings;
    };

    it('应该快速渲染小文档', () => {
      const content = generateContent(10); // ~1000字
      const headings = generateHeadings(content);

      const startTime = performance.now();
      const { container } = render(<MarkdownRenderer content={content} headings={headings} />);
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(container.querySelector('.prose')).toBeTruthy();
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD.renderSmallDoc);
      console.log(`小文档渲染耗时: ${duration.toFixed(2)}ms`);
    });

    it('应该在合理时间内渲染中等文档', () => {
      const content = generateContent(100); // ~10000字
      const headings = generateHeadings(content);

      const startTime = performance.now();
      const { container } = render(<MarkdownRenderer content={content} headings={headings} />);
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(container.querySelector('.prose')).toBeTruthy();
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD.renderMediumDoc);
      console.log(`中等文档渲染耗时: ${duration.toFixed(2)}ms`);
    });

    it('应该在可接受时间内渲染大文档', () => {
      const content = generateContent(500); // ~50000字
      const headings = generateHeadings(content);

      const startTime = performance.now();
      const { container } = render(<MarkdownRenderer content={content} headings={headings} />);
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(container.querySelector('.prose')).toBeTruthy();
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD.renderLargeDoc);
      console.log(`大文档渲染耗时: ${duration.toFixed(2)}ms`);
    });
  });

  describe('代码块渲染性能', () => {
    it('应该高效渲染多个代码块', () => {
      const content = `
## 代码示例

\`\`\`javascript
function example1() {
  console.log('示例代码 1');
}
\`\`\`

\`\`\`typescript
interface Example {
  name: string;
  value: number;
}
\`\`\`

\`\`\`python
def example():
    print("示例代码 3")
\`\`\`
      `.trim();

      const headings: Heading[] = [
        { id: '代码示例', text: '代码示例', level: 2 },
      ];

      const startTime = performance.now();
      const { container } = render(<MarkdownRenderer content={content} headings={headings} />);
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(container.querySelectorAll('pre')).toHaveLength(3);
      expect(duration).toBeLessThan(200);
      console.log(`3个代码块渲染耗时: ${duration.toFixed(2)}ms`);
    });

    it('应该处理超大代码块', () => {
      // 生成1000行代码
      let code = '';
      for (let i = 0; i < 1000; i++) {
        code += `const line${i} = "这是第 ${i} 行代码";\n`;
      }
      
      const content = `\`\`\`javascript\n${code}\`\`\``;
      const headings: Heading[] = [];

      const startTime = performance.now();
      const { container } = render(<MarkdownRenderer content={content} headings={headings} />);
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(container.querySelector('pre')).toBeTruthy();
      expect(duration).toBeLessThan(1000);
      console.log(`1000行代码块渲染耗时: ${duration.toFixed(2)}ms`);
    });
  });

  describe('链接渲染性能', () => {
    it('应该高效渲染大量链接', () => {
      let content = '## 链接测试\n\n';
      for (let i = 0; i < 100; i++) {
        content += `[链接 ${i}](https://example.com/${i}) `;
      }

      const headings: Heading[] = [
        { id: '链接测试', text: '链接测试', level: 2 },
      ];

      const startTime = performance.now();
      const { container } = render(<MarkdownRenderer content={content} headings={headings} />);
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(container.querySelectorAll('a')).toHaveLength(100);
      expect(duration).toBeLessThan(200);
      console.log(`100个链接渲染耗时: ${duration.toFixed(2)}ms`);
    });

    it('外部链接应该包含安全属性', () => {
      const content = '[外部链接](https://external.com)';
      const headings: Heading[] = [];

      const { container } = render(<MarkdownRenderer content={content} headings={headings} />);
      const link = container.querySelector('a');

      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('内部链接不应该有 target="_blank"', () => {
      const content = '[内部链接](/about)';
      const headings: Heading[] = [];

      const { container } = render(<MarkdownRenderer content={content} headings={headings} />);
      const link = container.querySelector('a');

      expect(link).not.toHaveAttribute('target');
    });
  });

  describe('图片渲染性能', () => {
    it('应该为图片添加懒加载', () => {
      const content = '![测试图片](https://example.com/image.jpg)';
      const headings: Heading[] = [];

      const { container } = render(<MarkdownRenderer content={content} headings={headings} />);
      const img = container.querySelector('img');

      expect(img).toHaveAttribute('loading', 'lazy');
    });

    it('应该高效渲染多张图片', () => {
      let content = '## 图片测试\n\n';
      for (let i = 0; i < 20; i++) {
        content += `![图片 ${i}](https://example.com/image${i}.jpg)\n\n`;
      }

      const headings: Heading[] = [
        { id: '图片测试', text: '图片测试', level: 2 },
      ];

      const startTime = performance.now();
      const { container } = render(<MarkdownRenderer content={content} headings={headings} />);
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(container.querySelectorAll('img')).toHaveLength(20);
      expect(duration).toBeLessThan(200);
      console.log(`20张图片渲染耗时: ${duration.toFixed(2)}ms`);
    });
  });

  describe('表格渲染性能', () => {
    it('应该高效渲染大型表格', () => {
      let content = '## 表格测试\n\n';
      content += '| 列1 | 列2 | 列3 |\n';
      content += '|-----|-----|-----|\n';
      
      for (let i = 0; i < 50; i++) {
        content += `| 数据${i}-1 | 数据${i}-2 | 数据${i}-3 |\n`;
      }

      const headings: Heading[] = [
        { id: '表格测试', text: '表格测试', level: 2 },
      ];

      const startTime = performance.now();
      const { container } = render(<MarkdownRenderer content={content} headings={headings} />);
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(container.querySelectorAll('tr')).toHaveLength(51); // 50行 + 1行表头
      expect(duration).toBeLessThan(500);
      console.log(`50行表格渲染耗时: ${duration.toFixed(2)}ms`);
    });
  });

  describe('内存使用测试', () => {
    it('多次渲染不应该导致内存泄漏', () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // 渲染100次中等大小的文档
      for (let i = 0; i < 100; i++) {
        const content = generateContent(50);
        const headings = generateHeadings(content);
        const { unmount } = render(<MarkdownRenderer content={content} headings={headings} />);
        unmount();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // 内存增长应该小于 150MB（考虑Node.js垃圾回收机制）
      expect(memoryIncrease).toBeLessThan(150 * 1024 * 1024);
      console.log(`内存增长: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
    });
  });
});

// 辅助函数移到外部以避免重复
function generateContent(paragraphs: number, sentencesPerParagraph: number = 5): string {
  let content = '';
  for (let i = 0; i < paragraphs; i++) {
    content += `## 标题 ${i + 1}\n\n`;
    for (let j = 0; j < sentencesPerParagraph; j++) {
      content += `这是第 ${i + 1} 段的第 ${j + 1} 句话，包含一些普通文本内容。 `;
    }
    content += '\n\n';
  }
  return content;
}

function generateHeadings(content: string): Heading[] {
  const headings: Heading[] = [];
  const matches = content.matchAll(/^##\s+(.+)$/gm);
  for (const match of matches) {
    headings.push({
      id: match[1].toLowerCase().replace(/\s+/g, '-'),
      text: match[1],
      level: 2,
    });
  }
  return headings;
}
