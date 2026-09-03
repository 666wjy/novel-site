"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminCommentDeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this comment?")) return;
    setLoading(true);
    const res = await fetch(`/api/admin/comments/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
      return;
    }
    alert("Delete failed");
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="text-sm text-red-600 hover:underline disabled:opacity-50"
    >
      {loading ? "…" : "删除"}
    </button>
  );
}
