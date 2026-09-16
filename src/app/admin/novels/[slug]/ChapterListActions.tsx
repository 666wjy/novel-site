"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ChapterListActions({
  novelSlug,
  chapterId,
  chapterSlug,
}: {
  novelSlug: string;
  chapterId: string;
  chapterSlug: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [translating, setTranslating] = useState(false);

  async function handleDelete() {
    if (!confirm("确定删除这一章？")) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/chapters/${chapterId}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
      return;
    }
    alert("删除失败");
    setDeleting(false);
  }

  async function handleTranslate() {
    if (!confirm("用 Gemini 把这一章翻成英文并覆盖保存？")) return;
    setTranslating(true);
    try {
      const res = await fetch("/api/admin/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: novelSlug, scope: "chapter", chapterId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "翻译失败");
      if (data.chapters?.[0] && !data.chapters[0].ok) {
        throw new Error(data.chapters[0].error || "翻译失败");
      }
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "翻译失败");
    } finally {
      setTranslating(false);
    }
  }

  return (
    <div className="flex shrink-0 flex-wrap gap-2">
      <button
        type="button"
        onClick={() => void handleTranslate()}
        disabled={translating || deleting}
        className="rounded-lg border border-accent/30 px-3 py-1.5 text-sm text-accent hover:bg-accent/5 disabled:opacity-50"
      >
        {translating ? "英译中…" : "英译"}
      </button>
      <Link
        href={`/admin/novels/${novelSlug}/chapters/${chapterSlug}/edit`}
        className="rounded-lg border border-ink-200 px-3 py-1.5 text-sm hover:bg-ink-50"
      >
        编辑
      </Link>
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting || translating}
        className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        {deleting ? "…" : "删除"}
      </button>
    </div>
  );
}
