import { FileText, BookOpen, Tag } from "lucide-react";

interface AboutSectionProps {
  totalArticles: number;
  totalTags: number;
  totalCategories: number;
}

export function AboutSection({ totalArticles, totalTags, totalCategories }: AboutSectionProps) {
  return (
    <section className="bg-gradient-to-br from-primary/10 via-accent/10 to-muted rounded-xl p-6 border border-border">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-8 h-8 text-primary-foreground" />
        </div>
        
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-foreground mb-1">
            Welcome to Kyoani Blog
          </h2>
          <p className="text-sm text-muted-foreground mb-3">
            A serene reading experience inspired by the aesthetic of Kyoto Animation&apos;s 
            Violet Evergarden. Explore articles with a calm, focused atmosphere.
          </p>
          
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <FileText className="w-4 h-4 text-primary" />
              <span className="font-medium text-foreground">{totalArticles}</span> Articles
            </span>
            <span className="flex items-center gap-2 text-muted-foreground">
              <Tag className="w-4 h-4 text-primary" />
              <span className="font-medium text-foreground">{totalTags}</span> Tags
            </span>
            <span className="flex items-center gap-2 text-muted-foreground">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="font-medium text-foreground">{totalCategories}</span> Categories
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
