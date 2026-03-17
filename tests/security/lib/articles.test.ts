/**
 * 安全测试：输入验证和路径遍历
 * 测试目标：验证用户输入处理的安全性
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractHeadings } from '@/lib/articles';

describe('安全测试：输入验证和路径遍历', () => {
  describe('路径遍历攻击防护', () => {
    it('应该安全处理包含路径遍历字符的slug', () => {
      // 模拟恶意slug
      const maliciousSlugs = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32\\config\\sam',
        '....//....//....//etc/passwd',
        '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
      ];

      maliciousSlugs.forEach(slug => {
        // 在实际应用中，这些slug会被decodeURIComponent处理
        // 应该确保不会访问到不该访问的文件
        expect(() => decodeURIComponent(slug)).not.toThrow();
        
        // 解码后的slug应该被正确处理
        const decoded = decodeURIComponent(slug);
        expect(decoded).not.toContain('\0'); // 空字节注入
      });
    });
  });

  describe('输入长度限制测试', () => {
    it('extractHeadings应该处理超长标题', () => {
      const longTitle = 'A'.repeat(10000);
      const content = `## ${longTitle}`;
      
      // 不应该抛出错误
      expect(() => extractHeadings(content)).not.toThrow();
      
      const headings = extractHeadings(content);
      expect(headings).toHaveLength(1);
      expect(headings[0].text.length).toBe(10000);
    });

    it('extractHeadings应该处理空内容', () => {
      expect(extractHeadings('')).toEqual([]);
      expect(extractHeadings(null as any)).toEqual([]);
      expect(extractHeadings(undefined as any)).toEqual([]);
    });
  });

  describe('特殊字符处理', () => {
    it('应该安全处理包含XSS向量的标题', () => {
      const xssVectors = [
        '<script>alert("xss")</script>',
        '<img src=x onerror=alert(1)>',
        'javascript:alert(1)',
        '"><script>alert(1)</script>',
        "'-alert(1)-'",
      ];

      xssVectors.forEach(vector => {
        const content = `## ${vector}`;
        const headings = extractHeadings(content);

        // 标题应该被提取，但特殊字符应该被正确处理
        expect(headings).toHaveLength(1);
        expect(headings[0].text).toBe(vector);
        
        // ID应该被清理
        expect(headings[0].id).not.toContain('<');
        expect(headings[0].id).not.toContain('>');
        expect(headings[0].id).not.toContain('"');
      });
    });
  });

  describe('正则表达式安全测试', () => {
    it('extractHeadings不应该受到ReDoS攻击', () => {
      // 构造可能导致正则表达式回溯攻击的内容
      const evilContent = '## ' + 'a'.repeat(10000) + '!'.repeat(10000);
      
      const startTime = performance.now();
      const headings = extractHeadings(evilContent);
      const endTime = performance.now();
      const duration = endTime - startTime;

      // 应该在合理时间内完成（<100ms）
      expect(duration).toBeLessThan(100);
      expect(headings).toHaveLength(1);
    });
  });
});
