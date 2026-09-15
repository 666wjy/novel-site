import { NextRequest, NextResponse } from "next/server";
import { getAccessToken, getPurchasesByEmail, findPurchaseBySession } from "@/lib/purchases";

export const runtime = "nodejs";

/**
 * After Paddle redirect, unlock from webhook-written purchases.
 * Success page retries until the webhook lands.
 */
export async function GET(req: NextRequest) {
  try {
    const email = (req.nextUrl.searchParams.get("email") || "").toLowerCase().trim();
    const type = req.nextUrl.searchParams.get("type") as "novel_unlock" | "subscription" | null;
    const novelSlug = req.nextUrl.searchParams.get("novel") || undefined;
    const sessionId = req.nextUrl.searchParams.get("session_id");

    if (sessionId) {
      const existing = await findPurchaseBySession(sessionId);
      if (existing) {
        return NextResponse.json({
          email: existing.email,
          token: getAccessToken(existing.email),
          novelSlug: existing.novelSlug ?? null,
        });
      }
      return NextResponse.json({ error: "Payment not completed yet" }, { status: 404 });
    }

    if (!email || !type) {
      return NextResponse.json({ error: "Missing email or type" }, { status: 400 });
    }

    const purchases = await getPurchasesByEmail(email);
    const now = Date.now();

    const match = purchases.find((p) => {
      if (type === "subscription") {
        return p.type === "subscription" && (!p.expiresAt || new Date(p.expiresAt).getTime() > now);
      }
      return p.type === "novel_unlock" && (!novelSlug || p.novelSlug === novelSlug);
    });

    if (!match) {
      return NextResponse.json({ error: "Payment not completed yet" }, { status: 404 });
    }

    return NextResponse.json({
      email,
      token: getAccessToken(email),
      novelSlug: type === "novel_unlock" ? novelSlug || match.novelSlug || null : null,
    });
  } catch (err) {
    console.error("verify-session error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Verify failed" },
      { status: 500 }
    );
  }
}
