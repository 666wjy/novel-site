import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminLoggedIn } from "@/lib/admin-auth";
import { isDatabaseEnabled } from "@/db";
import { NovelForm } from "@/app/admin/NovelForm";
import { getSiteSettings } from "@/lib/site-settings";

export default async function NewNovelPage() {
  if (!(await isAdminLoggedIn())) redirect("/admin/login");
  if (!isDatabaseEnabled()) redirect("/admin");
  const settings = await getSiteSettings();

  return (
    <div>
      <Link href="/admin" className="text-sm text-accent hover:underline">
        ← 返回后台
      </Link>
      <h1 className="mt-4 font-serif text-2xl font-bold text-ink-950">添加小说</h1>
      <p className="mt-1 text-sm text-ink-500">
        先填书名等基本信息并保存 → 下一页即可<strong>上传整本 TXT</strong>自动分章。默认试读{" "}
        {settings.freeChaptersDefault} 章（可在站点设置里改）。
      </p>
      <div className="mt-6">
        <NovelForm mode="create" defaultFreeChapters={settings.freeChaptersDefault} />
      </div>
    </div>
  );
}
