import { NextResponse } from "next/server";
import { getSiteSettings } from "@/lib/site-settings";

export async function GET() {
  const s = await getSiteSettings();
  return NextResponse.json({
    siteName: s.siteName,
    tagline: s.tagline,
  });
}
