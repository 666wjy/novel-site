import Link from "next/link";
import type { NovelMeta } from "@/lib/types";
import { NovelCover } from "@/components/NovelCover";
import { formatDate } from "@/lib/utils";

export function NovelCard({
  novel,
  favorited,
  progressLabel,
}: {
  novel: NovelMeta;
  favorited?: boolean;
  progressLabel?: string | null;
}) {
  return (
    <Link
      href={`/novel/${novel.slug}`}
      className="group flex gap-4 overflow-hidden rounded-2xl border border-ink-200/80 bg-white/80 p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-md sm:p-5"
    >
      <NovelCover
        title={novel.title}
        cover={novel.cover}
        className="aspect-[2/3] w-20 shrink-0 transition duration-300 group-hover:scale-[1.03] sm:w-24"
        sizes="96px"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="font-serif text-lg font-bold text-ink-950 transition group-hover:text-accent sm:text-xl">
              {novel.title}
            </h2>
            <p className="mt-1 text-sm text-ink-500">by {novel.author}</p>
          </div>
          <span
            className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${
              novel.status === "completed"
                ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                : "bg-amber-50 text-amber-800 ring-1 ring-amber-200"
            }`}
          >
            {novel.status === "completed" ? "Completed" : "Ongoing"}
          </span>
        </div>
        {favorited && (
          <p className="mt-1 text-xs font-medium text-accent">Saved</p>
        )}
        {progressLabel && (
          <p className="mt-1 text-xs text-ink-500">Reading: {progressLabel}</p>
        )}
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-600">
          {novel.description}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {novel.genre.map((g) => (
            <span
              key={g}
              className="rounded-md bg-ink-100/80 px-2 py-0.5 text-xs text-ink-600"
            >
              {g}
            </span>
          ))}
          <span className="ml-auto text-xs text-ink-400">
            Updated {formatDate(novel.updatedAt)}
          </span>
        </div>
        <p className="mt-2 text-xs font-medium text-accent">
          First {novel.freeChapters} chapters free · Unlock {novel.priceLabel}
        </p>
      </div>
    </Link>
  );
}
