import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isAdminLoggedIn } from "@/lib/admin-auth";
import { isDatabaseEnabled } from "@/db";
import { getNovel } from "@/lib/novels";
import { getAdminChapterList } from "@/lib/novels-admin";
import { ChapterForm } from "@/app/admin/ChapterForm";

interface Props {
  params: Promise<{ slug: string; chapterSlug: string }>;
}

export default async function EditChapterPage({ params }: Props) {
  if (!(await isAdminLoggedIn())) redirect("/admin/login");
  if (!isDatabaseEnabled()) redirect("/admin");

  const { slug, chapterSlug } = await params;
  const novel = await getNovel(slug);
  if (!novel) notFound();

  const chapters = await getAdminChapterList(slug);
  const chapter = chapters.find((c) => c.slug === chapterSlug);
  if (!chapter) notFound();

  return (
    <div>
      <Link href={`/admin/novels/${slug}`} className="text-sm text-accent hover:underline">
        ← 返回《{novel.title}》
      </Link>
      <h1 className="mt-4 font-serif text-2xl font-bold text-ink-950">编辑章节</h1>
      <div className="mt-6">
        <ChapterForm
          mode="edit"
          novelSlug={slug}
          chapterId={chapter.id}
          initial={{
            chapterSlug: chapter.slug,
            title: chapter.title,
            order: chapter.order,
            summary: chapter.summary || "",
            content: chapter.content,
          }}
        />
      </div>
    </div>
  );
}
