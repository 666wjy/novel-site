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
    const { novelSlug, chapterSlug, authorName, content, quoteText } = body as {
      novelSlug?: string;
      chapterSlug?: string;
      authorName?: string;
      content?: string;
      quoteText?: string | null;
    };

    if (!novelSlug?.trim() || !chapterSlug?.trim()) {
      return NextResponse.json({ error: "Missing chapter info" }, { status: 400 });
    }

    const name = (authorName || "").trim();
    const text = (content || "").trim();
    const quote = (quoteText || "").trim();

    if (name.length > 40) {
      return NextResponse.json({ error: "Name must be at most 40 characters" }, { status: 400 });
    }
    if (text.length < 1 || text.length > 2000) {
      return NextResponse.json({ error: "Comment must be 1–2000 characters" }, { status: 400 });
    }
    if (quote && (quote.length < 1 || quote.length > 500)) {
      return NextResponse.json({ error: "Quoted text must be 1–500 characters" }, { status: 400 });
    }

    const comment = await createComment({
      novelSlug: novelSlug.trim(),
      chapterSlug: chapterSlug.trim(),
      authorName: name || "Anonymous",
      content: text,
      quoteText: quote || null,
    });

    return NextResponse.json({ comment });
  } catch (err) {
    console.error("Create comment error:", err);
    return NextResponse.json({ error: "Failed to post comment" }, { status: 500 });
  }
}
