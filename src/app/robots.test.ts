import { describe, it, expect, vi, beforeEach } from 'vitest';
import robots from './robots';

/**
 * 测试目标: 验证 robots.ts 生成的爬虫规则
 * 
 * 潜在问题:
 * 1. 规则格式不正确
 * 2. 缺少 sitemap URL
 * 3. 敏感路径未禁止
 */

describe('robots.ts', () => {
  it('should generate robots.txt with correct structure', () => {
    const result = robots();
    
    expect(result).toHaveProperty('rules');
    expect(result).toHaveProperty('sitemap');
  });

  it('should allow all user agents by default', () => {
    const result = robots();
    
    expect(Array.isArray(result.rules)).toBe(true);
    const rule = result.rules[0] as { userAgent: string; allow: string; disallow: string[] };
    expect(rule.userAgent).toBe('*');
    expect(rule.allow).toBe('/');
  });

  it('should disallow admin and API paths', () => {
    const result = robots();
    
    const rule = result.rules[0] as { userAgent: string; allow: string; disallow: string[] };
    expect(rule.disallow).toContain('/api/');
    expect(rule.disallow).toContain('/admin/');
  });

  it('should include sitemap URL', () => {
    const result = robots();
    
    expect(result.sitemap).toMatch(/^https?:\/\//);
    expect(result.sitemap).toContain('/sitemap.xml');
  });

  it('should use fallback URL when NEXT_PUBLIC_SITE_URL is not set', () => {
    const originalEnv = process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.NEXT_PUBLIC_SITE_URL;
    
    const result = robots();
    expect(result.sitemap).toContain('kyoani-blog.vercel.app');
    
    process.env.NEXT_PUBLIC_SITE_URL = originalEnv;
  });

  it('should use custom URL when NEXT_PUBLIC_SITE_URL is set', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://custom-domain.com';
    
    const result = robots();
    expect(result.sitemap).toContain('custom-domain.com');
    
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });
});
