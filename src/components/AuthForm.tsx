"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface AuthFormProps {
  mode: "login" | "register";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/library";
  const presetEmail = searchParams.get("email") || "";

  const [email, setEmail] = useState(presetEmail);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isLogin = mode === "login";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(isLogin ? "/api/auth/login" : "/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "失败");
      router.push(data.next || next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "失败");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="font-serif text-3xl font-bold text-ink-950">
        {isLogin ? "登录" : "注册账号"}
      </h1>
      <p className="mt-2 text-sm text-ink-500">
        {isLogin
          ? "用购买时的同一邮箱登录，即可找回已解锁作品。"
          : "注册后解锁、收藏和阅读进度都会保存在账号里。"}
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="block text-sm">
          <span className="text-ink-600">邮箱</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </label>
        <label className="block text-sm">
          <span className="text-ink-600">密码{!isLogin && "（至少 8 位）"}</span>
          <input
            type="password"
            required
            minLength={isLogin ? undefined : 8}
            autoComplete={isLogin ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-accent-dark disabled:opacity-60"
        >
          {loading ? "请稍候..." : isLogin ? "登录" : "创建账号"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        {isLogin ? (
          <>
            还没有账号？{" "}
            <Link
              href={`/register?next=${encodeURIComponent(next)}${email ? `&email=${encodeURIComponent(email)}` : ""}`}
              className="text-accent hover:underline"
            >
              去注册
            </Link>
          </>
        ) : (
          <>
            已有账号？{" "}
            <Link
              href={`/login?next=${encodeURIComponent(next)}${email ? `&email=${encodeURIComponent(email)}` : ""}`}
              className="text-accent hover:underline"
            >
              去登录
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
