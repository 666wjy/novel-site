"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    Paddle?: {
      Environment?: { set: (env: string) => void };
      Initialize: (options: Record<string, unknown>) => void;
      Checkout: {
        open: (options: Record<string, unknown>) => void;
      };
    };
  }
}

const PURCHASE_KEY = "sf_paddle_purchase";

function buildSuccessUrl(transactionId?: string): string {
  const site = window.location.origin;
  const params = new URLSearchParams();
  if (transactionId) params.set("txn", transactionId);

  try {
    const raw = sessionStorage.getItem(PURCHASE_KEY);
    if (raw) {
      const data = JSON.parse(raw) as {
        email?: string;
        type?: string;
        novelSlug?: string | null;
      };
      if (data.email) params.set("email", data.email);
      if (data.type) params.set("type", data.type);
      if (data.novelSlug) params.set("novel", data.novelSlug);
    }
  } catch {
    // ignore
  }

  const q = params.toString();
  return q ? `${site}/success?${q}` : `${site}/success`;
}

function goSuccess(transactionId: string) {
  window.location.href = buildSuccessUrl(transactionId);
}

async function pollPaid(transactionId: string): Promise<boolean> {
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`/api/paddle/transaction?id=${encodeURIComponent(transactionId)}`);
      const data = await res.json();
      if (res.ok && data.paid) {
        if (data.email) {
          sessionStorage.setItem(
            PURCHASE_KEY,
            JSON.stringify({
              email: data.email,
              type: data.type,
              novelSlug: data.novelSlug,
            })
          );
        }
        return true;
      }
    } catch {
      // keep polling
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  return false;
}

function openCheckout(transactionId: string, onMessage: (msg: string) => void) {
  const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
  if (!token || !window.Paddle) {
    throw new Error("Paddle.js not ready");
  }

  window.Paddle.Initialize({
    token,
    eventCallback: (event: { name?: string }) => {
      if (event?.name === "checkout.completed") {
        onMessage("Payment received. Confirming...");
        // WeChat may take a few minutes to fully capture; still send user to success.
        setTimeout(() => goSuccess(transactionId), 1500);
      }
    },
    checkout: {
      settings: {
        displayMode: "overlay",
        theme: "light",
        successUrl: buildSuccessUrl(transactionId),
      },
    },
  });

  window.Paddle.Checkout.open({
    transactionId,
    settings: {
      successUrl: buildSuccessUrl(transactionId),
    },
  });
}

export default function CheckoutPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Loading checkout...");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const transactionId = params.get("_ptxn") || params.get("transaction_id");
    if (!transactionId) {
      setMessage("Missing payment session. Go back and try unlock again.");
      setFailed(true);
      return;
    }

    if (!process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN) {
      setMessage("Paddle client token is not configured on this site.");
      setFailed(true);
      return;
    }

    let cancelled = false;
    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      if (window.Paddle) {
        clearInterval(timer);
        // If WeChat already paid, don't hang forever on overlay.
        void pollPaid(transactionId).then((paid) => {
          if (cancelled) return;
          if (paid) {
            goSuccess(transactionId);
            return;
          }
        });

        try {
          openCheckout(transactionId, setMessage);
          setMessage("Opening Paddle checkout... If you already paid with WeChat, wait up to 10 minutes or refresh.");
        } catch (e) {
          setFailed(true);
          setMessage(e instanceof Error ? e.message : "Failed to open checkout");
        }
      } else if (tries > 40) {
        clearInterval(timer);
        setFailed(true);
        setMessage("Paddle.js failed to load. Please refresh and try again.");
      }
    }, 200);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [router]);

  return (
    <div className="py-20 text-center">
      <Script src="https://cdn.paddle.com/paddle/v2/paddle.js" strategy="afterInteractive" />
      {!failed && (
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      )}
      <p className="mt-4 mx-auto max-w-md text-ink-600">{message}</p>
      {failed && (
        <Link href="/" className="mt-4 inline-block text-accent hover:underline">
          Back to home
        </Link>
      )}
    </div>
  );
}
