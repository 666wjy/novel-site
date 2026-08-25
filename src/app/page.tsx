import type { Metadata } from "next";
import { getAllNovels } from "@/lib/novels";
import { siteConfig } from "@/lib/site-config";
import { NovelCard } from "@/components/NovelCard";

export const metadata: Metadata = {
  title: siteConfig.siteName,
  description: siteConfig.tagline,
};

export default function HomePage() {
  const novels = getAllNovels();

  return (
    <div>
      <section className="rounded-3xl bg-gradient-to-br from-ink-950 via-ink-900 to-accent-dark px-6 py-14 text-white sm:px-10">
        <p className="text-sm uppercase tracking-widest text-amber-200/80">Original Fiction</p>
        <h1 className="mt-3 font-serif text-4xl font-bold leading-tight sm:text-5xl">
          {siteConfig.siteName}
        </h1>
        <p className="mt-4 max-w-xl text-lg text-ink-200">{siteConfig.tagline}</p>
        <p className="mt-6 text-sm text-ink-300">
          前 3 章免费试读 · 喜欢再解锁 · AI 辅助原创
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl font-bold text-ink-950">全部作品</h2>
        <p className="mt-1 text-sm text-ink-500">点击封面进入阅读</p>

        {novels.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-ink-300 p-12 text-center text-ink-500">
            暂无作品，请在 content/novels.json 中添加
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {novels.map((novel) => (
              <NovelCard key={novel.slug} novel={novel} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
