import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { listFavoriteSlugs, listProgress } from "@/lib/library";
import { getAllNovels, getChapterMetas } from "@/lib/novels";
import { getPurchasesByEmail } from "@/lib/purchases";
import { NovelCover } from "@/components/NovelCover";

export const metadata = { title: "Shelf" };

export default async function LibraryPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login?next=/library");
  }

  const novels = await getAllNovels();
  const novelBySlug = new Map(novels.map((n) => [n.slug, n]));
  const purchases = await getPurchasesByEmail(session.email);
  const now = Date.now();
  const hasSub = purchases.some(
    (p) => p.type === "subscription" && (!p.expiresAt || new Date(p.expiresAt).getTime() > now)
  );

  const ownedSlugs = [
    ...new Set(
      hasSub
        ? novels.map((n) => n.slug)
        : purchases
            .filter((p) => p.type === "novel_unlock" && p.novelSlug)
            .map((p) => p.novelSlug as string)
    ),
  ];

  const favoriteSlugs = await listFavoriteSlugs(session.id);
  const progressRows = await listProgress(session.id);

  const owned = ownedSlugs
    .map((slug) => novelBySlug.get(slug))
    .filter((n): n is NonNullable<typeof n> => Boolean(n));

  const favorites = favoriteSlugs
    .map((slug) => novelBySlug.get(slug))
    .filter((n): n is NonNullable<typeof n> => Boolean(n));

  const recent: {
    novel: (typeof novels)[0];
    href: string;
    label: string;
    pct: number;
  }[] = [];

  for (const row of progressRows) {
    const novel = novelBySlug.get(row.novelSlug);
    if (!novel) continue;
    const chapters = await getChapterMetas(row.novelSlug);
    const chapter = chapters.find((c) => c.slug === row.chapterSlug);
    const pct =
      chapter && chapters.length
        ? Math.round((chapter.order / chapters.length) * 100)
        : 0;
    recent.push({
      novel,
      href: `/novel/${row.novelSlug}/${row.chapterSlug}`,
      label: chapter ? `Ch. ${chapter.order} · ${chapter.title}` : row.chapterSlug,
      pct,
    });
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold text-ink-950">Shelf</h1>
          <p className="mt-1 text-sm text-ink-500">{session.email}</p>
        </div>
        {hasSub && (
          <span className="rounded-full bg-[#07c160]/12 px-3 py-1 text-xs font-medium text-[#07c160]">
            Subscription active
          </span>
        )}
      </div>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-400">
          Continue reading
        </h2>
        {recent.length === 0 ? (
          <p className="mt-3 text-sm text-ink-500">
            Nothing here yet.{" "}
            <Link href="/" className="text-[#07c160]">
              Discover titles →
            </Link>
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5">
            {recent.map((item) => (
              <Link key={item.novel.slug} href={item.href} className="group">
                <div className="relative overflow-hidden rounded-lg shadow-md">
                  <NovelCover
                    title={item.novel.title}
                    cover={item.novel.cover}
                    className="aspect-[2/3] w-full transition group-hover:scale-[1.02]"
                    sizes="160px"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 pb-2 pt-6">
                    <div className="h-1 overflow-hidden rounded-full bg-white/25">
                      <div
                        className="h-full rounded-full bg-[#07c160]"
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                </div>
                <p className="mt-2 line-clamp-2 text-xs font-medium text-ink-900">
                  {item.novel.title}
                </p>
                <p className="line-clamp-1 text-[10px] text-ink-400">{item.label}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-400">Saved</h2>
        {favorites.length === 0 ? (
          <p className="mt-3 text-sm text-ink-500">Tap Save on a book page to add it here.</p>
        ) : (
          <div className="mt-4 grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5">
            {favorites.map((novel) => (
              <Link key={novel.slug} href={`/novel/${novel.slug}`} className="group">
                <NovelCover
                  title={novel.title}
                  cover={novel.cover}
                  className="aspect-[2/3] w-full rounded-lg shadow-md transition group-hover:scale-[1.02]"
                  sizes="160px"
                />
                <p className="mt-2 line-clamp-2 text-xs font-medium text-ink-900">{novel.title}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-400">Purchased</h2>
        {owned.length === 0 ? (
          <p className="mt-3 text-sm text-ink-500">
            No purchases yet. Pay with the same email you sign in with.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5">
            {owned.map((novel) => (
              <Link key={novel.slug} href={`/novel/${novel.slug}`} className="group">
                <NovelCover
                  title={novel.title}
                  cover={novel.cover}
                  className="aspect-[2/3] w-full rounded-lg shadow-md transition group-hover:scale-[1.02]"
                  sizes="160px"
                />
                <p className="mt-2 line-clamp-2 text-xs font-medium text-ink-900">{novel.title}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
