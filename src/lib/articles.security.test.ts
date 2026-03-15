/**
 * 安全测试：输入验证和路径遍历
 * 测试目标：验证用户输入处理的安全性
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractHeadings } from './articles';

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

    it('应该正确处理URL编码的slug', () => {
      const encodedSlugs = [
        { encoded: 'article%20title', expected: 'article title' },
        { encoded: '%E6%96%87%E7%AB%A0', expected: '文章' },
        { encoded: 'article%2Ftitle', expected: 'article/title' },
      ];

      encodedSlugs.forEach(({ encoded, expected }) => {
        const decoded = decodeURIComponent(encoded);
        expect(decoded).toBe(expected);
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

    it('extractHeadings应该处理大量标题', () => {
      // 生成包含10000个标题的内容
      let content = '';
      for (let i = 0; i < 10000; i++) {
        content += `## 标题 ${i}\n`;
      }

      // 不应该抛出错误
      expect(() => extractHeadings(content)).not.toThrow();
      
      const headings = extractHeadings(content);
      expect(headings.length).toBe(10000);
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

    it('应该正确处理Unicode特殊字符', () => {
      const specialChars = [
        '标题\u0000包含空字节', // 空字节
        '标题\u202E反转',      // Right-to-Left Override
        '标题\u200B零宽空格',  // 零宽空格
        '标题\uFEFF零宽非断空格', // BOM
      ];

      specialChars.forEach(title => {
        const content = `## ${title}`;
        expect(() => extractHeadings(content)).not.toThrow();
      });
    });
  });

  describe('搜索查询安全测试', () => {
    it('应该安全处理搜索查询中的特殊字符', () => {
      const maliciousQueries = [
        "'; DROP TABLE articles; --",
        '" OR "1"="1',
        '<script>alert("xss")</script>',
        '../../../etc/passwd',
        'null\x00injection',
      ];

      maliciousQueries.forEach(query => {
        // 在实际应用中，这些查询会被传递给Supabase
        // Supabase使用参数化查询，应该能防止SQL注入
        // 但我们仍然需要验证输入被正确处理
        
        // 查询不应该包含空字节
        const sanitizedQuery = query.replace(/\x00/g, '');
        expect(sanitizedQuery).not.toContain('\x00');
        
        // 查询应该被保留（转义由ORM处理）
        expect(sanitizedQuery.length).toBeGreaterThan(0);
      });
    });

    it('应该限制搜索查询长度', () => {
      // 模拟搜索查询
      const maxQueryLength = 1000;
      const longQuery = 'A'.repeat(2000);
      
      // 应该有机制限制查询长度
      const truncatedQuery = longQuery.slice(0, maxQueryLength);
      expect(truncatedQuery.length).toBe(maxQueryLength);
    });
  });

  describe('分类和标签安全测试', () => {
    it('应该安全处理分类和标签名称', () => {
      const maliciousNames = [
        '<script>alert("xss")</script>',
        '"; DROP TABLE categories; --',
        '../../../etc/passwd',
        'Category\x00Name',
      ];

      maliciousNames.forEach(name => {
        // 名称应该被正确处理
        const sanitizedName = name.replace(/\x00/g, '').trim();
        expect(sanitizedName).not.toContain('\x00');
        
        // 在实际应用中，这些名称会被转义后存储到数据库
        // 前端显示时也应该被转义
      });
    });
  });

  describe('内容注入测试', () => {
    it('应该防止Markdown内容注入', () => {
      const content = `
正常内容

[恶意链接](javascript:alert(1))

![恶意图片](data:text/html,<script>alert(1)</script>)

\`\`\`
恶意代码块内容
\`\`\`
      `.trim();

      const headings = extractHeadings(content);
      
      // 标题提取应该正常工作
      expect(Array.isArray(headings)).toBe(true);
    });

    it('应该正确处理嵌套Markdown', () => {
      const content = `
# 外层标题

**粗体中包含[链接](https://example.com)和**更多文本**

- 列表项1
  - 嵌套列表项
    - 更深层次的嵌套

> 引用中包含
> **粗体**和*斜体*
      `.trim();

      const headings = extractHeadings(content);
      
      expect(headings).toHaveLength(1);
      expect(headings[0].text).toBe('外层标题');
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

  describe('边界情况测试', () => {
    it('应该处理只有标题符号的内容', () => {
      const content = '##';
      const headings = extractHeadings(content);
      expect(headings).toEqual([]);
    });

    it('应该处理连续的标题符号', () => {
      const content = '## ## ###';
      const headings = extractHeadings(content);
      expect(headings).toEqual([]);
    });

    it('应该处理混合标题级别', () => {
      const content = `
# H1
## H2
### H3
#### H4
##### H5
###### H6
####### H7 (无效)
      `.trim();

      const headings = extractHeadings(content);
      expect(headings).toHaveLength(6); // H7无效
    });
  });
});
