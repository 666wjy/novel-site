import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  getNovel,
  getChapter,
  getAdjacentChapters,
  getChapterMetas,
  isChapterFree,
} from "@/lib/novels";
import { checkReaderAccess } from "@/lib/access";
import { Paywall } from "@/components/Paywall";
import { UnlockBanner } from "@/components/UnlockBanner";
import { ChapterReading } from "@/components/ChapterReading";
import { ReaderShell } from "@/components/ReaderShell";
import { renderMarkdown } from "@/lib/utils";
import { getSession } from "@/lib/auth";
import { upsertProgress } from "@/lib/library";

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
  const chapters = await getChapterMetas(slug);
  const session = await getSession();
  if (session) {
    await upsertProgress(session.id, slug, chapterSlug);
  }

  const toc = chapters.map((ch) => ({
    slug: ch.slug,
    title: ch.title,
    order: ch.order,
    free: isChapterFree(novel, ch.order),
    locked: !(isChapterFree(novel, ch.order) || hasAccess),
  }));

  return (
    <ReaderShell
      novelSlug={slug}
      novelTitle={novel.title}
      chapterSlug={chapterSlug}
      chapterTitle={chapter.title}
      chapterOrder={chapter.order}
      chapters={toc}
      prev={prev ?? null}
      next={next ?? null}
    >
      <Suspense fallback={null}>
        <UnlockBanner />
      </Suspense>

      {canRead ? (
        <ChapterReading
          html={renderMarkdown(chapter.content)}
          novelSlug={slug}
          chapterSlug={chapterSlug}
        />
      ) : (
        <Paywall
          novelSlug={slug}
          novelTitle={novel.title}
          priceLabel={novel.priceLabel}
          chapterTitle={chapter.title}
          loggedIn={Boolean(session)}
        />
      )}
    </ReaderShell>
  );
}
