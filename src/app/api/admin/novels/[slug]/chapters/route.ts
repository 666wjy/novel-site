import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { createChapter } from "@/lib/novels-admin";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function POST(req: NextRequest, { params }: Props) {
  const authError = await requireAdminApi();
  if (authError) return authError;

  const { slug } = await params;

  try {
    const body = await req.json();
    const { chapterSlug, title, order, summary, content } = body as {
      chapterSlug?: string;
      title?: string;
      order?: number;
      summary?: string;
      content?: string;
    };

    if (!chapterSlug?.trim() || !title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: "chapterSlug、title、content 必填" }, { status: 400 });
    }

    await createChapter(slug, {
      slug: chapterSlug.trim(),
      title: title.trim(),
      order: Number(order) || 1,
      summary: summary?.trim(),
      content: content.trim(),
    });

    return NextResponse.json({ ok: true, chapterSlug: chapterSlug.trim() });
  } catch (err) {
    console.error("Create chapter error:", err);
    return NextResponse.json({ error: "创建失败，章节 slug 可能已存在" }, { status: 500 });
  }
}
