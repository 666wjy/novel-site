import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { createNovel, parseGenre } from "@/lib/novels-admin";

export async function POST(req: NextRequest) {
  const authError = await requireAdminApi();
  if (authError) return authError;

  try {
    const body = await req.json();
    const {
      slug,
      title,
      author,
      description,
      cover,
      genre,
      status,
      freeChapters,
      priceLabel,
    } = body as {
      slug?: string;
      title?: string;
      author?: string;
      description?: string;
      cover?: string;
      genre?: string;
      status?: "ongoing" | "completed";
      freeChapters?: number;
      priceLabel?: string;
    };

    if (!slug?.trim() || !title?.trim() || !author?.trim()) {
      return NextResponse.json({ error: "slug、title、author 必填" }, { status: 400 });
    }

    await createNovel({
      slug: slug.trim(),
      title: title.trim(),
      author: author.trim(),
      description: description?.trim() || "",
      cover: cover?.trim() || "/covers/default.jpg",
      genre: parseGenre(genre || ""),
      status: status || "ongoing",
      freeChapters: Number(freeChapters) || 3,
      priceLabel: priceLabel?.trim() || "$2.99",
    });

    return NextResponse.json({ ok: true, slug: slug.trim() });
  } catch (err) {
    console.error("Create novel error:", err);
    return NextResponse.json({ error: "创建失败，slug 可能已存在" }, { status: 500 });
  }
}
