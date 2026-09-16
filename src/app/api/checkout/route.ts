import { NextRequest, NextResponse } from "next/server";
import { getNovel } from "@/lib/novels";
import { createPaddleCheckout } from "@/lib/paddle";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "请先登录后再解锁" }, { status: 401 });
    }

    const body = await req.json();
    const { novelSlug, type } = body as {
      novelSlug?: string;
      type: "novel" | "subscription";
    };

    const normalizedEmail = session.email;

    if (type === "novel") {
      if (!novelSlug) {
        return NextResponse.json({ error: "Missing novel" }, { status: 400 });
      }
      const novel = await getNovel(novelSlug);
      if (!novel) {
        return NextResponse.json({ error: "Novel not found" }, { status: 404 });
      }

      const priceId = process.env.PADDLE_PRICE_NOVEL_UNLOCK;
      if (!priceId) {
        return NextResponse.json({ error: "Paddle novel price not configured" }, { status: 500 });
      }

      const checkout = await createPaddleCheckout({
        priceId,
        email: normalizedEmail,
        custom: {
          type: "novel_unlock",
          novelSlug,
          email: normalizedEmail,
        },
      });

      return NextResponse.json({
        url: checkout.url,
        transactionId: checkout.id,
        email: normalizedEmail,
        type: "novel_unlock",
        novelSlug,
      });
    }

    const subPriceId = process.env.PADDLE_PRICE_SUBSCRIPTION;
    if (!subPriceId) {
      return NextResponse.json({ error: "Paddle subscription price not configured" }, { status: 500 });
    }

    const checkout = await createPaddleCheckout({
      priceId: subPriceId,
      email: normalizedEmail,
      custom: {
        type: "subscription",
        email: normalizedEmail,
        novelSlug: novelSlug || "",
      },
    });

    return NextResponse.json({
      url: checkout.url,
      transactionId: checkout.id,
      email: normalizedEmail,
      type: "subscription",
      novelSlug: novelSlug || null,
    });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Checkout failed" },
      { status: 500 }
    );
  }
}
