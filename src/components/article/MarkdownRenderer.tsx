"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize from "rehype-sanitize";
import { Heading } from "@/types/article";
import { useEffect, useState, useMemo } from "react";

// Extract plugins outside component to avoid re-creation on each render
const remarkPlugins = [remarkGfm];
// rehype-sanitize prevents XSS attacks by sanitizing HTML
const rehypePlugins = [rehypeHighlight, rehypeSanitize];

interface MarkdownRendererProps {
  content: string;
  headings: Heading[];
}

export function MarkdownRenderer({ content, headings }: MarkdownRendererProps) {
  const [activeId, setActiveId] = useState<string>("");
  
  // Create a mutable copy of headings for ID assignment
  // This allows us to track which headings have been used
  const headingsRef = useMemo(() => [...headings], [headings]);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0% -35% 0%" }
    );
    
    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });
    
    return () => observer.disconnect();
  }, [headings]);
  
  const getHeadingId = (text: string): string => {
    // Find the first matching heading that hasn't been used yet
    const index = headingsRef.findIndex(h => h.text === text);
    if (index !== -1) {
      const id = headingsRef[index].id;
      // Mark as used by removing it
      headingsRef.splice(index, 1);
      return id;
    }
    // Fallback: generate ID from text
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
      .replace(/^-|-$/g, "") || `heading-${Date.now()}`;
  };
  
  return (
    <div className="prose max-w-none">
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        components={{
          h1: ({ children, ...props }) => {
            const id = getHeadingId(String(children));
            return <h1 id={id} {...props}>{children}</h1>;
          },
          h2: ({ children, ...props }) => {
            const id = getHeadingId(String(children));
            return <h2 id={id} {...props}>{children}</h2>;
          },
          h3: ({ children, ...props }) => {
            const id = getHeadingId(String(children));
            return <h3 id={id} {...props}>{children}</h3>;
          },
          h4: ({ children, ...props }) => {
            const id = getHeadingId(String(children));
            return <h4 id={id} {...props}>{children}</h4>;
          },
          h5: ({ children, ...props }) => {
            const id = getHeadingId(String(children));
            return <h5 id={id} {...props}>{children}</h5>;
          },
          h6: ({ children, ...props }) => {
            const id = getHeadingId(String(children));
            return <h6 id={id} {...props}>{children}</h6>;
          },
          a: ({ href, children }) => {
            if (!href) {
              return <a>{children}</a>;
            }
            
            // 内部链接：以 / 开头或 # 开头（锚点）
            const isInternal = href.startsWith('/') || href.startsWith('#');
            // 特殊链接：mailto: 和 tel:
            const isSpecial = href.startsWith('mailto:') || href.startsWith('tel:');
            
            if (isInternal || isSpecial) {
              return <a href={href}>{children}</a>;
            }
            
            // 外部链接需要安全属性
            return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
          },
          img: ({ src, alt }) => (
            <img src={src} alt={alt} loading="lazy" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
