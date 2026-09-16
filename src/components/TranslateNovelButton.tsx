"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function TranslateNovelButton({ slug }: { slug: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"meta" | "all" | null>(null);
  const [message, setMessage] = useState("");

  async function run(scope: "meta" | "all") {
    const tip =
      scope === "all"
        ? "将用 Gemini 免费额度把本书信息 + 全部章节翻成英文并覆盖保存。继续？"
        : "将把书名、作者、简介、标签翻成英文并覆盖保存。继续？";
    if (!confirm(tip)) return;

    setLoading(scope);
    setMessage(scope === "all" ? "正在翻译全书，请稍候（约几十秒）…" : "正在翻译简介…");

    try {
      const res = await fetch("/api/admin/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, scope }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "翻译失败");

      const failed = data.failedCount || 0;
      setMessage(
        failed
          ? `完成，但有 ${failed} 章失败：可稍后单章重试。`
          : scope === "all"
            ? `完成：已翻译 ${data.chapters?.length || 0} 章。`
            : "书目信息已译成英文。"
      );
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "翻译失败");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="rounded-xl border border-ink-200 bg-white p-4">
      <p className="text-sm font-medium text-ink-900">Gemini 英译（免费额度）</p>
      <p className="mt-1 text-xs text-ink-500">
        需配置环境变量 GEMINI_API_KEY（Google AI Studio 免费申请）。翻译会覆盖当前中文内容。
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={loading !== null}
          onClick={() => void run("meta")}
          className="rounded-lg border border-ink-200 px-3 py-1.5 text-sm hover:bg-ink-50 disabled:opacity-50"
        >
          {loading === "meta" ? "翻译中…" : "只译书目信息"}
        </button>
        <button
          type="button"
          disabled={loading !== null}
          onClick={() => void run("all")}
          className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-dark disabled:opacity-50"
        >
          {loading === "all" ? "全书翻译中…" : "一键全书英译"}
        </button>
      </div>
      {message && <p className="mt-2 text-sm text-ink-600">{message}</p>}
    </div>
  );
}
