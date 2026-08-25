import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { Chapter, ChapterMeta, NovelMeta } from "./types";

const CONTENT_DIR = path.join(process.cwd(), "content");
const NOVELS_DIR = path.join(CONTENT_DIR, "novels");

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
}

export function getAllNovels(): NovelMeta[] {
  const indexPath = path.join(CONTENT_DIR, "novels.json");
  if (!fs.existsSync(indexPath)) return [];
  return readJson<NovelMeta[]>(indexPath).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function getNovel(slug: string): NovelMeta | undefined {
  return getAllNovels().find((n) => n.slug === slug);
}

export function getChapterMetas(novelSlug: string): ChapterMeta[] {
  const dir = path.join(NOVELS_DIR, novelSlug, "chapters");
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((filename) => {
      const raw = fs.readFileSync(path.join(dir, filename), "utf-8");
      const { data } = matter(raw);
      return {
        slug: data.slug as string,
        novelSlug,
        title: data.title as string,
        order: data.order as number,
        summary: data.summary as string | undefined,
      };
    })
    .sort((a, b) => a.order - b.order);
}

export function getChapter(novelSlug: string, chapterSlug: string): Chapter | undefined {
  const dir = path.join(NOVELS_DIR, novelSlug, "chapters");
  if (!fs.existsSync(dir)) return undefined;

  for (const filename of fs.readdirSync(dir)) {
    if (!filename.endsWith(".md")) continue;
    const filePath = path.join(dir, filename);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);
    if (data.slug === chapterSlug) {
      return {
        slug: data.slug as string,
        novelSlug,
        title: data.title as string,
        order: data.order as number,
        summary: data.summary as string | undefined,
        content: content.trim(),
      };
    }
  }
  return undefined;
}

export function isChapterFree(novel: NovelMeta, chapterOrder: number): boolean {
  return chapterOrder <= novel.freeChapters;
}

export function getAdjacentChapters(
  novelSlug: string,
  chapterSlug: string
): { prev?: ChapterMeta; next?: ChapterMeta } {
  const chapters = getChapterMetas(novelSlug);
  const index = chapters.findIndex((c) => c.slug === chapterSlug);
  if (index === -1) return {};
  return {
    prev: index > 0 ? chapters[index - 1] : undefined,
    next: index < chapters.length - 1 ? chapters[index + 1] : undefined,
  };
}
