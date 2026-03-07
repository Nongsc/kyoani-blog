import { getAllArticles, getAllTags, getAllCategories, getSiteSettings } from "@/lib/articles";
import { BlogClient } from "./BlogClient";

export default async function HomePage() {
  const [articles, allTags, allCategories, siteSettings] = await Promise.all([
    getAllArticles(),
    getAllTags(),
    getAllCategories(),
    getSiteSettings(),
  ]);
  
  return (
    <BlogClient 
      initialArticles={articles}
      allTags={allTags}
      allCategories={allCategories}
      siteSettings={siteSettings}
    />
  );
}
