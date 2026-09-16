import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { setFavorite } from "@/lib/library";
import { getNovel } from "@/lib/novels";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const body = await req.json();
  const novelSlug = String(body.novelSlug || "");
  const novel = await getNovel(novelSlug);
  if (!novel) {
    return NextResponse.json({ error: "作品不存在" }, { status: 404 });
  }

  await setFavorite(session.id, novelSlug, true);
  return NextResponse.json({ ok: true, favorited: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const novelSlug = req.nextUrl.searchParams.get("novelSlug") || "";
  if (!novelSlug) {
    return NextResponse.json({ error: "Missing novel" }, { status: 400 });
  }

  await setFavorite(session.id, novelSlug, false);
  return NextResponse.json({ ok: true, favorited: false });
}
