import type { Metadata } from "next";
import Link from "next/link";
import { getAllNovels, getChapterMetas } from "@/lib/novels";
import { getSiteSettings } from "@/lib/site-settings";
import { NovelCover } from "@/components/NovelCover";
import { DiscoverCatalog } from "@/components/DiscoverCatalog";
import { getSession } from "@/lib/auth";
import { listFavoriteSlugs, listProgress } from "@/lib/library";

export const metadata: Metadata = {
  title: "Discover",
};

export default async function HomePage() {
  const settings = await getSiteSettings();
  const novelsRaw = await getAllNovels();
  const rank = new Map(settings.featuredSlugs.map((slug, i) => [slug, i]));
  const novels = [...novelsRaw].sort((a, b) => {
    const ra = rank.has(a.slug) ? rank.get(a.slug)! : 999;
    const rb = rank.has(b.slug) ? rank.get(b.slug)! : 999;
    if (ra !== rb) return ra - rb;
    return 0;
  });
  const session = await getSession();
  const favoriteSet = new Set(session ? await listFavoriteSlugs(session.id) : []);
  const progressRows = session ? await listProgress(session.id) : [];

  const continueItems: {
    slug: string;
    title: string;
    cover: string;
    href: string;
    label: string;
  }[] = [];

  for (const row of progressRows.slice(0, 8)) {
    const novel = novels.find((n) => n.slug === row.novelSlug);
    if (!novel) continue;
    const chapters = await getChapterMetas(row.novelSlug);
    const chapter = chapters.find((c) => c.slug === row.chapterSlug);
    continueItems.push({
      slug: novel.slug,
      title: novel.title,
      cover: novel.cover,
      href: `/novel/${row.novelSlug}/${row.chapterSlug}`,
      label: chapter ? `Ch. ${chapter.order}` : "Continue",
    });
  }

  const progressLabel: Record<string, string> = {};
  for (const row of progressRows) {
    const chapters = await getChapterMetas(row.novelSlug);
    const chapter = chapters.find((c) => c.slug === row.chapterSlug);
    if (chapter) progressLabel[row.novelSlug] = `Ch. ${chapter.order}`;
  }

  return (
    <div>
      <section className="rounded-2xl bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#073d28] px-6 py-10 text-white sm:px-8">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#07c160]">Discover</p>
        <h1 className="mt-2 font-serif text-3xl font-bold sm:text-4xl">{settings.siteName}</h1>
        <p className="mt-2 max-w-lg text-sm text-white/70 sm:text-base">{settings.tagline}</p>
        <div className="mt-5 flex flex-wrap gap-2 text-xs text-white/50">
          <span className="rounded-full bg-white/10 px-3 py-1">Free chapters</span>
          <span className="rounded-full bg-white/10 px-3 py-1">Paragraph ideas</span>
          <span className="rounded-full bg-white/10 px-3 py-1">Your shelf</span>
        </div>
      </section>

      {continueItems.length > 0 && (
        <section className="mt-8">
          <div className="flex items-end justify-between gap-2">
            <h2 className="font-serif text-xl font-bold text-ink-950">Continue reading</h2>
            <Link href="/library" className="text-xs font-medium text-[#07c160]">
              Shelf →
            </Link>
          </div>
          <div className="-mx-1 mt-4 flex gap-4 overflow-x-auto px-1 pb-2">
            {continueItems.map((item) => (
              <Link
                key={item.slug}
                href={item.href}
                className="w-24 shrink-0 sm:w-28"
              >
                <NovelCover
                  title={item.title}
                  cover={item.cover}
                  className="aspect-[2/3] w-full shadow-md"
                  sizes="112px"
                />
                <p className="mt-2 line-clamp-2 text-xs font-medium text-ink-900">{item.title}</p>
                <p className="text-[10px] text-[#07c160]">{item.label}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {novels.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-ink-300 p-12 text-center text-ink-500">
          No stories yet. Add titles from the admin dashboard.
        </div>
      ) : (
        <DiscoverCatalog
          novels={novels}
          favorited={[...favoriteSet]}
          progressLabel={progressLabel}
        />
      )}
    </div>
  );
}
