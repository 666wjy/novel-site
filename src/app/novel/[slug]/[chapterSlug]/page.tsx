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
import { renderMarkdown } from "@/lib/utils";

interface Props {
  params: Promise<{ slug: string; chapterSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, chapterSlug } = await params;
  const chapter = getChapter(slug, chapterSlug);
  if (!chapter) return { title: "Not Found" };
  return { title: chapter.title };
}

export default async function ChapterPage({ params }: Props) {
  const { slug, chapterSlug } = await params;
  const novel = getNovel(slug);
  const chapter = getChapter(slug, chapterSlug);
  if (!novel || !chapter) notFound();

  const hasAccess = await checkReaderAccess(slug);
  const canRead = isChapterFree(novel, chapter.order) || hasAccess;
  const { prev, next } = getAdjacentChapters(slug, chapterSlug);

  return (
    <article>
      <Suspense fallback={null}>
        <UnlockBanner />
      </Suspense>

      <nav className="mb-6 text-sm">
        <Link href={`/novel/${slug}`} className="text-accent hover:underline">
          ← 返回《{novel.title}》
        </Link>
      </nav>

      <header className="mb-8 border-b border-ink-200 pb-6">
        <p className="text-sm text-ink-400">第 {chapter.order} 章</p>
        <h1 className="mt-1 font-serif text-3xl font-bold text-ink-950">{chapter.title}</h1>
      </header>

      {canRead ? (
        <div
          className="prose prose-ink max-w-none font-serif text-lg leading-loose text-ink-800 prose-p:mb-6"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(chapter.content) }}
        />
      ) : (
        <Paywall
          novelSlug={slug}
          novelTitle={novel.title}
          priceLabel={novel.priceLabel}
          chapterTitle={chapter.title}
        />
      )}

      <nav className="mt-12 flex justify-between gap-4 border-t border-ink-200 pt-8">
        {prev ? (
          <Link
            href={`/novel/${slug}/${prev.slug}`}
            className="rounded-xl border border-ink-200 px-4 py-3 text-sm transition hover:bg-ink-50"
          >
            ← 上一章：{prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/novel/${slug}/${next.slug}`}
            className="rounded-xl border border-ink-200 px-4 py-3 text-sm text-right transition hover:bg-ink-50"
          >
            下一章：{next.title} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}
