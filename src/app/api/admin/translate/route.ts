import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { getNovel } from "@/lib/novels";
import {
  getAdminChapterList,
  getChapterById,
  updateChapter,
  updateNovel,
} from "@/lib/novels-admin";
import {
  sleep,
  translateChapter,
  translateNovelMeta,
} from "@/lib/gemini-translate";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * POST { slug, scope: "meta" | "chapter" | "all", chapterId? }
 * Translates Chinese novel content to English via free Gemini API and saves to DB.
 */
export async function POST(req: NextRequest) {
  const authError = await requireAdminApi();
  if (authError) return authError;

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      {
        error:
          "缺少 GEMINI_API_KEY。请到 https://aistudio.google.com/apikey 免费创建，并写入 .env.local / Netlify。",
      },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    const slug = String(body.slug || "");
    const scope = String(body.scope || "all") as "meta" | "chapter" | "all";
    const chapterId = body.chapterId ? String(body.chapterId) : undefined;

    const novel = await getNovel(slug);
    if (!novel) {
      return NextResponse.json({ error: "小说不存在" }, { status: 404 });
    }

    const result: {
      meta?: boolean;
      chapters: Array<{ id: string; title: string; ok: boolean; error?: string }>;
    } = { chapters: [] };

    if (scope === "meta" || scope === "all") {
      const meta = await translateNovelMeta({
        title: novel.title,
        author: novel.author,
        description: novel.description,
        genre: novel.genre,
      });
      await updateNovel(slug, {
        title: meta.title.trim(),
        author: meta.author.trim(),
        description: meta.description.trim(),
        genre: meta.genre.map((g) => g.trim()).filter(Boolean),
      });
      result.meta = true;
      if (scope === "all") await sleep(800);
    }

    if (scope === "chapter") {
      if (!chapterId) {
        return NextResponse.json({ error: "缺少 chapterId" }, { status: 400 });
      }
      const chapter = await getChapterById(chapterId);
      if (!chapter || chapter.novelSlug !== slug) {
        return NextResponse.json({ error: "章节不存在" }, { status: 404 });
      }
      try {
        const translated = await translateChapter({
          title: chapter.title,
          summary: chapter.summary,
          content: chapter.content,
        });
        await updateChapter(chapter.id, slug, {
          title: translated.title.trim(),
          summary: translated.summary.trim(),
          content: translated.content.trim(),
        });
        result.chapters.push({ id: chapter.id, title: translated.title, ok: true });
      } catch (err) {
        result.chapters.push({
          id: chapter.id,
          title: chapter.title,
          ok: false,
          error: err instanceof Error ? err.message : "翻译失败",
        });
      }
    }

    if (scope === "all") {
      const chapters = await getAdminChapterList(slug);
      for (const ch of chapters) {
        try {
          const translated = await translateChapter({
            title: ch.title,
            summary: ch.summary,
            content: ch.content,
          });
          await updateChapter(ch.id, slug, {
            title: translated.title.trim(),
            summary: translated.summary.trim(),
            content: translated.content.trim(),
          });
          result.chapters.push({ id: ch.id, title: translated.title, ok: true });
        } catch (err) {
          result.chapters.push({
            id: ch.id,
            title: ch.title,
            ok: false,
            error: err instanceof Error ? err.message : "翻译失败",
          });
        }
        await sleep(1200);
      }
    }

    const failed = result.chapters.filter((c) => !c.ok);
    return NextResponse.json({
      ok: failed.length === 0,
      ...result,
      failedCount: failed.length,
    });
  } catch (err) {
    console.error("Translate error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "翻译失败" },
      { status: 500 }
    );
  }
}
