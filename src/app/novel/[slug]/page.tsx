import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getNovel, getChapterMetas, isChapterFree } from "@/lib/novels";
import { checkReaderAccess } from "@/lib/access";
import { UnlockBanner } from "@/components/UnlockBanner";
import { NovelHero } from "@/components/NovelHero";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const novel = await getNovel(slug);
  if (!novel) return { title: "Not Found" };
  return { title: novel.title, description: novel.description };
}

export default async function NovelPage({ params }: Props) {
  const { slug } = await params;
  const novel = await getNovel(slug);
  if (!novel) notFound();

  const chapters = await getChapterMetas(slug);
  const hasAccess = await checkReaderAccess(slug);
  const firstChapter = chapters[0] ?? null;
  const firstPaidChapter =
    chapters.find((ch) => !isChapterFree(novel, ch.order)) ?? null;

  return (
    <div>
      <Suspense fallback={null}>
        <UnlockBanner />
      </Suspense>

      <NovelHero
        novel={novel}
        hasAccess={hasAccess}
        firstChapterSlug={firstChapter?.slug ?? null}
        unlockChapterSlug={firstPaidChapter?.slug ?? firstChapter?.slug ?? null}
      />

      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-serif text-xl font-bold text-ink-950">章节目录</h2>
            <p className="mt-1 text-sm text-ink-500">
              共 {chapters.length} 章 · 前 {novel.freeChapters} 章免费
              {!hasAccess && <> · 解锁全书 {novel.priceLabel}</>}
            </p>
          </div>
        </div>

        <ol className="mt-5 divide-y divide-ink-100 overflow-hidden rounded-2xl border border-ink-200/80 bg-white/80">
          {chapters.map((ch) => {
            const isFreeChapter = isChapterFree(novel, ch.order);
            const readable = isFreeChapter || hasAccess;

            return (
              <li key={ch.slug}>
                <Link
                  href={`/novel/${slug}/${ch.slug}`}
                  className={`group flex items-start gap-4 px-4 py-4 transition sm:px-5 ${
                    readable
                      ? "hover:bg-ink-50/80"
                      : "hover:bg-amber-50/40"
                  }`}
                >
                  <span
                    className={`mt-0.5 w-10 shrink-0 font-serif text-sm tabular-nums ${
                      readable ? "text-ink-400" : "text-ink-300"
                    }`}
                  >
                    {String(ch.order).padStart(2, "0")}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`font-medium transition ${
                        readable
                          ? "text-ink-900 group-hover:text-accent"
                          : "text-ink-700"
                      }`}
                    >
                      {ch.title}
                    </p>
                    {ch.summary && (
                      <p className="mt-0.5 line-clamp-1 text-sm text-ink-500">
                        {ch.summary}
                      </p>
                    )}
                  </div>

                  {readable ? (
                    isFreeChapter && !hasAccess ? (
                      <span className="mt-0.5 shrink-0 text-xs font-medium text-ink-400">
                        免费
                      </span>
                    ) : (
                      <span className="mt-0.5 shrink-0 text-xs font-medium text-accent/80 opacity-0 transition group-hover:opacity-100">
                        阅读 →
                      </span>
                    )
                  ) : (
                    <span className="mt-0.5 flex shrink-0 items-center gap-1 text-xs text-ink-400">
                      <LockIcon />
                      付费
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}

function LockIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      className="h-3.5 w-3.5"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M8 1a3.5 3.5 0 0 0-3.5 3.5V7A1.5 1.5 0 0 0 3 8.5v4A1.5 1.5 0 0 0 4.5 14h7a1.5 1.5 0 0 0 1.5-1.5v-4A1.5 1.5 0 0 0 11.5 7V4.5A3.5 3.5 0 0 0 8 1Zm2 6V4.5a2 2 0 1 0-4 0V7h4Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
