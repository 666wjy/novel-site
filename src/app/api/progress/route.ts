import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { upsertProgress } from "@/lib/library";
import { getChapter } from "@/lib/novels";

export const runtime = "nodejs";

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Please sign in" }, { status: 401 });
  }

  const body = await req.json();
  const novelSlug = String(body.novelSlug || "");
  const chapterSlug = String(body.chapterSlug || "");
  const chapter = await getChapter(novelSlug, chapterSlug);
  if (!chapter) {
    return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
  }

  await upsertProgress(session.id, novelSlug, chapterSlug);
  return NextResponse.json({ ok: true });
}
