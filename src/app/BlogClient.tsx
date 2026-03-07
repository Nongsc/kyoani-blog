"use client";

import { useState, useMemo } from "react";
import { Article, Tag, Category, SiteSettings } from "@/types/article";
import { ArticleList } from "@/components/home/ArticleList";
import { SearchBox } from "@/components/home/SearchBox";
import { TagCloud } from "@/components/home/TagCloud";
import { CategoryNav } from "@/components/home/CategoryNav";
import { HeroSection } from "@/components/home/HeroSection";

interface BlogClientProps {
  initialArticles: Article[];
  allTags: Tag[];
  allCategories: Category[];
  siteSettings: SiteSettings;
}

export function BlogClient({ initialArticles, allTags, allCategories, siteSettings }: BlogClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const filteredArticles = useMemo(() => {
    let result = initialArticles;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (article) =>
          article.title.toLowerCase().includes(query) ||
          article.excerpt.toLowerCase().includes(query)
      );
    }
    
    if (selectedTag) {
      result = result.filter((article) => article.tags.includes(selectedTag));
    }
    
    if (selectedCategory) {
      result = result.filter((article) => article.category === selectedCategory);
    }
    
    return result;
  }, [initialArticles, searchQuery, selectedTag, selectedCategory]);
  
  // Extract names for display
  const tagNames = allTags.map(t => t.name);
  const categoryNames = allCategories.map(c => c.name);
  
  return (
    <>
      {/* Hero Section */}
      <HeroSection 
        siteTitle={siteSettings.site_title}
        siteDescription={siteSettings.site_description}
        hitokotoEnabled={siteSettings.hitokoto_enabled}
        hitokotoType={siteSettings.hitokoto_type}
      />
      
      {/* Content Section */}
      <main id="content-section" className="bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
            <div className="space-y-6">
              <div className="space-y-4">
                <SearchBox value={searchQuery} onChange={setSearchQuery} />
                <CategoryNav 
                  categories={categoryNames} 
                  selectedCategory={selectedCategory} 
                  onSelectCategory={setSelectedCategory} 
                />
              </div>
              
              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">
                    文章列表
                  </h2>
                  <span className="text-sm text-muted-foreground">
                    共 {filteredArticles.length} 篇
                  </span>
                </div>
                <ArticleList articles={filteredArticles} />
              </div>
            </div>
            
            <aside className="hidden lg:block space-y-6">
              <TagCloud 
                tags={tagNames} 
                selectedTag={selectedTag} 
                onSelectTag={setSelectedTag} 
              />
            </aside>
          </div>
          
          <div className="lg:hidden mt-8 pt-6 border-t border-border">
            <TagCloud 
              tags={tagNames} 
              selectedTag={selectedTag} 
              onSelectTag={setSelectedTag} 
            />
          </div>
        </div>
      </main>
    </>
  );
}
