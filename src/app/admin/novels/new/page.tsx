import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminLoggedIn } from "@/lib/admin-auth";
import { isDatabaseEnabled } from "@/db";
import { NovelForm } from "@/app/admin/NovelForm";

export default async function NewNovelPage() {
  if (!(await isAdminLoggedIn())) redirect("/admin/login");
  if (!isDatabaseEnabled()) redirect("/admin");

  return (
    <div>
      <Link href="/admin" className="text-sm text-accent hover:underline">
        ← 返回后台
      </Link>
      <h1 className="mt-4 font-serif text-2xl font-bold text-ink-950">添加小说（存入数据库）</h1>
      <p className="mt-1 text-sm text-ink-500">创建后可在后台继续添加章节</p>
      <div className="mt-6">
        <NovelForm mode="create" />
      </div>
    </div>
  );
}
