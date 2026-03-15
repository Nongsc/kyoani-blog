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
  
  // Create a map of heading text to unique ID for consistent ID assignment
  const headingIdMap = useMemo(() => {
    const map = new Map<string, string>();
    headings.forEach((h) => {
      map.set(h.text, h.id);
    });
    return map;
  }, [headings]);
  
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
    return headingIdMap.get(text) || text
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
      .replace(/^-|-$/g, "");
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
          a: ({ href, children }) => {
            if (href?.startsWith("/")) {
              return <a href={href}>{children}</a>;
            }
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
