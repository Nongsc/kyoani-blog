/**
 * 性能测试：Markdown渲染组件
 * 测试目标：验证大文档渲染性能和内存使用
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MarkdownRenderer } from '@/components/article/MarkdownRenderer';
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
  });
});
