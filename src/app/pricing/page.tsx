import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-serif text-3xl font-bold text-ink-950">定价说明</h1>
      <p className="mt-2 text-ink-600">简单透明，先试读再决定</p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-xl font-bold">单本解锁</h2>
          <p className="mt-2 text-3xl font-bold text-accent">$2.99</p>
          <p className="mt-1 text-sm text-ink-500">一次性购买，永久阅读该书全部章节</p>
          <ul className="mt-4 space-y-2 text-sm text-ink-600">
            <li>✓ 前 3 章免费试读</li>
            <li>✓ 解锁后永久有效</li>
            <li>✓ 支持后续更新章节</li>
          </ul>
        </div>

        <div className="rounded-2xl border-2 border-accent bg-amber-50/50 p-6 shadow-sm">
          <h2 className="font-serif text-xl font-bold">全站订阅</h2>
          <p className="mt-2 text-3xl font-bold text-accent">$9.99<span className="text-base font-normal text-ink-500">/月</span></p>
          <p className="mt-1 text-sm text-ink-500">畅读站内所有作品</p>
          <ul className="mt-4 space-y-2 text-sm text-ink-600">
            <li>✓ 全部小说无限读</li>
            <li>✓ 新书上架自动包含</li>
            <li>✓ 随时可取消</li>
          </ul>
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-ink-500">
        前往任意小说目录，输入邮箱即可跳转 Stripe 安全支付
      </p>
      <p className="mt-4 text-center">
        <Link href="/" className="text-accent hover:underline">
          ← 返回首页选书
        </Link>
      </p>
    </div>
  );
}

export const metadata = {
  title: `定价 · ${siteConfig.siteName}`,
};
