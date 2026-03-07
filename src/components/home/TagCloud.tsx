"use client";

import { Badge } from "@/components/ui/badge";

interface TagCloudProps {
  tags: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
}

export function TagCloud({ tags, selectedTag, onSelectTag }: TagCloudProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-foreground">标签</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant={selectedTag === tag ? "default" : "secondary"}
            className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
            onClick={() => onSelectTag(selectedTag === tag ? null : tag)}
          >
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
}
