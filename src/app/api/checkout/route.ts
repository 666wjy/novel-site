import { NextRequest, NextResponse } from "next/server";
import { getNovel } from "@/lib/novels";
import { getStripe, getSiteUrl } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, novelSlug, type } = body as {
      email: string;
      novelSlug?: string;
      type: "novel" | "subscription";
    };

    if (!email?.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const stripe = getStripe();
    const siteUrl = getSiteUrl();

    if (type === "novel") {
      if (!novelSlug) {
        return NextResponse.json({ error: "Missing novel" }, { status: 400 });
      }
      const novel = getNovel(novelSlug);
      if (!novel) {
        return NextResponse.json({ error: "Novel not found" }, { status: 404 });
      }

      const priceId = process.env.STRIPE_PRICE_NOVEL_UNLOCK;
      if (!priceId) {
        return NextResponse.json({ error: "Stripe price not configured" }, { status: 500 });
      }

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: email,
        line_items: [{ price: priceId, quantity: 1 }],
        metadata: { type: "novel_unlock", novelSlug, email },
        success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl}/novel/${novelSlug}`,
      });

      return NextResponse.json({ url: session.url });
    }

    const subPriceId = process.env.STRIPE_PRICE_SUBSCRIPTION;
    if (!subPriceId) {
      return NextResponse.json({ error: "Subscription price not configured" }, { status: 500 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      line_items: [{ price: subPriceId, quantity: 1 }],
      metadata: { type: "subscription", email, novelSlug: novelSlug || "" },
      success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Checkout failed" },
      { status: 500 }
    );
  }
}
