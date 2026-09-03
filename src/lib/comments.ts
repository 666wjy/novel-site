import crypto from "crypto";
import { and, desc, eq } from "drizzle-orm";
import { getDb, isDatabaseEnabled } from "@/db";
import { comments as commentsTable } from "@/db/schema";

export interface CommentRecord {
  id: string;
  novelSlug: string;
  chapterSlug: string;
  authorName: string;
  content: string;
  createdAt: string;
}

function mapComment(row: typeof commentsTable.$inferSelect): CommentRecord {
  return {
    id: row.id,
    novelSlug: row.novelSlug,
    chapterSlug: row.chapterSlug,
    authorName: row.authorName,
    content: row.content,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listChapterComments(
  novelSlug: string,
  chapterSlug: string
): Promise<CommentRecord[]> {
  if (!isDatabaseEnabled()) return [];
  const db = getDb();
  const rows = await db
    .select()
    .from(commentsTable)
    .where(and(eq(commentsTable.novelSlug, novelSlug), eq(commentsTable.chapterSlug, chapterSlug)))
    .orderBy(desc(commentsTable.createdAt));
  return rows.map(mapComment);
}

export async function listRecentComments(limit = 30): Promise<CommentRecord[]> {
  if (!isDatabaseEnabled()) return [];
  const db = getDb();
  const rows = await db
    .select()
    .from(commentsTable)
    .orderBy(desc(commentsTable.createdAt))
    .limit(limit);
  return rows.map(mapComment);
}

export async function createComment(input: {
  novelSlug: string;
  chapterSlug: string;
  authorName: string;
  content: string;
}): Promise<CommentRecord> {
  const db = getDb();
  const entry = {
    id: crypto.randomUUID(),
    novelSlug: input.novelSlug,
    chapterSlug: input.chapterSlug,
    authorName: input.authorName.trim().slice(0, 40),
    content: input.content.trim().slice(0, 2000),
    createdAt: new Date(),
  };
  await db.insert(commentsTable).values(entry);
  return {
    id: entry.id,
    novelSlug: entry.novelSlug,
    chapterSlug: entry.chapterSlug,
    authorName: entry.authorName,
    content: entry.content,
    createdAt: entry.createdAt.toISOString(),
  };
}

export async function deleteComment(id: string): Promise<void> {
  const db = getDb();
  await db.delete(commentsTable).where(eq(commentsTable.id, id));
}

export async function countComments(): Promise<number> {
  if (!isDatabaseEnabled()) return 0;
  const db = getDb();
  const rows = await db.select({ id: commentsTable.id }).from(commentsTable);
  return rows.length;
}
