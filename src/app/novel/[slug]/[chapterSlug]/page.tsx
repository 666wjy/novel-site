import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  getNovel,
  getChapter,
  getAdjacentChapters,
  isChapterFree,
} from "@/lib/novels";
import { checkReaderAccess } from "@/lib/access";
import { Paywall } from "@/components/Paywall";
import { UnlockBanner } from "@/components/UnlockBanner";
import { CommentSection } from "@/components/CommentSection";
import { ReadingSettings } from "@/components/ReadingSettings";
import { ChapterBody } from "@/components/ChapterBody";
import { renderMarkdown } from "@/lib/utils";

interface Props {
  params: Promise<{ slug: string; chapterSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, chapterSlug } = await params;
  const chapter = await getChapter(slug, chapterSlug);
  if (!chapter) return { title: "Not Found" };
  return { title: chapter.title };
}

export default async function ChapterPage({ params }: Props) {
  const { slug, chapterSlug } = await params;
  const novel = await getNovel(slug);
  const chapter = await getChapter(slug, chapterSlug);
  if (!novel || !chapter) notFound();

  const hasAccess = await checkReaderAccess(slug);
  const canRead = isChapterFree(novel, chapter.order) || hasAccess;
  const { prev, next } = await getAdjacentChapters(slug, chapterSlug);

  return (
    <article className="mx-auto max-w-2xl">
      <Suspense fallback={null}>
        <UnlockBanner />
      </Suspense>

      <div className="mb-8 flex items-center justify-between gap-3 border-b border-ink-200/80 pb-4">
        <nav className="min-w-0 text-sm">
          <Link
            href={`/novel/${slug}`}
            className="text-ink-500 transition hover:text-accent"
          >
            ← 目录
          </Link>
          <span className="mx-2 text-ink-300">·</span>
          <span className="truncate font-medium text-ink-700">{novel.title}</span>
        </nav>
        {canRead && <ReadingSettings />}
      </div>

      <header className="mb-10 text-center">
        <p className="text-sm tracking-wide text-ink-400">第 {chapter.order} 章</p>
        <h1 className="mt-2 font-serif text-3xl font-bold leading-snug text-ink-950 sm:text-4xl">
          {chapter.title}
        </h1>
        <div className="mx-auto mt-6 h-px w-16 bg-ink-200" />
      </header>

      {canRead ? (
        <ChapterBody html={renderMarkdown(chapter.content)} />
      ) : (
        <Paywall
          novelSlug={slug}
          novelTitle={novel.title}
          priceLabel={novel.priceLabel}
          chapterTitle={chapter.title}
        />
      )}

      <nav className="mt-14 grid grid-cols-2 gap-3 border-t border-ink-200/80 pt-6">
        {prev ? (
          <Link
            href={`/novel/${slug}/${prev.slug}`}
            className="rounded-xl border border-ink-200 bg-white/80 px-4 py-3.5 text-sm transition hover:border-accent/30 hover:bg-ink-50"
          >
            <span className="block text-xs text-ink-400">上一章</span>
            <span className="mt-0.5 line-clamp-1 font-medium text-ink-800">
              {prev.title}
            </span>
          </Link>
        ) : (
          <span className="rounded-xl border border-dashed border-ink-100 px-4 py-3.5 text-sm text-ink-300">
            已是第一章
          </span>
        )}
        {next ? (
          <Link
            href={`/novel/${slug}/${next.slug}`}
            className="rounded-xl border border-ink-200 bg-white/80 px-4 py-3.5 text-right text-sm transition hover:border-accent/30 hover:bg-ink-50"
          >
            <span className="block text-xs text-ink-400">下一章</span>
            <span className="mt-0.5 line-clamp-1 font-medium text-ink-800">
              {next.title}
            </span>
          </Link>
        ) : (
          <span className="rounded-xl border border-dashed border-ink-100 px-4 py-3.5 text-right text-sm text-ink-300">
            已是最后一章
          </span>
        )}
      </nav>

      {canRead && <CommentSection novelSlug={slug} chapterSlug={chapterSlug} />}
    </article>
  );
}
