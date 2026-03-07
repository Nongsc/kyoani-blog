import { Article, ArticleRow, Heading, Category, Tag, SiteSettings } from "@/types/article";
import { createSupabaseClient } from "./supabase/client";

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

function transformArticle(row: ArticleRow): Article {
  const category = row.categories?.name || "Article";
  const tags = row.article_tags?.map(at => at.tags?.name).filter(Boolean) as string[] || [];
  const date = row.published_at || row.created_at;
  const excerpt = row.excerpt || generateExcerpt(row.content);

  return {
    ...row,
    excerpt,
    date: date ? new Date(date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    readingTime: calculateReadingTime(row.content),
    category,
    tags,
  };
}

function generateExcerpt(content: string, length: number = 150): string {
  const text = content
    .replace(/^#\s+.+$/gm, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`#]/g, "")
    .replace(/\n+/g, " ")
    .trim();
  
  return text.length > length ? text.slice(0, length) + "..." : text;
}

export async function getAllArticles(): Promise<Article[]> {
  const supabase = createSupabaseClient();
  
  const { data, error } = await supabase
    .from("articles")
    .select(`
      *,
      categories (
        id,
        name,
        slug,
        description
      ),
      article_tags (
        tag_id,
        tags (
          id,
          name,
          slug
        )
      )
    `)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Error fetching articles:", error);
    return [];
  }

  return (data as ArticleRow[]).map(transformArticle);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const supabase = createSupabaseClient();
  
  // Decode slug in case it's URL encoded
  const decodedSlug = decodeURIComponent(slug);
  
  const { data, error } = await supabase
    .from("articles")
    .select(`
      *,
      categories (
        id,
        name,
        slug,
        description
      ),
      article_tags (
        tag_id,
        tags (
          id,
          name,
          slug
        )
      )
    `)
    .eq("slug", decodedSlug)
    .eq("status", "published")
    .single();

  if (error || !data) {
    console.error("Error fetching article:", error);
    return null;
  }

  return transformArticle(data as ArticleRow);
}

export async function getArticlesByTag(tag: string): Promise<Article[]> {
  const supabase = createSupabaseClient();
  
  const { data, error } = await supabase
    .from("articles")
    .select(`
      *,
      categories (
        id,
        name,
        slug,
        description
      ),
      article_tags!inner (
        tag_id,
        tags!inner (
          id,
          name,
          slug
        )
      )
    `)
    .eq("status", "published")
    .eq("article_tags.tags.name", tag)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Error fetching articles by tag:", error);
    return [];
  }

  return (data as ArticleRow[]).map(transformArticle);
}

export async function getArticlesByCategory(category: string): Promise<Article[]> {
  const supabase = createSupabaseClient();
  
  const { data, error } = await supabase
    .from("articles")
    .select(`
      *,
      categories!inner (
        id,
        name,
        slug,
        description
      ),
      article_tags (
        tag_id,
        tags (
          id,
          name,
          slug
        )
      )
    `)
    .eq("status", "published")
    .eq("categories.name", category)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Error fetching articles by category:", error);
    return [];
  }

  return (data as ArticleRow[]).map(transformArticle);
}

export async function searchArticles(query: string): Promise<Article[]> {
  const supabase = createSupabaseClient();
  
  const { data, error } = await supabase
    .from("articles")
    .select(`
      *,
      categories (
        id,
        name,
        slug,
        description
      ),
      article_tags (
        tag_id,
        tags (
          id,
          name,
          slug
        )
      )
    `)
    .eq("status", "published")
    .or(`title.ilike.%${query}%,content.ilike.%${query}%,excerpt.ilike.%${query}%`)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Error searching articles:", error);
    return [];
  }

  return (data as ArticleRow[]).map(transformArticle);
}

export async function getAllTags(): Promise<Tag[]> {
  const supabase = createSupabaseClient();
  
  const { data, error } = await supabase
    .from("tags")
    .select(`
      id,
      name,
      slug,
      article_tags (
        count
      )
    `)
    .order("name");

  if (error) {
    console.error("Error fetching tags:", error);
    return [];
  }

  return data.map(tag => ({
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
    count: (tag.article_tags as unknown as { count: number }[])?.[0]?.count || 0,
  }));
}

export async function getAllCategories(): Promise<Category[]> {
  const supabase = createSupabaseClient();
  
  const { data, error } = await supabase
    .from("categories")
    .select(`
      id,
      name,
      slug,
      description,
      articles (
        count
      )
    `)
    .order("name");

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  return data.map(cat => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    count: (cat.articles as unknown as { count: number }[])?.[0]?.count || 0,
  }));
}

export function extractHeadings(content: string): Heading[] {
  const headings: Heading[] = [];
  const idCount: Record<string, number> = {};
  const matches = content.matchAll(/^(#{1,6})\s+(.+)$/gm);
  
  for (const match of matches) {
    const level = match[1].length;
    const text = match[2].trim();
    const baseId = text
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
      .replace(/^-|-$/g, "");
    
    let id = baseId;
    if (idCount[baseId] !== undefined) {
      idCount[baseId]++;
      id = `${baseId}-${idCount[baseId]}`;
    } else {
      idCount[baseId] = 0;
    }
    
    headings.push({ id, text, level });
  }
  
  return headings;
}

export async function getRelatedArticles(currentSlug: string, limit: number = 3): Promise<Article[]> {
  const currentArticle = await getArticleBySlug(currentSlug);
  
  if (!currentArticle) {
    return [];
  }

  const allArticles = (await getAllArticles()).filter(a => a.slug !== currentSlug);
  
  const scored = allArticles.map(article => {
    const sharedTags = article.tags.filter(tag => currentArticle.tags.includes(tag));
    const sameCategory = article.category === currentArticle.category ? 1 : 0;
    const score = sharedTags.length * 2 + sameCategory;
    return { article, score };
  });
  
  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.article);
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = createSupabaseClient();
  
  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value");

  if (error) {
    console.error("Error fetching site settings:", error);
    // Return defaults on error
    return {
      site_title: "Kyoani Blog",
      site_description: "A serene reading experience",
      site_author: "Admin",
      posts_per_page: 10,
      hitokoto_enabled: false,
      hitokoto_type: "a",
      footer_copyright: "",
      footer_icp: "",
      footer_tech_links: [
        { title: "Next.js", url: "https://nextjs.org" },
        { title: "shadcn/ui", url: "https://ui.shadcn.com" }
      ],
      about_avatar: "",
      about_bio: "",
      about_location: "中国",
      about_title: "全栈开发者 / 动漫爱好者",
      about_join_date: "2024",
      about_skills: [],
      about_social_links: [],
    };
  }

  // Convert array to object
  const settings: Record<string, string> = {};
  for (const item of data) {
    settings[item.key] = item.value || "";
  }

  // Parse tech links
  let techLinks: { title: string; url: string }[] = [];
  try {
    techLinks = settings.footer_tech_links ? JSON.parse(settings.footer_tech_links) : [];
  } catch {
    techLinks = [
      { title: "Next.js", url: "https://nextjs.org" },
      { title: "shadcn/ui", url: "https://ui.shadcn.com" }
    ];
  }

  // Parse about skills
  let aboutSkills: { name: string; color: string }[] = [];
  try {
    aboutSkills = settings.about_skills ? JSON.parse(settings.about_skills) : [];
  } catch {
    aboutSkills = [];
  }

  // Parse about social links
  let aboutSocialLinks: { icon: string; url: string; label: string }[] = [];
  try {
    aboutSocialLinks = settings.about_social_links ? JSON.parse(settings.about_social_links) : [];
  } catch {
    aboutSocialLinks = [];
  }

  return {
    site_title: settings.site_title || "Kyoani Blog",
    site_description: settings.site_description || "A serene reading experience",
    site_author: settings.site_author || "Admin",
    posts_per_page: parseInt(settings.posts_per_page) || 10,
    hitokoto_enabled: settings.hitokoto_enabled === "true",
    hitokoto_type: settings.hitokoto_type || "a",
    footer_copyright: settings.footer_copyright || "",
    footer_icp: settings.footer_icp || "",
    footer_tech_links: techLinks,
    about_avatar: settings.about_avatar || "",
    about_bio: settings.about_bio || "",
    about_location: settings.about_location || "中国",
    about_title: settings.about_title || "全栈开发者 / 动漫爱好者",
    about_join_date: settings.about_join_date || "2024",
    about_skills: aboutSkills,
    about_social_links: aboutSocialLinks,
  };
}
