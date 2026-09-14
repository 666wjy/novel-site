import { NextRequest, NextResponse } from "next/server";
import { verifyPaddleWebhookSignature } from "@/lib/paddle";
import { addPurchase } from "@/lib/purchases";

type CustomData = {
  type?: string;
  novelSlug?: string;
  email?: string;
};

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("paddle-signature");

  if (!process.env.PADDLE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  if (!verifyPaddleWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let payload: {
    event_id?: string;
    event_type?: string;
    data?: {
      id?: string;
      status?: string;
      custom_data?: CustomData | null;
      customer_id?: string | null;
      details?: { totals?: unknown };
      billing_period?: { ends_at?: string | null } | null;
      current_billing_period?: { ends_at?: string | null } | null;
    };
  };

  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = payload.event_type || "";
  const data = payload.data || {};
  const custom = data.custom_data || {};
  const email = (custom.email || "").toLowerCase().trim();
  const type = custom.type as "novel_unlock" | "subscription" | undefined;
  const novelSlug = custom.novelSlug || undefined;
  const sessionId = data.id || payload.event_id || "";

  if (!email || !type || !sessionId) {
    return NextResponse.json({ received: true });
  }

  if (eventType === "transaction.completed" && type === "novel_unlock") {
    await addPurchase({
      email,
      type: "novel_unlock",
      novelSlug,
      stripeSessionId: sessionId,
    });
  }

  if (
    (eventType === "transaction.completed" ||
      eventType === "subscription.activated" ||
      eventType === "subscription.created") &&
    type === "subscription"
  ) {
    const endsAt =
      data.current_billing_period?.ends_at ||
      data.billing_period?.ends_at ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    await addPurchase({
      email,
      type: "subscription",
      stripeSessionId: `${sessionId}:${eventType}`,
      expiresAt: endsAt,
    });
  }

  return NextResponse.json({ received: true });
}

export async function GET(req: NextRequest) {
  const { getAccessToken } = await import("@/lib/purchases");
  const email = req.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }
  return NextResponse.json({ token: getAccessToken(email) });
}
