import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isAdminLoggedIn } from "@/lib/admin-auth";
import { isDatabaseEnabled } from "@/db";
import { getNovel } from "@/lib/novels";
import { getAdminChapterList } from "@/lib/novels-admin";
import { NovelForm } from "@/app/admin/NovelForm";
import { ChapterListActions } from "./ChapterListActions";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function AdminNovelPage({ params }: Props) {
  if (!(await isAdminLoggedIn())) redirect("/admin/login");
  if (!isDatabaseEnabled()) redirect("/admin");

  const { slug } = await params;
  const novel = await getNovel(slug);
  if (!novel) notFound();

  const chapters = await getAdminChapterList(slug);

  return (
    <div>
      <Link href="/admin" className="text-sm text-accent hover:underline">
        ← 返回后台
      </Link>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-bold text-ink-950">{novel.title}</h1>
          <p className="text-sm text-ink-500">管理小说与章节 · 数据存在 PostgreSQL</p>
        </div>
        <Link
          href={`/novel/${slug}`}
          className="rounded-lg border border-ink-200 px-4 py-2 text-sm hover:bg-ink-50"
        >
          前台预览
        </Link>
      </div>

      <section className="mt-8">
        <h2 className="font-serif text-lg font-bold text-ink-950">小说信息</h2>
        <div className="mt-4">
          <NovelForm
            mode="edit"
            slug={slug}
            initial={{
              slug: novel.slug,
              title: novel.title,
              author: novel.author,
              description: novel.description,
              cover: novel.cover,
              genre: novel.genre.join(", "),
              status: novel.status,
              freeChapters: novel.freeChapters,
              priceLabel: novel.priceLabel,
            }}
          />
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-ink-950">章节列表（{chapters.length}）</h2>
          <Link
            href={`/admin/novels/${slug}/chapters/new`}
            className="rounded-lg bg-ink-900 px-4 py-2 text-sm text-white hover:bg-ink-800"
          >
            + 添加章节
          </Link>
        </div>

        {chapters.length === 0 ? (
          <p className="mt-4 text-sm text-ink-500">还没有章节，点上方按钮添加</p>
        ) : (
          <ul className="mt-4 divide-y divide-ink-100 rounded-2xl border border-ink-200 bg-white">
            {chapters.map((ch) => (
              <li key={ch.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div>
                  <p className="text-xs text-ink-400">第 {ch.order} 章</p>
                  <p className="font-medium text-ink-900">{ch.title}</p>
                  <p className="text-sm text-ink-500">{ch.slug}</p>
                </div>
                <ChapterListActions
                  novelSlug={slug}
                  chapterId={ch.id}
                  chapterSlug={ch.slug}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
