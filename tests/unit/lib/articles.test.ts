import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * 测试目标: 验证 articles.ts 中的工具函数
 * 
 * 潜在问题:
 * 1. 阅读时间计算错误
 * 2. 摘要生成截断问题
 * 3. 标题 ID 生成重复
 * 4. 空内容处理
 */

// Mock Supabase client before importing articles
vi.mock('@/lib/supabase/client', () => ({
  createSupabaseClient: vi.fn(() => ({
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    or: vi.fn().mockReturnThis(),
  })),
}));

// Import after mocking - use dynamic import for better control
const { extractHeadings } = await import('@/lib/articles');

describe('articles.ts utility functions', () => {
  describe('extractHeadings', () => {
    it('should extract all heading levels', () => {
      const content = `
# H1 Title
## H2 Title
### H3 Title
#### H4 Title
##### H5 Title
###### H6 Title
`;
      const headings = extractHeadings(content);
      
      expect(headings).toHaveLength(6);
      expect(headings[0].level).toBe(1);
      expect(headings[5].level).toBe(6);
    });

    it('should generate correct IDs', () => {
      const content = '# Hello World';
      const headings = extractHeadings(content);
      
      expect(headings[0].id).toBe('hello-world');
      expect(headings[0].text).toBe('Hello World');
    });

    it('should handle duplicate headings with unique IDs', () => {
      const content = `
# Title
## Section
## Section
# Title
`;
      const headings = extractHeadings(content);
      
      expect(headings[0].id).toBe('title');
      expect(headings[1].id).toBe('section');
      expect(headings[2].id).toBe('section-1');
      expect(headings[3].id).toBe('title-1');
    });

    it('should handle Chinese characters in headings', () => {
      const content = '# 这是中文标题';
      const headings = extractHeadings(content);
      
      expect(headings[0].id).toContain('这是中文标题');
      expect(headings[0].text).toBe('这是中文标题');
    });

    it('should handle special characters in headings', () => {
      const content = '# Hello World! @#$%';
      const headings = extractHeadings(content);
      
      expect(headings[0].id).toBe('hello-world');
    });

    it('should return empty array for content without headings', () => {
      const content = 'Just some text without headings.';
      const headings = extractHeadings(content);
      
      expect(headings).toEqual([]);
    });

    it('should handle empty content', () => {
      const headings = extractHeadings('');
      expect(headings).toEqual([]);
    });
  });
});
