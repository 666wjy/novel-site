import { config } from "dotenv";
config({ path: ".env.local" });
config();
import fs from "fs";
import path from "path";
import crypto from "crypto";
import matter from "gray-matter";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/db/schema";

const CONTENT_DIR = path.join(process.cwd(), "content");
const NOVELS_DIR = path.join(CONTENT_DIR, "novels");

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ 请先在 .env.local 中设置 DATABASE_URL");
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql, { schema });

  const indexPath = path.join(CONTENT_DIR, "novels.json");
  if (!fs.existsSync(indexPath)) {
    console.error("❌ 找不到 content/novels.json");
    process.exit(1);
  }

  const novels = JSON.parse(fs.readFileSync(indexPath, "utf-8")) as Array<{
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
  }>;

  console.log(`📚 导入 ${novels.length} 本小说...`);

  for (const novel of novels) {
    await db
      .insert(schema.novels)
      .values({
        slug: novel.slug,
        title: novel.title,
        author: novel.author,
        description: novel.description,
        cover: novel.cover,
        genre: novel.genre,
        status: novel.status,
        freeChapters: novel.freeChapters,
        priceLabel: novel.priceLabel,
        updatedAt: new Date(novel.updatedAt),
      })
      .onConflictDoUpdate({
        target: schema.novels.slug,
        set: {
          title: novel.title,
          author: novel.author,
          description: novel.description,
          cover: novel.cover,
          genre: novel.genre,
          status: novel.status,
          freeChapters: novel.freeChapters,
          priceLabel: novel.priceLabel,
          updatedAt: new Date(novel.updatedAt),
        },
      });

    const chaptersDir = path.join(NOVELS_DIR, novel.slug, "chapters");
    if (!fs.existsSync(chaptersDir)) continue;

    const files = fs.readdirSync(chaptersDir).filter((f) => f.endsWith(".md"));
    console.log(`  📖 ${novel.title}：${files.length} 章`);

    for (const filename of files) {
      const raw = fs.readFileSync(path.join(chaptersDir, filename), "utf-8");
      const { data, content } = matter(raw);
      const chapterSlug = data.slug as string;

      await db
        .insert(schema.chapters)
        .values({
          id: crypto.randomUUID(),
          novelSlug: novel.slug,
          slug: chapterSlug,
          title: data.title as string,
          order: data.order as number,
          summary: (data.summary as string) ?? null,
          content: content.trim(),
        })
        .onConflictDoUpdate({
          target: [schema.chapters.novelSlug, schema.chapters.slug],
          set: {
            title: data.title as string,
            order: data.order as number,
            summary: (data.summary as string) ?? null,
            content: content.trim(),
          },
        });
    }
  }

  console.log("✅ 数据导入完成");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
