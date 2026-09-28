import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { getSiteSettings, saveSiteSettings } from "@/lib/site-settings";

export async function GET() {
  const authError = await requireAdminApi();
  if (authError) return authError;
  return NextResponse.json(await getSiteSettings());
}

export async function PUT(req: NextRequest) {
  const authError = await requireAdminApi();
  if (authError) return authError;
  try {
    const body = await req.json();
    const siteName = String(body.siteName || "").trim();
    const tagline = String(body.tagline || "").trim();
    const freeChaptersDefault = Number(body.freeChaptersDefault);
    const featuredSlugs = Array.isArray(body.featuredSlugs)
      ? body.featuredSlugs.map((s: unknown) => String(s).trim()).filter(Boolean)
      : String(body.featuredSlugs || "")
          .split(/[\n,，]/)
          .map((s) => s.trim())
          .filter(Boolean);

    if (siteName.length < 1 || siteName.length > 40) {
      return NextResponse.json({ error: "站点名 1–40 字" }, { status: 400 });
    }
    if (!Number.isFinite(freeChaptersDefault) || freeChaptersDefault < 0 || freeChaptersDefault > 99) {
      return NextResponse.json({ error: "免费章数需为 0–99" }, { status: 400 });
    }

    const saved = await saveSiteSettings({
      siteName,
      tagline: tagline || "Original fiction",
      freeChaptersDefault,
      featuredSlugs,
    });
    return NextResponse.json(saved);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "保存失败" },
      { status: 500 }
    );
  }
}
