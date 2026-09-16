"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface PaywallProps {
  novelSlug: string;
  novelTitle: string;
  priceLabel: string;
  chapterTitle: string;
  loggedIn: boolean;
}

const PURCHASE_KEY = "sf_paddle_purchase";

export function Paywall({
  novelSlug,
  novelTitle,
  priceLabel,
  chapterTitle,
  loggedIn,
}: PaywallProps) {
  const pathname = usePathname();
  const [loading, setLoading] = useState<"novel" | "sub" | null>(null);
  const [error, setError] = useState("");
  const next = pathname || `/novel/${novelSlug}`;

  async function checkout(type: "novel" | "subscription") {
    setError("");
    setLoading(type === "novel" ? "novel" : "sub");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ novelSlug, type }),
      });
      const data = await res.json();
      if (res.status === 401) {
        window.location.href = `/login?next=${encodeURIComponent(next)}`;
        return;
      }
      if (!res.ok) throw new Error(data.error || "Could not start checkout");

      sessionStorage.setItem(
        PURCHASE_KEY,
        JSON.stringify({
          email: data.email,
          type: data.type,
          novelSlug: data.novelSlug,
        })
      );

      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment failed. Please try again.");
      setLoading(null);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-ink-200/80 bg-white/80 shadow-sm">
      <div className="border-b border-ink-100 bg-gradient-to-br from-ink-50 via-amber-50/60 to-white px-6 py-8 text-center sm:px-8">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 ring-1 ring-accent/20">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5 text-accent"
            aria-hidden
          >
            <path
              fillRule="evenodd"
              d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h3 className="font-serif text-xl font-bold text-ink-950">Premium chapter</h3>
        <p className="mt-2 text-sm text-ink-600">
          {novelTitle} · {chapterTitle}
        </p>
        <p className="mt-3 text-sm text-ink-500">
          Free chapters end here. Sign in and unlock to keep reading.
        </p>
      </div>

      <div className="px-6 py-6 sm:px-8">
        <div className="mx-auto max-w-sm">
          {loggedIn ? (
            <>
              {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
              <button
                onClick={() => checkout("novel")}
                disabled={loading !== null}
                className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-dark disabled:opacity-60"
              >
                {loading === "novel" ? "Opening checkout..." : `Unlock this book · ${priceLabel}`}
              </button>
              <button
                onClick={() => checkout("subscription")}
                disabled={loading !== null}
                className="mt-3 w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm font-medium text-ink-700 transition hover:bg-ink-50 disabled:opacity-60"
              >
                {loading === "sub" ? "Opening checkout..." : "Site subscription · $9.99/mo"}
              </button>
            </>
          ) : (
            <div className="text-center">
              <Link
                href={`/login?next=${encodeURIComponent(next)}`}
                className="inline-flex w-full items-center justify-center rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-dark"
              >
                Sign in to unlock
              </Link>
              <p className="mt-3 text-sm text-ink-500">
                No account?{" "}
                <Link
                  href={`/register?next=${encodeURIComponent(next)}`}
                  className="text-accent hover:underline"
                >
                  Create one free
                </Link>
              </p>
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-ink-400">
          Payments secured by Paddle · Cards &amp; more
        </p>
      </div>
    </div>
  );
}
