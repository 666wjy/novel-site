import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminLoggedIn } from "@/lib/admin-auth";
import { isDatabaseEnabled } from "@/db";
import { getAllNovels } from "@/lib/novels";
import { getAllPurchases } from "@/lib/purchases";
import { AdminLogoutButton } from "./AdminLogoutButton";

export default async function AdminPage() {
  if (!(await isAdminLoggedIn())) {
    redirect("/admin/login");
  }

  const dbEnabled = isDatabaseEnabled();
  const novels = await getAllNovels();
  const purchases = await getAllPurchases();

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-ink-950">管理后台</h1>
          <p className="mt-1 text-sm text-ink-500">小说存数据库 · 在此添加和管理</p>
        </div>
        <div className="flex gap-2">
          {dbEnabled && (
            <Link
              href="/admin/novels/new"
              className="rounded-lg bg-ink-900 px-4 py-2 text-sm text-white hover:bg-ink-800"
            >
              + 添加小说
            </Link>
          )}
          <AdminLogoutButton />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="数据库" value={dbEnabled ? "已连接" : "未配置"} />
        <StatCard label="小说数量" value={String(novels.length)} />
        <StatCard label="订单数量" value={String(purchases.length)} />
      </div>

      {!dbEnabled && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          请在 Netlify / 本地配置 <code className="rounded bg-amber-100 px-1">DATABASE_URL</code>，
          然后运行 <code className="rounded bg-amber-100 px-1">npm run db:push</code> 和{" "}
          <code className="rounded bg-amber-100 px-1">npm run db:seed</code>。详见{" "}
          <code className="rounded bg-amber-100 px-1">DATABASE.md</code>。
        </div>
      )}

      <section className="mt-8">
        <h2 className="font-serif text-xl font-bold text-ink-950">小说列表</h2>
        <ul className="mt-4 divide-y divide-ink-100 rounded-2xl border border-ink-200 bg-white">
          {novels.map((novel) => (
            <li key={novel.slug} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="font-medium text-ink-900">{novel.title}</p>
                <p className="text-sm text-ink-500">{novel.author} · {novel.slug}</p>
              </div>
              <div className="flex gap-3">
                <Link href={`/admin/novels/${novel.slug}`} className="text-sm text-accent hover:underline">
                  管理
                </Link>
                <Link href={`/novel/${novel.slug}`} className="text-sm text-ink-500 hover:underline">
                  查看
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-xl font-bold text-ink-950">最近订单</h2>
        {purchases.length === 0 ? (
          <p className="mt-4 text-sm text-ink-500">暂无订单</p>
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
