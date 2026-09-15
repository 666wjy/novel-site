"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import Link from "next/link";

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

function buildSuccessUrl(): string {
  const site = window.location.origin;
  try {
    const raw = sessionStorage.getItem(PURCHASE_KEY);
    if (raw) {
      const data = JSON.parse(raw) as {
        email?: string;
        type?: string;
        novelSlug?: string | null;
      };
      const params = new URLSearchParams();
      if (data.email) params.set("email", data.email);
      if (data.type) params.set("type", data.type);
      if (data.novelSlug) params.set("novel", data.novelSlug);
      const q = params.toString();
      return q ? `${site}/success?${q}` : `${site}/success`;
    }
  } catch {
    // ignore
  }
  return `${site}/success`;
}

function openCheckout(transactionId: string) {
  const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
  if (!token || !window.Paddle) {
    throw new Error("Paddle.js not ready");
  }

  window.Paddle.Initialize({
    token,
    checkout: {
      settings: {
        displayMode: "overlay",
        theme: "light",
        successUrl: buildSuccessUrl(),
      },
    },
  });

  window.Paddle.Checkout.open({ transactionId });
}

export default function CheckoutPage() {
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

    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      if (window.Paddle) {
        clearInterval(timer);
        try {
          openCheckout(transactionId);
          setMessage("Opening Paddle checkout...");
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

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="py-20 text-center">
      <Script src="https://cdn.paddle.com/paddle/v2/paddle.js" strategy="afterInteractive" />
      {!failed && (
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      )}
      <p className="mt-4 text-ink-600">{message}</p>
      {failed && (
        <Link href="/" className="mt-4 inline-block text-accent hover:underline">
          Back to home
        </Link>
      )}
    </div>
  );
}
