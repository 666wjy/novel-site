"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ChapterFormProps {
  mode: "create" | "edit";
  novelSlug: string;
  chapterId?: string;
  initial?: {
    chapterSlug: string;
    title: string;
    order: number;
    summary: string;
    content: string;
  };
}

export function ChapterForm({ mode, novelSlug, chapterId, initial }: ChapterFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    chapterSlug: initial?.chapterSlug || "",
    title: initial?.title || "",
    order: initial?.order ?? 1,
    summary: initial?.summary || "",
    content: initial?.content || "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const url =
      mode === "create"
        ? `/api/admin/novels/${novelSlug}/chapters`
        : `/api/admin/chapters/${chapterId}`;
    const method = mode === "create" ? "POST" : "PUT";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      router.push(`/admin/novels/${novelSlug}`);
      router.refresh();
      return;
    }

    const data = (await res.json()) as { error?: string };
    setError(data.error || "保存失败");
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-ink-200 bg-white p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">章节 Slug</label>
          <input
            value={form.chapterSlug}
            onChange={(e) => setForm({ ...form, chapterSlug: e.target.value })}
            placeholder="chapter-01"
            className="w-full rounded-lg border border-ink-200 px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">章节序号</label>
          <input
            type="number"
            min={1}
            value={form.order}
            onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
            className="w-full rounded-lg border border-ink-200 px-3 py-2"
            required
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink-700">章节标题</label>
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full rounded-lg border border-ink-200 px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink-700">摘要（可选）</label>
        <input
          value={form.summary}
          onChange={(e) => setForm({ ...form, summary: e.target.value })}
          className="w-full rounded-lg border border-ink-200 px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink-700">正文</label>
        <textarea
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          rows={16}
          className="w-full rounded-lg border border-ink-200 px-3 py-2 font-serif leading-relaxed"
          required
        />
        <p className="mt-1 text-xs text-ink-400">支持 Markdown 格式，段落之间空一行</p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-ink-900 px-4 py-2 text-white hover:bg-ink-800 disabled:opacity-50"
      >
        {loading ? "保存中…" : mode === "create" ? "添加章节" : "保存章节"}
      </button>
    </form>
  );
}
