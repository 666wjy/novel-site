import { NextRequest, NextResponse } from "next/server";
import { isDatabaseEnabled } from "@/db";
import { createComment, listChapterComments } from "@/lib/comments";

export async function GET(req: NextRequest) {
  if (!isDatabaseEnabled()) {
    return NextResponse.json({ comments: [] });
  }

  const novelSlug = req.nextUrl.searchParams.get("novelSlug");
  const chapterSlug = req.nextUrl.searchParams.get("chapterSlug");
  if (!novelSlug || !chapterSlug) {
    return NextResponse.json({ error: "Missing novelSlug or chapterSlug" }, { status: 400 });
  }

  const comments = await listChapterComments(novelSlug, chapterSlug);
  return NextResponse.json({ comments });
}

export async function POST(req: NextRequest) {
  if (!isDatabaseEnabled()) {
    return NextResponse.json({ error: "Comments require database" }, { status: 503 });
  }

  try {
    const body = await req.json();
    const { novelSlug, chapterSlug, authorName, content } = body as {
      novelSlug?: string;
      chapterSlug?: string;
      authorName?: string;
      content?: string;
    };

    if (!novelSlug?.trim() || !chapterSlug?.trim()) {
      return NextResponse.json({ error: "Missing chapter info" }, { status: 400 });
    }

    const name = (authorName || "").trim();
    const text = (content || "").trim();

    if (name.length < 2 || name.length > 40) {
      return NextResponse.json({ error: "Name must be 2–40 characters" }, { status: 400 });
    }
    if (text.length < 2 || text.length > 2000) {
      return NextResponse.json({ error: "Comment must be 2–2000 characters" }, { status: 400 });
    }

    const comment = await createComment({
      novelSlug: novelSlug.trim(),
      chapterSlug: chapterSlug.trim(),
      authorName: name,
      content: text,
    });

    return NextResponse.json({ comment });
  } catch (err) {
    console.error("Create comment error:", err);
    return NextResponse.json({ error: "Failed to post comment" }, { status: 500 });
  }
}
