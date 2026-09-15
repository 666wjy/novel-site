import { NextRequest, NextResponse } from "next/server";
import { fulfillPaddleTransaction } from "@/lib/paddle";
import { addPurchase, getAccessToken } from "@/lib/purchases";

export const runtime = "nodejs";

/**
 * Admin recovery: fulfill a paid Paddle txn (or manually grant unlock).
 * POST { password, transactionId? , email?, novelSlug?, type? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const password = String(body.password || "");
    if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const transactionId = body.transactionId as string | undefined;
    if (transactionId?.startsWith("txn_")) {
      const result = await fulfillPaddleTransaction(transactionId);
      if (!result.ok || !result.email) {
        return NextResponse.json(
          { error: "Transaction not paid or missing custom_data", result },
          { status: 400 }
        );
      }
      return NextResponse.json({
        ok: true,
        ...result,
        token: getAccessToken(result.email),
        unlockUrl: result.novelSlug
          ? `/novel/${result.novelSlug}?unlocked=1&email=${encodeURIComponent(result.email)}&token=${getAccessToken(result.email)}`
          : null,
      });
    }

    const email = String(body.email || "")
      .toLowerCase()
      .trim();
    const novelSlug = body.novelSlug ? String(body.novelSlug) : undefined;
    const type = (body.type as "novel_unlock" | "subscription") || "novel_unlock";
    const sessionId = String(body.sessionId || `manual_${Date.now()}`);

    if (!email.includes("@")) {
      return NextResponse.json({ error: "email required" }, { status: 400 });
    }

    await addPurchase({
      email,
      type,
      novelSlug,
      stripeSessionId: sessionId,
      ...(type === "subscription"
        ? { expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() }
        : {}),
    });

    const token = getAccessToken(email);
    return NextResponse.json({
      ok: true,
      email,
      type,
      novelSlug: novelSlug || null,
      token,
      unlockUrl: novelSlug
        ? `/novel/${novelSlug}?unlocked=1&email=${encodeURIComponent(email)}&token=${token}`
        : null,
    });
  } catch (err) {
    console.error("admin fulfill error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Fulfill failed" },
      { status: 500 }
    );
  }
}
