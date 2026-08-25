import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { addPurchase, getAccessToken } from "@/lib/purchases";

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature error:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const email = (session.metadata?.email || session.customer_email || "").toLowerCase();
    const type = session.metadata?.type as "novel_unlock" | "subscription";
    const novelSlug = session.metadata?.novelSlug || undefined;

    if (email && type) {
      addPurchase({
        email,
        type,
        novelSlug: type === "novel_unlock" ? novelSlug : undefined,
        stripeSessionId: session.id,
        expiresAt:
          type === "subscription"
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            : undefined,
      });
    }
  }

  return NextResponse.json({ received: true });
}

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }
  return NextResponse.json({ token: getAccessToken(email) });
}
