import Link from "next/link";
import { Article } from "@/types/article";
import { Card, CardContent } from "@/components/ui/card";

interface RelatedPostsProps {
  articles: Article[];
}

export function RelatedPosts({ articles }: RelatedPostsProps) {
  if (articles.length === 0) {
    return null;
  }
  
  return (
    <section className="mt-12 pt-8 border-t border-border">
      <h3 className="text-lg font-semibold text-foreground mb-4">相关文章</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <Link key={article.id} href={`/article/${article.slug}`}>
            <Card className="hover:border-primary hover:shadow-md transition-all cursor-pointer">
              <CardContent className="p-4">
                <h4 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                  {article.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {article.readingTime} 分钟阅读
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
