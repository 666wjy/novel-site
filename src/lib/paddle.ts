import crypto from "crypto";
import { getSiteUrl } from "@/lib/site-url";

export { getSiteUrl };

function getApiKey(): string {
  const key = process.env.PADDLE_API_KEY;
  if (!key) throw new Error("PADDLE_API_KEY is not set");
  return key;
}

function getApiBase(): string {
  return process.env.PADDLE_ENV === "sandbox"
    ? "https://sandbox-api.paddle.com"
    : "https://api.paddle.com";
}

export function verifyPaddleWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!secret || !signatureHeader) return false;

  const parts: Record<string, string> = {};
  for (const segment of signatureHeader.split(";")) {
    const [k, v] = segment.split("=");
    if (k && v) parts[k.trim()] = v.trim();
  }

  const ts = parts.ts;
  const h1 = parts.h1;
  if (!ts || !h1) return false;

  const payload = `${ts}:${rawBody}`;
  const computed = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  const a = Buffer.from(computed, "utf8");
  const b = Buffer.from(h1, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

interface CreateTransactionOptions {
  priceId: string;
  email: string;
  custom: Record<string, string>;
}

interface PaddleTransactionResponse {
  data?: {
    id: string;
    checkout?: { url?: string | null };
  };
  error?: { detail?: string };
}

async function ensureCustomerId(email: string): Promise<string | undefined> {
  const base = getApiBase();
  const headers = {
    Authorization: `Bearer ${getApiKey()}`,
    "Content-Type": "application/json",
    "Paddle-Version": "1",
  };

  const listRes = await fetch(`${base}/customers?email=${encodeURIComponent(email)}`, {
    headers,
    cache: "no-store",
  });
  if (listRes.ok) {
    const listJson = (await listRes.json()) as { data?: Array<{ id: string }> };
    if (listJson.data?.[0]?.id) return listJson.data[0].id;
  }

  const createRes = await fetch(`${base}/customers`, {
    method: "POST",
    headers,
    body: JSON.stringify({ email }),
  });
  if (!createRes.ok) {
    console.error("Paddle create customer failed:", await createRes.text());
    return undefined;
  }
  const created = (await createRes.json()) as { data?: { id?: string } };
  return created.data?.id;
}

/** Creates a transaction and returns the hosted checkout URL (default payment link + _ptxn). */
export async function createPaddleCheckout(options: CreateTransactionOptions): Promise<{ id: string; url: string }> {
  const siteUrl = getSiteUrl();
  const paymentLink = `${siteUrl}/checkout`;
  const customerId = await ensureCustomerId(options.email);

  const body: Record<string, unknown> = {
    items: [{ price_id: options.priceId, quantity: 1 }],
    collection_mode: "automatic",
    custom_data: options.custom,
    checkout: {
      url: paymentLink,
    },
  };
  if (customerId) {
    body.customer_id = customerId;
  }

  const res = await fetch(`${getApiBase()}/transactions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
      "Paddle-Version": "1",
    },
    body: JSON.stringify(body),
  });

  const json = (await res.json()) as PaddleTransactionResponse;
  if (!res.ok || !json.data?.id) {
    console.error("Paddle create transaction error:", json);
    throw new Error(json.error?.detail || "Failed to create Paddle checkout");
  }

  const url = json.data.checkout?.url;
  if (!url) {
    throw new Error(
      "Paddle checkout URL missing — set Default payment link to https://your-site/checkout and approve the domain"
    );
  }

  return { id: json.data.id, url };
}

export async function getPaddleTransaction(transactionId: string) {
  const res = await fetch(`${getApiBase()}/transactions/${transactionId}`, {
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Paddle-Version": "1",
    },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return (await res.json()) as {
    data?: {
      id: string;
      status: string;
      custom_data?: {
        type?: string;
        novelSlug?: string;
        email?: string;
      } | null;
    };
  };
}

export async function fulfillPaddleTransaction(transactionId: string): Promise<{
  ok: boolean;
  status?: string;
  email?: string;
  type?: string;
  novelSlug?: string | null;
}> {
  const json = await getPaddleTransaction(transactionId);
  const data = json?.data;
  if (!data) return { ok: false };

  const status = data.status;
  const custom = data.custom_data || {};
  const email = (custom.email || "").toLowerCase().trim();
  const type = custom.type as "novel_unlock" | "subscription" | undefined;
  const novelSlug = custom.novelSlug || undefined;

  // paid/completed both mean money captured (WeChat may briefly be paid before completed)
  if ((status === "completed" || status === "paid") && email && type) {
    const { addPurchase } = await import("@/lib/purchases");
    if (type === "novel_unlock") {
      await addPurchase({
        email,
        type: "novel_unlock",
        novelSlug,
        stripeSessionId: data.id,
      });
    } else {
      await addPurchase({
        email,
        type: "subscription",
        stripeSessionId: data.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }
  }

  return {
    ok: status === "completed" || status === "paid",
    status,
    email: email || undefined,
    type,
    novelSlug: novelSlug ?? null,
  };
}
