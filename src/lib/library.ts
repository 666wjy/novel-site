import crypto from "crypto";
import { and, desc, eq } from "drizzle-orm";
import { getDb, isDatabaseEnabled } from "@/db";
import { favorites as favoritesTable, readingProgress as progressTable } from "@/db/schema";

export async function isFavorited(userId: string, novelSlug: string): Promise<boolean> {
  if (!isDatabaseEnabled()) return false;
  const db = getDb();
  const rows = await db
    .select({ id: favoritesTable.id })
    .from(favoritesTable)
    .where(and(eq(favoritesTable.userId, userId), eq(favoritesTable.novelSlug, novelSlug)))
    .limit(1);
  return rows.length > 0;
}

export async function listFavoriteSlugs(userId: string): Promise<string[]> {
  if (!isDatabaseEnabled()) return [];
  const db = getDb();
  const rows = await db
    .select({ novelSlug: favoritesTable.novelSlug })
    .from(favoritesTable)
    .where(eq(favoritesTable.userId, userId))
    .orderBy(desc(favoritesTable.createdAt));
  return rows.map((r) => r.novelSlug);
}

export async function setFavorite(userId: string, novelSlug: string, on: boolean) {
  if (!isDatabaseEnabled()) throw new Error("Database is required");
  const db = getDb();
  if (!on) {
    await db
      .delete(favoritesTable)
      .where(and(eq(favoritesTable.userId, userId), eq(favoritesTable.novelSlug, novelSlug)));
    return;
  }
  await db
    .insert(favoritesTable)
    .values({
      id: crypto.randomUUID(),
      userId,
      novelSlug,
    })
    .onConflictDoNothing({ target: [favoritesTable.userId, favoritesTable.novelSlug] });
}

export async function getProgress(
  userId: string,
  novelSlug: string
): Promise<{ chapterSlug: string; updatedAt: string } | null> {
  if (!isDatabaseEnabled()) return null;
  const db = getDb();
  const rows = await db
    .select()
    .from(progressTable)
    .where(and(eq(progressTable.userId, userId), eq(progressTable.novelSlug, novelSlug)))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  return { chapterSlug: row.chapterSlug, updatedAt: row.updatedAt.toISOString() };
}

export async function listProgress(userId: string) {
  if (!isDatabaseEnabled()) return [];
  const db = getDb();
  return db
    .select()
    .from(progressTable)
    .where(eq(progressTable.userId, userId))
    .orderBy(desc(progressTable.updatedAt));
}

export async function upsertProgress(userId: string, novelSlug: string, chapterSlug: string) {
  if (!isDatabaseEnabled()) return;
  const db = getDb();
  const now = new Date();
  await db
    .insert(progressTable)
    .values({
      id: crypto.randomUUID(),
      userId,
      novelSlug,
      chapterSlug,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [progressTable.userId, progressTable.novelSlug],
      set: { chapterSlug, updatedAt: now },
    });
}
