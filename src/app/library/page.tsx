import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { listFavoriteSlugs, listProgress } from "@/lib/library";
import { getAllNovels, getChapterMetas } from "@/lib/novels";
import { getPurchasesByEmail } from "@/lib/purchases";
import { NovelCard } from "@/components/NovelCard";

export const metadata = { title: "My library" };

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

  const recent = [];
  for (const row of progressRows) {
    const novel = novelBySlug.get(row.novelSlug);
    if (!novel) continue;
    const chapters = await getChapterMetas(row.novelSlug);
    const chapter = chapters.find((c) => c.slug === row.chapterSlug);
    recent.push({
      novel,
      href: `/novel/${row.novelSlug}/${row.chapterSlug}`,
      label: chapter ? `Chapter ${chapter.order}: ${chapter.title}` : row.chapterSlug,
    });
  }

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-ink-950">My library</h1>
      <p className="mt-1 text-sm text-ink-500">{session.email}</p>
      {hasSub && (
        <p className="mt-2 text-sm font-medium text-accent">Site subscription active</p>
      )}

      <section className="mt-10">
        <h2 className="font-serif text-xl font-bold text-ink-950">Continue reading</h2>
        {recent.length === 0 ? (
          <p className="mt-3 text-sm text-ink-500">
            No reading history yet. Pick a title from the home page.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {recent.map((item) => (
              <li key={item.novel.slug}>
                <Link
                  href={item.href}
                  className="flex items-center justify-between rounded-xl border border-ink-200/80 bg-white/80 px-4 py-3 transition hover:border-accent/30"
                >
                  <span>
                    <span className="font-medium text-ink-900">{item.novel.title}</span>
                    <span className="mt-0.5 block text-sm text-ink-500">{item.label}</span>
                  </span>
                  <span className="text-sm text-accent">Continue →</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-xl font-bold text-ink-950">Purchased</h2>
        {owned.length === 0 ? (
          <p className="mt-3 text-sm text-ink-500">
            No purchases yet. Sign in with the email you paid with to restore unlocks.
          </p>
        ) : (
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            {owned.map((novel) => (
              <NovelCard
                key={novel.slug}
                novel={novel}
                favorited={favoriteSlugs.includes(novel.slug)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-xl font-bold text-ink-950">Saved</h2>
        {favorites.length === 0 ? (
          <p className="mt-3 text-sm text-ink-500">
            Tap Save on a novel page to add it here.
          </p>
        ) : (
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            {favorites.map((novel) => (
              <NovelCard key={novel.slug} novel={novel} favorited />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
