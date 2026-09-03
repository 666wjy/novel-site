import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminLoggedIn } from "@/lib/admin-auth";
import { isDatabaseEnabled } from "@/db";
import { getAllNovels } from "@/lib/novels";
import { getAllPurchases } from "@/lib/purchases";
import { countChaptersByNovel } from "@/lib/novels-admin";
import { countComments, listRecentComments } from "@/lib/comments";
import { AdminLogoutButton } from "./AdminLogoutButton";
import { AdminCommentDeleteButton } from "./AdminCommentDeleteButton";

export default async function AdminPage() {
  if (!(await isAdminLoggedIn())) {
    redirect("/admin/login");
  }

  const dbEnabled = isDatabaseEnabled();
  const novels = await getAllNovels();
  const purchases = await getAllPurchases();
  const chapterCounts = await countChaptersByNovel();
  const commentCount = await countComments();
  const recentComments = await listRecentComments(15);
  const totalChapters = Object.values(chapterCounts).reduce((a, b) => a + b, 0);

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-ink-950">管理后台</h1>
          <p className="mt-1 text-sm text-ink-500">
            上传小说 · 管理章节 · 审核评论 · 查看订单
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {dbEnabled && (
            <>
              <Link
                href="/admin/novels/new"
                className="rounded-lg bg-ink-900 px-4 py-2 text-sm text-white hover:bg-ink-800"
              >
                + 上传新书
              </Link>
              {novels[0] && (
                <Link
                  href={`/admin/novels/${novels[0].slug}/chapters/new`}
                  className="rounded-lg border border-ink-200 bg-white px-4 py-2 text-sm hover:bg-ink-50"
                >
                  + 给《{novels[0].title}》加章
                </Link>
              )}
            </>
          )}
          <AdminLogoutButton />
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-accent/20 bg-amber-50 p-5 text-sm text-ink-800">
        <p className="font-medium text-ink-950">怎么上传小说？</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-ink-700">
          <li>点右上角 <strong>+ 上传新书</strong>，填书名、作者、简介</li>
          <li>进入该书管理页，点 <strong>+ 添加章节</strong>，粘贴正文保存</li>
          <li>前台立刻可读；付费章由「免费章节数」控制</li>
        </ol>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="数据库" value={dbEnabled ? "已连接" : "未配置"} />
        <StatCard label="小说" value={String(novels.length)} />
        <StatCard label="章节" value={String(totalChapters)} />
        <StatCard label="评论" value={String(commentCount)} />
      </div>

      {!dbEnabled && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          请配置 <code className="rounded bg-amber-100 px-1">DATABASE_URL</code> 并运行{" "}
          <code className="rounded bg-amber-100 px-1">npm run db:push</code>。
        </div>
      )}

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-ink-950">小说库</h2>
          {dbEnabled && (
            <Link href="/admin/novels/new" className="text-sm text-accent hover:underline">
              上传新书 →
            </Link>
          )}
        </div>

        {novels.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-ink-300 p-10 text-center">
            <p className="text-ink-600">还没有小说</p>
            <Link
              href="/admin/novels/new"
              className="mt-4 inline-block rounded-lg bg-ink-900 px-4 py-2 text-sm text-white"
            >
              上传第一本
            </Link>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-ink-100 overflow-hidden rounded-2xl border border-ink-200 bg-white">
            {novels.map((novel) => (
              <li key={novel.slug} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-ink-900">{novel.title}</p>
                    <span className="rounded-md bg-ink-100 px-2 py-0.5 text-xs text-ink-600">
                      {novel.status === "completed" ? "完结" : "连载"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-ink-500">
                    {novel.author} · {chapterCounts[novel.slug] || 0} 章 · 免费前 {novel.freeChapters} 章 ·{" "}
                    {novel.priceLabel}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/admin/novels/${novel.slug}/chapters/new`}
                    className="rounded-lg bg-ink-900 px-3 py-1.5 text-sm text-white hover:bg-ink-800"
                  >
                    + 加章
                  </Link>
                  <Link
                    href={`/admin/novels/${novel.slug}`}
                    className="rounded-lg border border-ink-200 px-3 py-1.5 text-sm hover:bg-ink-50"
                  >
                    管理
                  </Link>
                  <Link
                    href={`/novel/${novel.slug}`}
                    className="rounded-lg border border-ink-200 px-3 py-1.5 text-sm text-ink-500 hover:bg-ink-50"
                  >
                    预览
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-xl font-bold text-ink-950">最近评论</h2>
        <p className="mt-1 text-sm text-ink-500">读者讨论；不当内容可删除</p>
        {recentComments.length === 0 ? (
          <p className="mt-4 text-sm text-ink-500">暂无评论</p>
        ) : (
          <ul className="mt-4 divide-y divide-ink-100 overflow-hidden rounded-2xl border border-ink-200 bg-white">
            {recentComments.map((c) => (
              <li key={c.id} className="flex items-start justify-between gap-4 px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-ink-900">
                    {c.authorName}{" "}
                    <span className="font-normal text-ink-400">
                      · {c.novelSlug}/{c.chapterSlug}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-ink-700">{c.content}</p>
                  <p className="mt-1 text-xs text-ink-400">
                    {new Date(c.createdAt).toLocaleString("zh-CN")}
                  </p>
                </div>
                <AdminCommentDeleteButton id={c.id} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-xl font-bold text-ink-950">最近订单</h2>
        {purchases.length === 0 ? (
          <p className="mt-4 text-sm text-ink-500">暂无订单（Stripe 未配置时正常）</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-ink-200 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-ink-100 bg-ink-50 text-ink-600">
                <tr>
                  <th className="px-4 py-3">邮箱</th>
                  <th className="px-4 py-3">类型</th>
                  <th className="px-4 py-3">小说</th>
                  <th className="px-4 py-3">时间</th>
                </tr>
              </thead>
              <tbody>
                {purchases.slice(0, 20).map((p) => (
                  <tr key={p.id} className="border-b border-ink-50">
                    <td className="px-4 py-3">{p.email}</td>
                    <td className="px-4 py-3">{p.type === "subscription" ? "订阅" : "单本"}</td>
                    <td className="px-4 py-3">{p.novelSlug || "—"}</td>
                    <td className="px-4 py-3">{new Date(p.createdAt).toLocaleString("zh-CN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-5">
      <p className="text-sm text-ink-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-ink-950">{value}</p>
    </div>
  );
}
