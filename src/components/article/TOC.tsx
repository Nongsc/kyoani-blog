"use client";

import { Heading } from "@/types/article";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TOCProps {
  headings: Heading[];
  activeId?: string;
}

export function TOC({ headings, activeId }: TOCProps) {
  if (headings.length === 0) {
    return null;
  }
  
  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };
  
  return (
    <nav className="sticky top-20" aria-label="文章目录">
      <h3 className="text-sm font-medium text-foreground mb-3">目录</h3>
      <ScrollArea className="h-[calc(100vh-12rem)]">
        <ul className="space-y-1 pr-4" role="list">
          {headings.map((heading) => (
            <li key={heading.id}>
              <button
                onClick={() => handleClick(heading.id)}
                aria-label={`跳转到：${heading.text}`}
                aria-current={activeId === heading.id ? "true" : undefined}
                className={`text-sm text-left w-full py-1 px-2 rounded transition-colors hover:bg-muted ${
                  heading.level === 1 ? "pl-2" :
                  heading.level === 2 ? "pl-4" :
                  heading.level === 3 ? "pl-6" :
                  heading.level === 4 ? "pl-8" :
                  "pl-10"
                } ${
                  activeId === heading.id 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {heading.text}
              </button>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </nav>
  );
}
