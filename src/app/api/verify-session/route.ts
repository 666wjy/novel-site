import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { addPurchase, findPurchaseBySession, getAccessToken } from "@/lib/purchases";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid" && session.status !== "complete") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }

    const email = (session.metadata?.email || session.customer_email || "").toLowerCase();
    const type = session.metadata?.type as "novel_unlock" | "subscription";
    const novelSlug = session.metadata?.novelSlug || undefined;

    if (!email || !type) {
      return NextResponse.json({ error: "Invalid session metadata" }, { status: 400 });
    }

    if (!findPurchaseBySession(sessionId)) {
      addPurchase({
        email,
        type,
        novelSlug: type === "novel_unlock" ? novelSlug : undefined,
        stripeSessionId: sessionId,
        expiresAt:
          type === "subscription"
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            : undefined,
      });
    }

    return NextResponse.json({
      email,
      token: getAccessToken(email),
      novelSlug: type === "novel_unlock" ? novelSlug : null,
    });
  } catch (err) {
    console.error("Verify session error:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
