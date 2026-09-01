import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { updateChapter, deleteChapter, getChapterById } from "@/lib/novels-admin";

interface Props {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: Props) {
  const authError = await requireAdminApi();
  if (authError) return authError;

  const { id } = await params;

  try {
    const chapter = await getChapterById(id);
    if (!chapter) {
      return NextResponse.json({ error: "章节不存在" }, { status: 404 });
    }

    const body = await req.json();
    const { chapterSlug, title, order, summary, content } = body as {
      chapterSlug?: string;
      title?: string;
      order?: number;
      summary?: string;
      content?: string;
    };

    await updateChapter(id, chapter.novelSlug, {
      ...(chapterSlug !== undefined ? { slug: chapterSlug.trim() } : {}),
      ...(title !== undefined ? { title: title.trim() } : {}),
      ...(order !== undefined ? { order: Number(order) } : {}),
      ...(summary !== undefined ? { summary: summary.trim() } : {}),
      ...(content !== undefined ? { content: content.trim() } : {}),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Update chapter error:", err);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Props) {
  const authError = await requireAdminApi();
  if (authError) return authError;

  const { id } = await params;

  try {
    const chapter = await getChapterById(id);
    if (!chapter) {
      return NextResponse.json({ error: "章节不存在" }, { status: 404 });
    }

    await deleteChapter(id, chapter.novelSlug);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Delete chapter error:", err);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
