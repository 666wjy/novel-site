import Link from "next/link";
import type { NovelMeta } from "@/lib/types";
import { NovelCover } from "@/components/NovelCover";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ShareButton } from "@/components/ShareButton";
import { formatDate } from "@/lib/utils";

interface NovelHeroProps {
  novel: NovelMeta;
  hasAccess: boolean;
  firstChapterSlug: string | null;
  unlockChapterSlug: string | null;
  continueChapterSlug?: string | null;
  loggedIn: boolean;
  favorited: boolean;
  progressLabel?: string | null;
}

export function NovelHero({
  novel,
  hasAccess,
  firstChapterSlug,
  unlockChapterSlug,
  continueChapterSlug,
  loggedIn,
  favorited,
  progressLabel,
}: NovelHeroProps) {
  const startHref = firstChapterSlug ? `/novel/${novel.slug}/${firstChapterSlug}` : null;
  const continueHref = continueChapterSlug
    ? `/novel/${novel.slug}/${continueChapterSlug}`
    : startHref;
  const unlockHref = unlockChapterSlug
    ? `/novel/${novel.slug}/${unlockChapterSlug}`
    : startHref;

  return (
    <section className="overflow-hidden rounded-2xl border border-ink-200/80 bg-white shadow-sm">
      <div className="flex flex-col gap-6 p-5 sm:flex-row sm:gap-8 sm:p-8">
        <NovelCover
          title={novel.title}
          cover={novel.cover}
          priority
          className="mx-auto aspect-[2/3] w-40 shrink-0 shadow-md sm:mx-0 sm:w-44 md:w-48"
          sizes="192px"
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="font-serif text-3xl font-bold leading-tight text-ink-950 sm:text-4xl">
                {novel.title}
              </h1>
              <p className="mt-2 text-ink-500">{novel.author}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  novel.status === "completed"
                    ? "bg-[#07c160]/12 text-[#07c160]"
                    : "bg-amber-50 text-amber-800"
                }`}
              >
                {novel.status === "completed" ? "Completed" : "Ongoing"}
              </span>
              {hasAccess && (
                <span className="rounded-full bg-[#07c160]/12 px-2.5 py-1 text-xs font-medium text-[#07c160]">
                  Unlocked
                </span>
              )}
            </div>
          </div>

          <p className="mt-4 text-[15px] leading-relaxed text-ink-700">{novel.description}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {novel.genre.map((g) => (
              <span
                key={g}
                className="rounded-full bg-ink-100 px-2.5 py-0.5 text-xs text-ink-600"
              >
                {g}
              </span>
            ))}
          </div>

          <p className="mt-3 text-sm text-ink-400">Updated {formatDate(novel.updatedAt)}</p>
          {progressLabel && (
            <p className="mt-2 text-sm font-medium text-[#07c160]">{progressLabel}</p>
          )}

          <div className="mt-6 flex flex-wrap gap-2.5">
            {hasAccess ? (
              continueHref && (
                <Link
                  href={continueHref}
                  className="inline-flex items-center justify-center rounded-full bg-[#07c160] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#06ad56]"
                >
                  Continue reading
                </Link>
              )
            ) : (
              <>
                {startHref && (
                  <Link
                    href={startHref}
                    className="inline-flex items-center justify-center rounded-full bg-[#07c160] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#06ad56]"
                  >
                    Start reading
                  </Link>
                )}
                {unlockHref && (
                  <Link
                    href={unlockHref}
                    className="inline-flex items-center justify-center rounded-full border border-ink-300 bg-white px-5 py-2.5 text-sm font-semibold text-ink-800 transition hover:border-[#07c160]/40"
                  >
                    Unlock {novel.priceLabel}
                  </Link>
                )}
              </>
            )}
            <FavoriteButton
              novelSlug={novel.slug}
              initialFavorited={favorited}
              loggedIn={loggedIn}
            />
            <ShareButton title={novel.title} text={novel.description} />
          </div>

          {!hasAccess && (
            <p className="mt-3 text-xs text-ink-400">
              First {novel.freeChapters} chapters free · Unlock if you like it
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
