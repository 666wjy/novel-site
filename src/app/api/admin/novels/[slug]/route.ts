import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { updateNovel, parseGenre } from "@/lib/novels-admin";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function PUT(req: NextRequest, { params }: Props) {
  const authError = await requireAdminApi();
  if (authError) return authError;

  const { slug } = await params;

  try {
    const body = await req.json();
    const {
      title,
      author,
      description,
      cover,
      genre,
      status,
      freeChapters,
      priceLabel,
    } = body as {
      title?: string;
      author?: string;
      description?: string;
      cover?: string;
      genre?: string;
      status?: "ongoing" | "completed";
      freeChapters?: number;
      priceLabel?: string;
    };

    await updateNovel(slug, {
      ...(title !== undefined ? { title: title.trim() } : {}),
      ...(author !== undefined ? { author: author.trim() } : {}),
      ...(description !== undefined ? { description: description.trim() } : {}),
      ...(cover !== undefined ? { cover: cover.trim() } : {}),
      ...(genre !== undefined ? { genre: parseGenre(genre) } : {}),
      ...(status !== undefined ? { status } : {}),
      ...(freeChapters !== undefined ? { freeChapters: Number(freeChapters) } : {}),
      ...(priceLabel !== undefined ? { priceLabel: priceLabel.trim() } : {}),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Update novel error:", err);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}
