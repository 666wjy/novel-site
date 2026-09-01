"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/admin");
      router.refresh();
      return;
    }

    const data = (await res.json()) as { error?: string };
    setError(data.error === "ADMIN_PASSWORD not configured" ? "后台密码未配置" : "密码错误");
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-ink-200 bg-white p-8 shadow-sm">
      <h1 className="font-serif text-2xl font-bold text-ink-950">管理后台登录</h1>
      <p className="mt-2 text-sm text-ink-500">输入 ADMIN_PASSWORD 环境变量中的密码</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-ink-700">
            密码
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-2"
            required
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-ink-900 px-4 py-2 text-white transition hover:bg-ink-800 disabled:opacity-50"
        >
          {loading ? "登录中…" : "登录"}
        </button>
      </form>
    </div>
  );
}
