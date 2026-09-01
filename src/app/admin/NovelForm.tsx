"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface NovelFormProps {
  mode: "create" | "edit";
  slug?: string;
  initial?: {
    slug: string;
    title: string;
    author: string;
    description: string;
    cover: string;
    genre: string;
    status: "ongoing" | "completed";
    freeChapters: number;
    priceLabel: string;
  };
}

export function NovelForm({ mode, slug, initial }: NovelFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    slug: initial?.slug || "",
    title: initial?.title || "",
    author: initial?.author || "",
    description: initial?.description || "",
    cover: initial?.cover || "/covers/default.jpg",
    genre: initial?.genre || "",
    status: initial?.status || "ongoing",
    freeChapters: initial?.freeChapters ?? 3,
    priceLabel: initial?.priceLabel || "$2.99",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const url = mode === "create" ? "/api/admin/novels" : `/api/admin/novels/${slug}`;
    const method = mode === "create" ? "POST" : "PUT";
    const payload =
      mode === "create"
        ? form
        : {
            title: form.title,
            author: form.author,
            description: form.description,
            cover: form.cover,
            genre: form.genre,
            status: form.status,
            freeChapters: form.freeChapters,
            priceLabel: form.priceLabel,
          };

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = (await res.json()) as { slug?: string };
      router.push(`/admin/novels/${mode === "create" ? data.slug || form.slug : slug}`);
      router.refresh();
      return;
    }

    const data = (await res.json()) as { error?: string };
    setError(data.error || "保存失败");
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-ink-200 bg-white p-6">
      {mode === "create" && (
        <Field label="Slug（英文标识，不可改）">
          <input
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            placeholder="my-novel"
            className="w-full rounded-lg border border-ink-200 px-3 py-2"
            required
          />
        </Field>
      )}

      <Field label="书名">
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full rounded-lg border border-ink-200 px-3 py-2"
          required
        />
      </Field>

      <Field label="作者">
        <input
          value={form.author}
          onChange={(e) => setForm({ ...form, author: e.target.value })}
          className="w-full rounded-lg border border-ink-200 px-3 py-2"
          required
        />
      </Field>

      <Field label="简介">
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={4}
          className="w-full rounded-lg border border-ink-200 px-3 py-2"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="封面路径">
          <input
            value={form.cover}
            onChange={(e) => setForm({ ...form, cover: e.target.value })}
            className="w-full rounded-lg border border-ink-200 px-3 py-2"
          />
        </Field>
        <Field label="标签（逗号分隔）">
          <input
            value={form.genre}
            onChange={(e) => setForm({ ...form, genre: e.target.value })}
            placeholder="科幻, 冒险"
            className="w-full rounded-lg border border-ink-200 px-3 py-2"
          />
        </Field>
        <Field label="状态">
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as "ongoing" | "completed" })}
            className="w-full rounded-lg border border-ink-200 px-3 py-2"
          >
            <option value="ongoing">连载中</option>
            <option value="completed">已完结</option>
          </select>
        </Field>
        <Field label="免费章节数">
          <input
            type="number"
            min={0}
            value={form.freeChapters}
            onChange={(e) => setForm({ ...form, freeChapters: Number(e.target.value) })}
            className="w-full rounded-lg border border-ink-200 px-3 py-2"
          />
        </Field>
        <Field label="价格显示">
          <input
            value={form.priceLabel}
            onChange={(e) => setForm({ ...form, priceLabel: e.target.value })}
            className="w-full rounded-lg border border-ink-200 px-3 py-2"
          />
        </Field>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-ink-900 px-4 py-2 text-white hover:bg-ink-800 disabled:opacity-50"
      >
        {loading ? "保存中…" : mode === "create" ? "创建小说" : "保存修改"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-ink-700">{label}</label>
      {children}
    </div>
  );
}
