import type { MetadataRoute } from "next";
import { getAllNovels, getChapterMetas } from "@/lib/novels";
import { getSiteUrl } from "@/lib/stripe";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const novels = await getAllNovels();

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/pricing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  const novelPages = await Promise.all(
    novels.map(async (novel) => {
      const chapters = await getChapterMetas(novel.slug);
      return [
        {
          url: `${baseUrl}/novel/${novel.slug}`,
          lastModified: new Date(novel.updatedAt),
          changeFrequency: "weekly" as const,
          priority: 0.9,
        },
        ...chapters.map((chapter) => ({
          url: `${baseUrl}/novel/${novel.slug}/${chapter.slug}`,
          lastModified: new Date(novel.updatedAt),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        })),
      ];
    })
  );

  return [...staticPages, ...novelPages.flat()];
}
