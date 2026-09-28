import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminLoggedIn } from "@/lib/admin-auth";
import { isDatabaseEnabled } from "@/db";
import { getAllNovels } from "@/lib/novels";
import { countChaptersByNovel } from "@/lib/novels-admin";
import { countComments } from "@/lib/comments";
import { getAllPurchases } from "@/lib/purchases";
import { AdminLogoutButton } from "./AdminLogoutButton";

export default async function AdminPage() {
  if (!(await isAdminLoggedIn())) {
    redirect("/admin/login");
  }

  const dbEnabled = isDatabaseEnabled();
  const novels = await getAllNovels();
  const purchases = await getAllPurchases();
  const chapterCounts = await countChaptersByNovel();
  const commentCount = await countComments();
  const totalChapters = Object.values(chapterCounts).reduce((a, b) => a + b, 0);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-ink-950">概览</h1>
          <p className="mt-1 text-sm text-ink-500">书库、想法、订单、站点设置分栏管理</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {dbEnabled && (
            <Link
              href="/admin/novels/new"
              className="rounded-full bg-[#07c160] px-4 py-2 text-sm font-medium text-white"
            >
              + 上传新书
            </Link>
          )}
          <AdminLogoutButton />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat href="/admin" label="小说" value={String(novels.length)} />
        <Stat href="/admin" label="章节" value={String(totalChapters)} />
        <Stat href="/admin/ideas" label="想法/评论" value={String(commentCount)} />
        <Stat href="/admin/orders" label="订单" value={String(purchases.length)} />
      </div>

      {!dbEnabled && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          请配置 DATABASE_URL。
        </div>
      )}

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-ink-950">书库</h2>
          <Link href="/admin/settings" className="text-sm text-[#07c160]">
            站点设置 →
          </Link>
        </div>
        {novels.length === 0 ? (
          <p className="mt-4 text-sm text-ink-500">还没有书。先上传新书，再整本 TXT 导入。</p>
        ) : (
          <ul className="mt-4 divide-y divide-ink-100 overflow-hidden rounded-2xl border border-ink-200 bg-white">
            {novels.map((novel) => (
              <li key={novel.slug} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="font-medium text-ink-900">
                    {novel.title}{" "}
                    <span className="text-xs font-normal text-ink-400">
                      {novel.status === "completed" ? "完结" : "连载"}
                    </span>
                  </p>
                  <p className="text-xs text-ink-500">
                    {novel.author} · {chapterCounts[novel.slug] || 0} 章 · 试读 {novel.freeChapters} 章 ·{" "}
                    {novel.priceLabel}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/novels/${novel.slug}`}
                    className="rounded-lg bg-ink-900 px-3 py-1.5 text-sm text-white"
                  >
                    管理 / 导入
                  </Link>
                  <Link
                    href={`/novel/${novel.slug}`}
                    className="rounded-lg border border-ink-200 px-3 py-1.5 text-sm"
                  >
                    预览
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ href, label, value }: { href: string; label: string; value: string }) {
  return (
    <Link href={href} className="rounded-2xl border border-ink-200 bg-white p-4 hover:border-[#07c160]/40">
      <p className="text-xs text-ink-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-ink-950">{value}</p>
    </Link>
  );
}
