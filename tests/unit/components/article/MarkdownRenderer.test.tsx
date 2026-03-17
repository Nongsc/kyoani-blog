import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSanitize from 'rehype-sanitize';

/**
 * 测试目标: 验证 rehype-sanitize 能正确净化 XSS 攻击代码
 * 
 * 潜在问题:
 * 1. 恶意脚本注入
 * 2. 事件处理器注入 (onclick, onerror)
 * 3. javascript: URL 协议
 * 4. iframe 嵌入
 */

describe('MarkdownRenderer Security', () => {
  const plugins = {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeHighlight, rehypeSanitize],
  };

  it('should sanitize script tags', () => {
    const maliciousContent = '<script>alert("XSS")</script>Hello World';
    const { container } = render(
      <ReactMarkdown {...plugins}>{maliciousContent}</ReactMarkdown>
    );
    
    // Script tag should be removed
    expect(container.querySelector('script')).toBeNull();
  });

  it('should sanitize onclick event handlers', () => {
    const maliciousContent = '<a href="#" onclick="alert(\'XSS\')">Click me</a>';
    const { container } = render(
      <ReactMarkdown {...plugins}>{maliciousContent}</ReactMarkdown>
    );
    
    const link = container.querySelector('a');
    // If there's no link (sanitized completely), that's also safe
    if (link) {
      expect(link.getAttribute('onclick')).toBeFalsy();
    }
  });

  it('should sanitize javascript: URLs', () => {
    const maliciousContent = '[Click me](javascript:alert("XSS"))';
    const { container } = render(
      <ReactMarkdown {...plugins}>{maliciousContent}</ReactMarkdown>
    );
    
    const link = container.querySelector('a');
    // rehype-sanitize either removes the link entirely or sanitizes the href
    if (link) {
      const href = link.getAttribute('href');
      // href should be empty or not contain javascript:
      expect(href === null || href === '' || !href.includes('javascript:')).toBe(true);
    }
  });

  it('should sanitize onerror event handlers in img tags', () => {
    const maliciousContent = '<img src="x" onerror="alert(\'XSS\')" alt="test">';
    const { container } = render(
      <ReactMarkdown {...plugins}>{maliciousContent}</ReactMarkdown>
    );
    
    const img = container.querySelector('img');
    // If img exists, onerror should not be present
    if (img) {
      expect(img.getAttribute('onerror')).toBeFalsy();
    }
  });

  it('should sanitize iframe tags', () => {
    const maliciousContent = '<iframe src="https://evil.com"></iframe>';
    const { container } = render(
      <ReactMarkdown {...plugins}>{maliciousContent}</ReactMarkdown>
    );
    
    // Iframe should be removed (rehype-sanitize removes it by default)
    expect(container.querySelector('iframe')).toBeNull();
  });

  it('should preserve safe markdown content', () => {
    const safeContent = `
# Title

This is **bold** and *italic* text.

- List item 1
- List item 2

[Safe link](https://example.com)

\`\`\`javascript
const x = 1;
\`\`\`
`;
    const { container } = render(
      <ReactMarkdown {...plugins}>{safeContent}</ReactMarkdown>
    );
    
    expect(container.querySelector('h1')).toBeTruthy();
    expect(container.querySelector('strong')).toBeTruthy();
    expect(container.querySelector('em')).toBeTruthy();
    expect(container.querySelector('ul')).toBeTruthy();
    expect(container.querySelector('a')).toBeTruthy();
    expect(container.querySelector('code')).toBeTruthy();
  });

  it('should allow standard HTML elements allowed by sanitize schema', () => {
    const content = `
# Heading

This is a **bold** paragraph with *italic* text.

> This is a blockquote

Here is some \`inline code\`.

| Column 1 | Column 2 |
|----------|----------|
| Cell 1   | Cell 2   |
`;
    const { container } = render(
      <ReactMarkdown {...plugins}>{content}</ReactMarkdown>
    );
    
    // These elements are allowed by the default sanitize schema
    expect(container.querySelector('h1')).toBeTruthy();
    expect(container.querySelector('strong')).toBeTruthy();
    expect(container.querySelector('em')).toBeTruthy();
    expect(container.querySelector('blockquote')).toBeTruthy();
    expect(container.querySelector('code')).toBeTruthy();
    // Table support comes from remark-gfm
    expect(container.querySelector('table')).toBeTruthy();
  });

  it('should preserve GFM features', () => {
    const gfmContent = `
- [ ] Task 1
- [x] Task 2

| Name | Value |
|------|-------|
| A    | 1     |
| B    | 2     |

~~strikethrough~~
`;
    const { container } = render(
      <ReactMarkdown {...plugins}>{gfmContent}</ReactMarkdown>
    );
    
    // Task list
    expect(container.querySelector('input[type="checkbox"]')).toBeTruthy();
    // Table
    expect(container.querySelector('table')).toBeTruthy();
    // Strikethrough
    expect(container.querySelector('del')).toBeTruthy();
  });
});
