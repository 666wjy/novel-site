import Link from "next/link";
import type { NovelMeta } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function NovelCard({ novel }: { novel: NovelMeta }) {
  return (
    <Link
      href={`/novel/${novel.slug}`}
      className="group block rounded-2xl border border-ink-200 bg-white p-5 shadow-sm transition hover:border-accent/30 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl font-bold text-ink-950 group-hover:text-accent transition">
            {novel.title}
          </h2>
          <p className="mt-1 text-sm text-ink-500">作者：{novel.author}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
            novel.status === "completed"
              ? "bg-green-100 text-green-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {novel.status === "completed" ? "已完结" : "连载中"}
        </span>
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-ink-600">{novel.description}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {novel.genre.map((g) => (
          <span key={g} className="rounded-md bg-ink-100 px-2 py-0.5 text-xs text-ink-600">
            {g}
          </span>
        ))}
        <span className="ml-auto text-xs text-ink-400">更新于 {formatDate(novel.updatedAt)}</span>
      </div>
      <p className="mt-3 text-xs text-accent font-medium">
        前 {novel.freeChapters} 章免费 · 解锁全书 {novel.priceLabel}
      </p>
    </Link>
  );
}
