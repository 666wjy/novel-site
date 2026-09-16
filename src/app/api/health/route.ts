import { NextResponse } from "next/server";
import { isDatabaseEnabled } from "@/db";

export const runtime = "nodejs";

/** Safe env presence check for production debugging (no secret values). */
export async function GET() {
  return NextResponse.json({
    ok: true,
    database: isDatabaseEnabled(),
    paddleApiKey: Boolean(process.env.PADDLE_API_KEY),
    paddleWebhookSecret: Boolean(process.env.PADDLE_WEBHOOK_SECRET),
    paddleClientToken: Boolean(process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN),
    paddlePriceNovel: Boolean(process.env.PADDLE_PRICE_NOVEL_UNLOCK),
    accessTokenSecret: Boolean(process.env.ACCESS_TOKEN_SECRET),
    authSecret: Boolean(process.env.AUTH_SECRET),
    geminiApiKey: Boolean(process.env.GEMINI_API_KEY),
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || null,
  });
}
