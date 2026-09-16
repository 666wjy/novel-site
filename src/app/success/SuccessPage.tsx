"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

async function verifyWithRetry(params: URLSearchParams, attempts = 12): Promise<{
  email: string;
  token: string;
  novelSlug: string | null;
}> {
  let lastError = "Payment not completed yet";
  for (let i = 0; i < attempts; i++) {
    const res = await fetch(`/api/verify-session?${params.toString()}`);
    const data = await res.json();
    if (res.ok && !data.error) {
      return data;
    }
    lastError = data.error || lastError;
    await new Promise((r) => setTimeout(r, 800));
  }
  throw new Error(lastError);
}

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [novelSlug, setNovelSlug] = useState<string | null>(null);

  useEffect(() => {
    let email = searchParams.get("email");
    let type = searchParams.get("type");
    let novel = searchParams.get("novel");
    const sessionId = searchParams.get("session_id");
    const txn = searchParams.get("txn");

    if ((!email || !type) && typeof window !== "undefined") {
      try {
        const raw = sessionStorage.getItem("sf_paddle_purchase");
        if (raw) {
          const saved = JSON.parse(raw) as {
            email?: string;
            type?: string;
            novelSlug?: string | null;
          };
          email = email || saved.email || null;
          type = type || saved.type || null;
          novel = novel || saved.novelSlug || null;
        }
      } catch {
        // ignore
      }
    }

    async function run() {
      if (txn?.startsWith("txn_")) {
        // Prefer confirming via Paddle API (helps WeChat deferred capture)
        for (let i = 0; i < 20; i++) {
          const res = await fetch(`/api/paddle/transaction?id=${encodeURIComponent(txn)}`);
          const data = await res.json();
          if (res.ok && data.paid && data.email) {
            try {
              sessionStorage.removeItem("sf_paddle_purchase");
            } catch {
              // ignore
            }
            setNovelSlug(data.novelSlug);
            setStatus("ok");
            setTimeout(() => {
              router.push(data.novelSlug ? `/novel/${data.novelSlug}` : "/library");
            }, 2000);
            return;
          }
          await new Promise((r) => setTimeout(r, 2000));
        }
      }

      if (!sessionId && (!email || !type)) {
        setStatus("error");
        return;
      }

      const params = new URLSearchParams();
      if (sessionId) params.set("session_id", sessionId);
      if (email) params.set("email", email);
      if (type) params.set("type", type);
      if (novel) params.set("novel", novel);

      try {
        const data = await verifyWithRetry(params);
        try {
          sessionStorage.removeItem("sf_paddle_purchase");
        } catch {
          // ignore
        }
        setNovelSlug(data.novelSlug);
        setStatus("ok");
        setTimeout(() => {
          router.push(data.novelSlug ? `/novel/${data.novelSlug}` : "/library");
        }, 2000);
      } catch {
        setStatus("error");
      }
    }

    void run();
  }, [searchParams, router]);

  return (
    <div className="py-20 text-center">
      {status === "loading" && (
        <>
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-accent border-t-transparent" />
          <p className="mt-4 text-ink-600">Confirming payment...</p>
        </>
      )}
      {status === "ok" && (
        <>
          <h1 className="mt-4 font-serif text-2xl font-bold text-ink-950">Unlocked!</h1>
          <p className="mt-2 text-ink-600">Redirecting...</p>
          {novelSlug && (
            <Link href={`/novel/${novelSlug}`} className="mt-4 inline-block text-accent hover:underline">
              Continue reading →
            </Link>
          )}
        </>
      )}
      {status === "error" && (
        <>
          <h1 className="font-serif text-2xl font-bold text-ink-950">Verification pending</h1>
          <p className="mt-2 text-ink-600">
            Payment may still be processing. Stay logged in and refresh in a minute.
          </p>
          <Link href="/" className="mt-4 inline-block text-accent hover:underline">
            Back to home
          </Link>
        </>
      )}
    </div>
  );
}
