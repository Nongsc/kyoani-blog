// Article type matching database structure
export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image: string | null;
  category_id: string | null;
  author_id: string | null;
  status: 'draft' | 'published';
  published_at: string | null;
  created_at: string;
  updated_at: string;
  // Computed fields for frontend compatibility
  date: string;
  readingTime: number;
  category: string;
  tags: string[];
}

// Database response types
export interface ArticleRow {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image: string | null;
  category_id: string | null;
  author_id: string | null;
  status: 'draft' | 'published';
  published_at: string | null;
  created_at: string;
  updated_at: string;
  categories: CategoryRow | null;
  article_tags: ArticleTagRow[];
}

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface TagRow {
  id: string;
  name: string;
  slug: string;
}

export interface ArticleTagRow {
  tag_id: string;
  tags: TagRow;
}

export interface Heading {
  id: string;
  text: string;
  level: number;
}

// Category type for frontend
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  count?: number;
}

// Tag type for frontend
export interface Tag {
  id: string;
  name: string;
  slug: string;
  count?: number;
}

// Site settings type
export interface SiteSettings {
  site_title: string;
  site_description: string;
  site_author: string;
  posts_per_page: number;
  hitokoto_enabled: boolean;
  hitokoto_type: string;
  footer_copyright: string;
  footer_icp: string;
  footer_tech_links: { title: string; url: string }[];
  // About page settings
  about_avatar: string;
  about_bio: string;
  about_location: string;
  about_title: string;
  about_join_date: string;
  about_skills: { name: string; color: string }[];
  about_social_links: { icon: string; url: string; label: string }[];
}
