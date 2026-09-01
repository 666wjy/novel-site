import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminLoggedIn } from "@/lib/admin-auth";
import { isDatabaseEnabled } from "@/db";
import { getNovel } from "@/lib/novels";
import { ChapterForm } from "@/app/admin/ChapterForm";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function NewChapterPage({ params }: Props) {
  if (!(await isAdminLoggedIn())) redirect("/admin/login");
  if (!isDatabaseEnabled()) redirect("/admin");

  const { slug } = await params;
  const novel = await getNovel(slug);
  if (!novel) redirect("/admin");

  return (
    <div>
      <Link href={`/admin/novels/${slug}`} className="text-sm text-accent hover:underline">
        ← 返回《{novel.title}》
      </Link>
      <h1 className="mt-4 font-serif text-2xl font-bold text-ink-950">添加章节</h1>
      <div className="mt-6">
        <ChapterForm mode="create" novelSlug={slug} />
      </div>
    </div>
  );
}
