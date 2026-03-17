import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * 测试目标: 验证 sitemap.ts 生成的站点地图
 * 
 * 潜在问题:
 * 1. URL 格式不正确
 * 2. 缺少必要字段
 * 3. 优先级设置错误
 * 4. 环境变量未设置
 */

// Mock articles module
vi.mock('@/lib/articles', () => ({
  getAllArticles: vi.fn().mockResolvedValue([
    {
      slug: 'test-article',
      title: 'Test Article',
      date: '2024-01-01',
      updated_at: '2024-01-15',
    },
    {
      slug: 'another-article',
      title: 'Another Article',
      date: '2024-02-01',
      updated_at: null,
    },
  ]),
}));

// Import after mocking
import sitemap from '@/app/sitemap';

describe('sitemap.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate sitemap with correct structure', async () => {
    const result = await sitemap();
    
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should include static pages', async () => {
    const result = await sitemap();
    
    const homePage = result.find((item) => item.url.includes('/'));
    expect(homePage).toBeTruthy();
    expect(homePage?.priority).toBe(1);
    expect(homePage?.changeFrequency).toBe('daily');
  });

  it('should include article pages', async () => {
    const result = await sitemap();
    
    const articleUrls = result.filter((item) => item.url.includes('/article/'));
    expect(articleUrls.length).toBe(2);
  });

  it('should have valid URL format', async () => {
    const result = await sitemap();
    
    result.forEach((item) => {
      expect(item.url).toMatch(/^https?:\/\//);
    });
  });

  it('should have valid lastModified dates', async () => {
    const result = await sitemap();
    
    result.forEach((item) => {
      expect(item.lastModified).toBeInstanceOf(Date);
    });
  });

  it('should have valid priority values', async () => {
    const result = await sitemap();
    
    result.forEach((item) => {
      expect(item.priority).toBeGreaterThanOrEqual(0);
      expect(item.priority).toBeLessThanOrEqual(1);
    });
  });

  it('should handle missing NEXT_PUBLIC_SITE_URL', async () => {
    const originalEnv = process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.NEXT_PUBLIC_SITE_URL;
    
    const result = await sitemap();
    
    result.forEach((item) => {
      expect(item.url).toContain('kyoani-blog.vercel.app');
    });
    
    process.env.NEXT_PUBLIC_SITE_URL = originalEnv;
  });
});
