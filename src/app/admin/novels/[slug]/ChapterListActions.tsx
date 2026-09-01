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

  return (
    <div className="flex shrink-0 gap-2">
      <Link
        href={`/admin/novels/${novelSlug}/chapters/${chapterSlug}/edit`}
        className="rounded-lg border border-ink-200 px-3 py-1.5 text-sm hover:bg-ink-50"
      >
        编辑
      </Link>
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        {deleting ? "…" : "删除"}
      </button>
    </div>
  );
}
