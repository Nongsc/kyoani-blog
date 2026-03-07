import { notFound } from "next/navigation";
import Link from "next/link";
import { getArticleBySlug, getRelatedArticles, extractHeadings, getAllArticles } from "@/lib/articles";
import { TOC } from "@/components/article/TOC";
import { RelatedPosts } from "@/components/article/RelatedPosts";
import { BackToTop } from "@/components/article/BackToTop";
import { MarkdownRenderer } from "@/components/article/MarkdownRenderer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock } from "lucide-react";

// Revalidate every 60 seconds for ISR
export const revalidate = 60;

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const articles = await getAllArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  
  if (!article) {
    return { title: "文章未找到" };
  }
  
  return {
    title: article.title,
    description: article.excerpt,
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  
  if (!article) {
    notFound();
  }

  const headings = extractHeadings(article.content);
  const relatedArticles = await getRelatedArticles(slug);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Button>
        </Link>
      </div>
      
      <article className="grid gap-8 lg:grid-cols-[200px_1fr] xl:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <TOC headings={headings} />
          </div>
        </aside>
        
        <div className="min-w-0">
          <header className="mb-8 pb-6 border-b border-border">
            <h1 className="text-3xl font-semibold text-foreground mb-4">
              {article.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {article.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {article.readingTime} 分钟阅读
              </span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </header>
          
          <div className="max-w-3xl">
            <MarkdownRenderer content={article.content} headings={headings} />
          </div>
          
          <RelatedPosts articles={relatedArticles} />
        </div>
      </article>
      
      <BackToTop />
    </div>
  );
}
