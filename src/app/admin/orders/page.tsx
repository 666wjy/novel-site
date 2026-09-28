import { redirect } from "next/navigation";
import { isAdminLoggedIn } from "@/lib/admin-auth";
import { getAllPurchases } from "@/lib/purchases";

export default async function AdminOrdersPage() {
  if (!(await isAdminLoggedIn())) redirect("/admin/login");
  const purchases = await getAllPurchases();

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-ink-950">订单</h1>
      <p className="mt-1 text-sm text-ink-500">单本解锁与订阅。未接支付时这里为空。</p>
      {purchases.length === 0 ? (
        <p className="mt-6 text-sm text-ink-500">暂无订单</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-ink-200 bg-white">
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
              {purchases.map((p) => (
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
    </div>
  );
}
