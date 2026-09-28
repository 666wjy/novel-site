"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Settings = {
  siteName: string;
  tagline: string;
  freeChaptersDefault: number;
  featuredSlugs: string[];
};

export function SettingsForm({ initial }: { initial: Settings }) {
  const router = useRouter();
  const [form, setForm] = useState({
    siteName: initial.siteName,
    tagline: initial.tagline,
    freeChaptersDefault: initial.freeChaptersDefault,
    featured: initial.featuredSlugs.join("\n"),
  });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        siteName: form.siteName,
        tagline: form.tagline,
        freeChaptersDefault: form.freeChaptersDefault,
        featuredSlugs: form.featured,
      }),
    });
    const data = (await res.json()) as { error?: string };
    setBusy(false);
    if (!res.ok) {
      setMsg(data.error || "保存失败");
      return;
    }
    setMsg("已保存。前台站名、推荐书会按此更新。");
    router.refresh();
  }

  return (
    <form onSubmit={save} className="space-y-4 rounded-2xl border border-ink-200 bg-white p-6">
      <label className="block text-sm">
        <span className="font-medium text-ink-800">站点名</span>
        <input
          value={form.siteName}
          onChange={(e) => setForm({ ...form, siteName: e.target.value })}
          className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-2"
          required
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium text-ink-800">一句话介绍</span>
        <input
          value={form.tagline}
          onChange={(e) => setForm({ ...form, tagline: e.target.value })}
          className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium text-ink-800">新书默认免费章数</span>
        <p className="text-xs text-ink-400">类似微信读书试读。已有书仍以该书自己的「免费章节数」为准。</p>
        <input
          type="number"
          min={0}
          max={99}
          value={form.freeChaptersDefault}
          onChange={(e) => setForm({ ...form, freeChaptersDefault: Number(e.target.value) })}
          className="mt-1 w-32 rounded-lg border border-ink-200 px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium text-ink-800">发现页推荐（slug，一行一本）</span>
        <p className="text-xs text-ink-400">排在发现页最前，类似微信读书精选。</p>
        <textarea
          value={form.featured}
          onChange={(e) => setForm({ ...form, featured: e.target.value })}
          rows={5}
          placeholder={"starlight-dream"}
          className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-2 font-mono text-sm"
        />
      </label>
      {msg && <p className="text-sm text-ink-600">{msg}</p>}
      <button
        type="submit"
        disabled={busy}
        className="rounded-full bg-[#07c160] px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {busy ? "保存中…" : "保存设置"}
      </button>
    </form>
  );
}
