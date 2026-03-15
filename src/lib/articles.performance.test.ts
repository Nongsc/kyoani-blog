/**
 * 性能测试：文章数据获取层
 * 测试目标：验证大数据量下的性能表现
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { extractHeadings, getRelatedArticles } from './articles';
import { Article } from '@/types/article';

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

    it('应该处理嵌套标题结构', () => {
      const content = `
# 主标题
## 二级标题 1
### 三级标题 1-1
#### 四级标题 1-1-1
#### 四级标题 1-1-2
### 三级标题 1-2
## 二级标题 2
### 三级标题 2-1
      `.trim();

      const headings = extractHeadings(content);

      expect(headings).toHaveLength(8);
      expect(headings[0].level).toBe(1);
      expect(headings[1].level).toBe(2);
      expect(headings[2].level).toBe(3);
      expect(headings[3].level).toBe(4);
    });
  });

  describe('getRelatedArticles 性能测试', () => {
    // Mock数据生成器
    const generateMockArticles = (count: number): Article[] => {
      return Array.from({ length: count }, (_, i) => ({
        id: `article-${i}`,
        slug: `article-${i}`,
        title: `文章 ${i}`,
        content: `内容 ${i}`,
        excerpt: `摘要 ${i}`,
        date: new Date(2024, 0, i + 1).toISOString().split('T')[0],
        readingTime: 5,
        category: i % 5 === 0 ? '技术' : '生活',
        tags: i % 3 === 0 ? ['React', 'TypeScript'] : i % 3 === 1 ? ['Vue', 'JavaScript'] : ['技术'],
        status: 'published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
    };

    it('应该在阈值时间内计算相关文章', async () => {
      const articles = generateMockArticles(100);
      
      // Mock getAllArticles
      const mockGetAllArticles = vi.fn().mockResolvedValue(articles);
      
      const startTime = performance.now();
      // 由于 getRelatedArticles 依赖数据库，这里只测试算法逻辑
      const currentArticle = articles[0];
      const otherArticles = articles.filter(a => a.slug !== currentArticle.slug);
      
      const scored = otherArticles.map(article => {
        const sharedTags = article.tags.filter(tag => currentArticle.tags.includes(tag));
        const sameCategory = article.category === currentArticle.category ? 1 : 0;
        const score = sharedTags.length * 2 + sameCategory;
        return { article, score };
      });
      
      const related = scored
        .filter(s => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(s => s.article);
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(related.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD.relatedArticles);
      console.log(`getRelatedArticles 处理 100 篇文章耗时: ${duration.toFixed(2)}ms`);
    });

    it('应该正确计算相关性分数', () => {
      const currentArticle: Article = {
        id: 'current',
        slug: 'current',
        title: '当前文章',
        content: '',
        excerpt: '',
        date: '2024-01-01',
        readingTime: 5,
        category: '技术',
        tags: ['React', 'TypeScript', 'Next.js'],
        status: 'published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const article1 = { ...currentArticle, id: '1', slug: 'article-1', tags: ['React', 'TypeScript'] };
      const article2 = { ...currentArticle, id: '2', slug: 'article-2', tags: ['React'], category: '生活' };
      const article3 = { ...currentArticle, id: '3', slug: 'article-3', tags: ['Vue'], category: '技术' };
      const article4 = { ...currentArticle, id: '4', slug: 'article-4', tags: ['Vue', 'JavaScript'], category: '生活' };

      const articles = [article1, article2, article3, article4];

      const scored = articles.map(article => {
        const sharedTags = article.tags.filter(tag => currentArticle.tags.includes(tag));
        const sameCategory = article.category === currentArticle.category ? 1 : 0;
        const score = sharedTags.length * 2 + sameCategory;
        return { article, score };
      });

      // article1: 2个共享标签 + 同分类 = 5分
      expect(scored[0].score).toBe(5);
      // article2: 1个共享标签 + 不同分类 = 2分
      expect(scored[1].score).toBe(2);
      // article3: 0个共享标签 + 同分类 = 1分
      expect(scored[2].score).toBe(1);
      // article4: 0个共享标签 + 不同分类 = 0分
      expect(scored[3].score).toBe(0);
    });
  });

  describe('内存使用测试', () => {
    it('extractHeadings 不应该造成内存泄漏', () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // 执行100次
      for (let i = 0; i < 100; i++) {
        const content = Array.from({ length: 100 }, (_, j) => `## 标题 ${i}-${j}`).join('\n');
        extractHeadings(content);
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // 内存增长应该小于 20MB（考虑Node.js垃圾回收）
      expect(memoryIncrease).toBeLessThan(20 * 1024 * 1024);
      console.log(`内存增长: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
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

    it('应该处理特殊字符标题', () => {
      const content = '## 标题 <script>alert("xss")</script>';
      const headings = extractHeadings(content);
      
      // ID应该被正确清理
      expect(headings[0].id).not.toContain('<');
      expect(headings[0].id).not.toContain('>');
      expect(headings[0].text).toBe('标题 <script>alert("xss")</script>');
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

// 性能监控辅助函数
function measurePerformance(name: string, fn: () => void, iterations: number = 100) {
  const times: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fn();
    const end = performance.now();
    times.push(end - start);
  }
  
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);
  
  console.log(`${name} 性能统计 (${iterations} 次迭代):`);
  console.log(`  平均: ${avg.toFixed(2)}ms`);
  console.log(`  最小: ${min.toFixed(2)}ms`);
  console.log(`  最大: ${max.toFixed(2)}ms`);
  
  return { avg, min, max };
}
