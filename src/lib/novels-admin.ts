import crypto from "crypto";
import { asc, eq } from "drizzle-orm";
import { getDb, isDatabaseEnabled } from "@/db";
import { novels as novelsTable, chapters as chaptersTable } from "@/db/schema";
import type { NovelMeta } from "./types";

export interface NovelInput {
  slug: string;
  title: string;
  author: string;
  description: string;
  cover: string;
  genre: string[];
  status: "ongoing" | "completed";
  freeChapters: number;
  priceLabel: string;
}

export interface ChapterInput {
  slug: string;
  title: string;
  order: number;
  summary?: string;
  content: string;
}

export async function createNovel(input: NovelInput) {
  const db = getDb();
  await db.insert(novelsTable).values({
    ...input,
    updatedAt: new Date(),
  });
}

export async function updateNovel(slug: string, input: Partial<NovelInput>) {
  const db = getDb();
  await db
    .update(novelsTable)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(novelsTable.slug, slug));
}

export async function createChapter(novelSlug: string, input: ChapterInput) {
  const db = getDb();
  await db.insert(chaptersTable).values({
    id: crypto.randomUUID(),
    novelSlug,
    slug: input.slug,
    title: input.title,
    order: input.order,
    summary: input.summary ?? null,
    content: input.content.trim(),
  });

  await db
    .update(novelsTable)
    .set({ updatedAt: new Date() })
    .where(eq(novelsTable.slug, novelSlug));
}

/** Bulk insert chapters (one transaction-ish sequence). */
export async function createChaptersBulk(
  novelSlug: string,
  inputs: ChapterInput[],
  opts?: { replace?: boolean }
) {
  const db = getDb();

  if (opts?.replace) {
    await db.delete(chaptersTable).where(eq(chaptersTable.novelSlug, novelSlug));
  }

  for (const input of inputs) {
    await db.insert(chaptersTable).values({
      id: crypto.randomUUID(),
      novelSlug,
      slug: input.slug,
      title: input.title,
      order: input.order,
      summary: input.summary ?? null,
      content: input.content.trim(),
    });
  }

  await db
    .update(novelsTable)
    .set({ updatedAt: new Date() })
    .where(eq(novelsTable.slug, novelSlug));
}

export async function getMaxChapterOrder(novelSlug: string): Promise<number> {
  const rows = await getAdminChapterList(novelSlug);
  if (rows.length === 0) return 0;
  return Math.max(...rows.map((r) => r.order));
}

export async function updateChapter(
  id: string,
  novelSlug: string,
  input: Partial<ChapterInput>
) {
  const db = getDb();
  await db
    .update(chaptersTable)
    .set({
      ...(input.slug !== undefined ? { slug: input.slug } : {}),
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.order !== undefined ? { order: input.order } : {}),
      ...(input.summary !== undefined ? { summary: input.summary ?? null } : {}),
      ...(input.content !== undefined ? { content: input.content.trim() } : {}),
    })
    .where(eq(chaptersTable.id, id));

  await db
    .update(novelsTable)
    .set({ updatedAt: new Date() })
    .where(eq(novelsTable.slug, novelSlug));
}

export async function deleteChapter(id: string, novelSlug: string) {
  const db = getDb();
  await db.delete(chaptersTable).where(eq(chaptersTable.id, id));
  await db
    .update(novelsTable)
    .set({ updatedAt: new Date() })
    .where(eq(novelsTable.slug, novelSlug));
}

export async function getAdminChapterList(novelSlug: string) {
  const db = getDb();
  return db
    .select()
    .from(chaptersTable)
    .where(eq(chaptersTable.novelSlug, novelSlug))
    .orderBy(asc(chaptersTable.order));
}

export async function countChaptersByNovel(): Promise<Record<string, number>> {
  if (!isDatabaseEnabled()) return {};
  try {
    const db = getDb();
    const rows = await db.select({ novelSlug: chaptersTable.novelSlug }).from(chaptersTable);
    const counts: Record<string, number> = {};
    for (const row of rows) {
      counts[row.novelSlug] = (counts[row.novelSlug] || 0) + 1;
    }
    return counts;
  } catch {
    return {};
  }
}

export async function getChapterById(id: string) {
  const db = getDb();
  const rows = await db.select().from(chaptersTable).where(eq(chaptersTable.id, id)).limit(1);
  return rows[0];
}

export function parseGenre(raw: string): string[] {
  return raw
    .split(/[,，]/)
    .map((g) => g.trim())
    .filter(Boolean);
}

export function novelInputFromMeta(novel: NovelMeta): NovelInput {
  return {
    slug: novel.slug,
    title: novel.title,
    author: novel.author,
    description: novel.description,
    cover: novel.cover,
    genre: novel.genre,
    status: novel.status,
    freeChapters: novel.freeChapters,
    priceLabel: novel.priceLabel,
  };
}
