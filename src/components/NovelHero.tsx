import Link from "next/link";
import type { NovelMeta } from "@/lib/types";
import { NovelCover } from "@/components/NovelCover";
import { FavoriteButton } from "@/components/FavoriteButton";
import { formatDate } from "@/lib/utils";

interface NovelHeroProps {
  novel: NovelMeta;
  hasAccess: boolean;
  firstChapterSlug: string | null;
  unlockChapterSlug: string | null;
  continueChapterSlug?: string | null;
  loggedIn: boolean;
  favorited: boolean;
}

export function NovelHero({
  novel,
  hasAccess,
  firstChapterSlug,
  unlockChapterSlug,
  continueChapterSlug,
  loggedIn,
  favorited,
}: NovelHeroProps) {
  const startHref = firstChapterSlug ? `/novel/${novel.slug}/${firstChapterSlug}` : null;
  const continueHref = continueChapterSlug
    ? `/novel/${novel.slug}/${continueChapterSlug}`
    : startHref;
  const unlockHref = unlockChapterSlug
    ? `/novel/${novel.slug}/${unlockChapterSlug}`
    : startHref;

  return (
    <section className="overflow-hidden rounded-2xl border border-ink-200/80 bg-white/70 shadow-sm backdrop-blur-sm">
      <div className="flex flex-col gap-6 p-5 sm:flex-row sm:gap-8 sm:p-8">
        <NovelCover
          title={novel.title}
          cover={novel.cover}
          priority
          className="aspect-[2/3] w-full shrink-0 sm:w-44 md:w-52"
          sizes="(max-width: 640px) 100vw, 208px"
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="font-serif text-3xl font-bold leading-tight text-ink-950 sm:text-4xl">
                {novel.title}
              </h1>
              <p className="mt-2 text-ink-500">作者：{novel.author}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span
                className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                  novel.status === "completed"
                    ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                    : "bg-amber-50 text-amber-800 ring-1 ring-amber-200"
                }`}
              >
                {novel.status === "completed" ? "已完结" : "连载中"}
              </span>
              {hasAccess && (
                <span className="rounded-md bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 ring-1 ring-green-200">
                  已解锁全书
                </span>
              )}
            </div>
          </div>

          <p className="mt-4 text-[15px] leading-relaxed text-ink-700">{novel.description}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {novel.genre.map((g) => (
              <span
                key={g}
                className="rounded-md bg-ink-100/80 px-2 py-0.5 text-xs text-ink-600"
              >
                {g}
              </span>
            ))}
          </div>

          <p className="mt-3 text-sm text-ink-400">最后更新：{formatDate(novel.updatedAt)}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            {hasAccess ? (
              continueHref && (
                <Link
                  href={continueHref}
                  className="inline-flex items-center justify-center rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-dark"
                >
                  继续阅读
                </Link>
              )
            ) : (
              <>
                {startHref && (
                  <Link
                    href={startHref}
                    className="inline-flex items-center justify-center rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-dark"
                  >
                    从第 1 章开始
                  </Link>
                )}
                {unlockHref && (
                  <Link
                    href={unlockHref}
                    className="inline-flex items-center justify-center rounded-xl border border-ink-300 bg-white px-5 py-2.5 text-sm font-semibold text-ink-800 transition hover:border-accent/40 hover:bg-ink-50"
                  >
                    解锁全书 {novel.priceLabel}
                  </Link>
                )}
              </>
            )}
            <FavoriteButton
              novelSlug={novel.slug}
              initialFavorited={favorited}
              loggedIn={loggedIn}
            />
          </div>

          {!hasAccess && (
            <p className="mt-3 text-xs text-ink-400">
              前 {novel.freeChapters} 章免费试读 · 喜欢再解锁
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
