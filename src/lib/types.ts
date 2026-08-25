export interface NovelMeta {
  slug: string;
  title: string;
  author: string;
  description: string;
  cover: string;
  genre: string[];
  status: "ongoing" | "completed";
  freeChapters: number;
  priceLabel: string;
  updatedAt: string;
}

export interface ChapterMeta {
  slug: string;
  novelSlug: string;
  title: string;
  order: number;
  summary?: string;
}

export interface Chapter extends ChapterMeta {
  content: string;
}

export interface SiteConfig {
  siteName: string;
  tagline: string;
  freeChaptersDefault: number;
  currency: string;
}
