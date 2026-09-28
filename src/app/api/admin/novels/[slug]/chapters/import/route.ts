import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { getNovel } from "@/lib/novels";
import {
  createChaptersBulk,
  getAdminChapterList,
  getMaxChapterOrder,
  type ChapterInput,
} from "@/lib/novels-admin";
import { splitTxtIntoChapters } from "@/lib/split-txt-chapters";

interface Props {
  params: Promise<{ slug: string }>;
}

const MAX_CHARS = 2_500_000; // ~2.5MB of text

export async function POST(req: NextRequest, { params }: Props) {
  const authError = await requireAdminApi();
  if (authError) return authError;

  const { slug } = await params;
  const novel = await getNovel(slug);
  if (!novel) {
    return NextResponse.json({ error: "小说不存在" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const {
      text,
      replace = false,
      previewOnly = false,
    } = body as {
      text?: string;
      replace?: boolean;
      previewOnly?: boolean;
    };

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "请提供 TXT 文本内容" }, { status: 400 });
    }
    if (text.length > MAX_CHARS) {
      return NextResponse.json(
        { error: `文件太大（>${MAX_CHARS} 字符），请拆成多本或压缩后再试` },
        { status: 400 }
      );
    }

    const { chapters, mode, warning } = splitTxtIntoChapters(text);
    if (chapters.length === 0) {
      return NextResponse.json({ error: warning || "未能识别出任何章节" }, { status: 400 });
    }

    if (previewOnly) {
      return NextResponse.json({
        ok: true,
        preview: true,
        mode,
        warning,
        count: chapters.length,
        chapters: chapters.map((c) => ({
          order: c.order,
          title: c.title,
          slug: c.slug,
          chars: c.content.length,
          preview: c.content.slice(0, 120),
        })),
      });
    }

    let inputs: ChapterInput[] = chapters.map((c) => ({
      slug: c.slug,
      title: c.title,
      order: c.order,
      summary: c.content.replace(/\s+/g, " ").trim().slice(0, 80),
      content: c.content,
    }));

    if (!replace) {
      const maxOrder = await getMaxChapterOrder(slug);
      const existing = await getAdminChapterList(slug);
      const usedSlugs = new Set(existing.map((c) => c.slug));

      inputs = inputs.map((c, i) => {
        let order = maxOrder + i + 1;
        let slugCandidate = `chapter-${String(order).padStart(2, "0")}`;
        let n = 0;
        while (usedSlugs.has(slugCandidate)) {
          n += 1;
          slugCandidate = `chapter-${String(order).padStart(2, "0")}-${n}`;
        }
        usedSlugs.add(slugCandidate);
        return { ...c, order, slug: slugCandidate };
      });
    }

    await createChaptersBulk(slug, inputs, { replace: Boolean(replace) });

    return NextResponse.json({
      ok: true,
      mode,
      warning,
      imported: inputs.length,
      replace: Boolean(replace),
    });
  } catch (err) {
    console.error("Import TXT error:", err);
    return NextResponse.json({ error: "导入失败，请检查文件格式或 slug 冲突" }, { status: 500 });
  }
}
