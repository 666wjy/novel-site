"use client";

import { useState } from "react";

interface PaywallProps {
  novelSlug: string;
  novelTitle: string;
  priceLabel: string;
  chapterTitle: string;
}

export function Paywall({ novelSlug, novelTitle, priceLabel, chapterTitle }: PaywallProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState<"novel" | "sub" | null>(null);
  const [error, setError] = useState("");

  async function checkout(type: "novel" | "subscription") {
    if (!email.trim() || !email.includes("@")) {
      setError("请输入有效邮箱，解锁后会发送到该邮箱");
      return;
    }
    setError("");
    setLoading(type === "novel" ? "novel" : "sub");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), novelSlug, type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "创建支付失败");
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "支付失败，请稍后重试");
      setLoading(null);
    }
  }

  return (
    <div className="rounded-2xl border border-accent/20 bg-gradient-to-b from-amber-50 to-white p-8 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-2xl">
        🔒
      </div>
      <h3 className="font-serif text-xl font-bold text-ink-950">付费章节</h3>
      <p className="mt-2 text-sm text-ink-600">
        《{novelTitle}》· {chapterTitle}
      </p>
      <p className="mt-4 text-sm text-ink-500">免费章节已读完，解锁后可继续阅读</p>

      <div className="mx-auto mt-6 max-w-sm">
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-ink-200 px-4 py-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

        <button
          onClick={() => checkout("novel")}
          disabled={loading !== null}
          className="mt-4 w-full rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-dark disabled:opacity-60"
        >
          {loading === "novel" ? "跳转支付中..." : `解锁本书 · ${priceLabel}`}
        </button>

        <button
          onClick={() => checkout("subscription")}
          disabled={loading !== null}
          className="mt-3 w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm font-medium text-ink-700 transition hover:bg-ink-50 disabled:opacity-60"
        >
          {loading === "sub" ? "跳转支付中..." : "订阅全站 · $9.99/月"}
        </button>
      </div>

      <p className="mt-4 text-xs text-ink-400">支付由 Stripe 安全处理 · 支持信用卡</p>
    </div>
  );
}
