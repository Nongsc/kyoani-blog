/**
 * 性能测试：文章数据获取层
 * 测试目标：验证大数据量下的性能表现
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { extractHeadings } from '@/lib/articles';

describe('性能测试：文章数据获取层', () => {
  // 性能阈值（毫秒）
  const PERFORMANCE_THRESHOLD = {
    extractHeadings: 100, // 100ms for 1000 headings
    generateExcerpt: 50,  // 50ms for large content
    relatedArticles: 200, // 200ms for 100 articles
  };

  describe('extractHeadings 性能测试', () => {
    it('应该在阈值时间内处理大量标题', () => {
      // 生成包含1000个标题的Markdown内容
      let content = '';
      for (let i = 0; i < 1000; i++) {
        content += `## 标题 ${i}\n\n内容段落 ${i}\n\n`;
      }

      const startTime = performance.now();
      const headings = extractHeadings(content);
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(headings.length).toBe(1000);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD.extractHeadings);
      console.log(`extractHeadings 处理 1000 个标题耗时: ${duration.toFixed(2)}ms`);
    });

    it('应该正确处理重复标题的ID生成', () => {
      const content = `
## 相同标题
## 相同标题
## 相同标题
## 相同标题
      `.trim();

      const headings = extractHeadings(content);

      expect(headings).toHaveLength(4);
      expect(headings[0].id).toBe('相同标题');
      expect(headings[1].id).toBe('相同标题-1');
      expect(headings[2].id).toBe('相同标题-2');
      expect(headings[3].id).toBe('相同标题-3');
    });

    it('应该正确处理中英文混合标题', () => {
      const content = `
## Introduction to React
## React 入门指南
## 2024 Best Practices
## 2024年最佳实践
      `.trim();

      const headings = extractHeadings(content);

      expect(headings).toHaveLength(4);
      expect(headings[0].id).toBe('introduction-to-react');
      expect(headings[1].id).toBe('react-入门指南');
      expect(headings[2].id).toBe('2024-best-practices');
      expect(headings[3].id).toBe('2024年最佳实践');
    });
  });

  describe('边界情况测试', () => {
    it('应该处理空内容', () => {
      const headings = extractHeadings('');
      expect(headings).toEqual([]);
    });

    it('应该处理没有标题的内容', () => {
      const content = '这是一段普通文本\n\n没有标题标记';
      const headings = extractHeadings(content);
      expect(headings).toEqual([]);
    });

    it('应该处理超长标题', () => {
      const longTitle = 'A'.repeat(1000);
      const content = `## ${longTitle}`;
      const headings = extractHeadings(content);
      
      expect(headings).toHaveLength(1);
      expect(headings[0].text.length).toBe(1000);
    });
  });
});
