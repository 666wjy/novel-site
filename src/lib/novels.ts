import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { asc, desc, eq, and } from "drizzle-orm";
import { getDb, isDatabaseEnabled } from "@/db";
import { novels as novelsTable, chapters as chaptersTable } from "@/db/schema";
import type { Chapter, ChapterMeta, NovelMeta } from "./types";

const CONTENT_DIR = path.join(process.cwd(), "content");
const NOVELS_DIR = path.join(CONTENT_DIR, "novels");

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
}

function mapNovelRow(row: typeof novelsTable.$inferSelect): NovelMeta {
  return {
    slug: row.slug,
    title: row.title,
    author: row.author,
    description: row.description,
    cover: row.cover,
    genre: row.genre,
    status: row.status,
    freeChapters: row.freeChapters,
    priceLabel: row.priceLabel,
    updatedAt: row.updatedAt.toISOString().slice(0, 10),
  };
}

function mapChapterRow(row: typeof chaptersTable.$inferSelect): Chapter {
  return {
    slug: row.slug,
    novelSlug: row.novelSlug,
    title: row.title,
    order: row.order,
    summary: row.summary ?? undefined,
    content: row.content,
  };
}

function getAllNovelsFromFiles(): NovelMeta[] {
  const indexPath = path.join(CONTENT_DIR, "novels.json");
  if (!fs.existsSync(indexPath)) return [];
  return readJson<NovelMeta[]>(indexPath).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

function getChapterMetasFromFiles(novelSlug: string): ChapterMeta[] {
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

function getChapterFromFiles(novelSlug: string, chapterSlug: string): Chapter | undefined {
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

export async function getAllNovels(): Promise<NovelMeta[]> {
  if (isDatabaseEnabled()) {
    const db = getDb();
    const rows = await db.select().from(novelsTable).orderBy(desc(novelsTable.updatedAt));
    return rows.map(mapNovelRow);
  }
  return getAllNovelsFromFiles();
}

export async function getNovel(slug: string): Promise<NovelMeta | undefined> {
  if (isDatabaseEnabled()) {
    const db = getDb();
    const rows = await db.select().from(novelsTable).where(eq(novelsTable.slug, slug)).limit(1);
    return rows[0] ? mapNovelRow(rows[0]) : undefined;
  }
  return getAllNovelsFromFiles().find((n) => n.slug === slug);
}

export async function getChapterMetas(novelSlug: string): Promise<ChapterMeta[]> {
  if (isDatabaseEnabled()) {
    const db = getDb();
    const rows = await db
      .select()
      .from(chaptersTable)
      .where(eq(chaptersTable.novelSlug, novelSlug))
      .orderBy(asc(chaptersTable.order));
    return rows.map((row) => ({
      slug: row.slug,
      novelSlug: row.novelSlug,
      title: row.title,
      order: row.order,
      summary: row.summary ?? undefined,
    }));
  }
  return getChapterMetasFromFiles(novelSlug);
}

export async function getChapter(novelSlug: string, chapterSlug: string): Promise<Chapter | undefined> {
  if (isDatabaseEnabled()) {
    const db = getDb();
    const rows = await db
      .select()
      .from(chaptersTable)
      .where(and(eq(chaptersTable.novelSlug, novelSlug), eq(chaptersTable.slug, chapterSlug)))
      .limit(1);
    return rows[0] ? mapChapterRow(rows[0]) : undefined;
  }
  return getChapterFromFiles(novelSlug, chapterSlug);
}

export function isChapterFree(novel: NovelMeta, chapterOrder: number): boolean {
  return chapterOrder <= novel.freeChapters;
}

export async function getAdjacentChapters(
  novelSlug: string,
  chapterSlug: string
): Promise<{ prev?: ChapterMeta; next?: ChapterMeta }> {
  const chapters = await getChapterMetas(novelSlug);
  const index = chapters.findIndex((c) => c.slug === chapterSlug);
  if (index === -1) return {};
  return {
    prev: index > 0 ? chapters[index - 1] : undefined,
    next: index < chapters.length - 1 ? chapters[index + 1] : undefined,
  };
}
