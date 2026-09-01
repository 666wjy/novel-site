import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getNovel, getChapterMetas, isChapterFree } from "@/lib/novels";
import { checkReaderAccess } from "@/lib/access";
import { UnlockBanner } from "@/components/UnlockBanner";
import { formatDate } from "@/lib/utils";

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

  return (
    <div>
      <Suspense fallback={null}>
        <UnlockBanner />
      </Suspense>

      <div className="rounded-2xl border border-ink-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-ink-950">{novel.title}</h1>
            <p className="mt-2 text-ink-500">作者：{novel.author}</p>
          </div>
          {hasAccess && (
            <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
              已解锁全书
            </span>
          )}
        </div>
        <p className="mt-4 leading-relaxed text-ink-700">{novel.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {novel.genre.map((g) => (
            <span key={g} className="rounded-md bg-ink-100 px-2 py-0.5 text-xs text-ink-600">
              {g}
            </span>
          ))}
        </div>
        <p className="mt-4 text-sm text-ink-400">最后更新：{formatDate(novel.updatedAt)}</p>
      </div>

      <section className="mt-8">
        <h2 className="font-serif text-xl font-bold text-ink-950">章节目录</h2>
        <p className="mt-1 text-sm text-ink-500">
          前 {novel.freeChapters} 章免费 · 解锁全书 {novel.priceLabel}
        </p>

        <ul className="mt-4 divide-y divide-ink-100 rounded-2xl border border-ink-200 bg-white overflow-hidden">
          {chapters.map((ch) => {
            const free = isChapterFree(novel, ch.order) || hasAccess;
            return (
              <li key={ch.slug}>
                <Link
                  href={`/novel/${slug}/${ch.slug}`}
                  className="flex items-center justify-between px-5 py-4 transition hover:bg-ink-50"
                >
                  <div>
                    <span className="text-xs text-ink-400">第 {ch.order} 章</span>
                    <p className="font-medium text-ink-900">{ch.title}</p>
                    {ch.summary && (
                      <p className="mt-0.5 text-sm text-ink-500 line-clamp-1">{ch.summary}</p>
                    )}
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                      free ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {free ? "可读" : "付费"}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
