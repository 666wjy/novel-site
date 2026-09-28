"use client";

import { useMemo, useState } from "react";
import { NovelCard } from "@/components/NovelCard";
import type { NovelMeta } from "@/lib/types";

export function DiscoverCatalog({
  novels,
  favorited,
  progressLabel,
}: {
  novels: NovelMeta[];
  favorited: string[];
  progressLabel: Record<string, string>;
}) {
  const [q, setQ] = useState("");
  const [genre, setGenre] = useState("All");
  const fav = new Set(favorited);

  const genres = useMemo(() => {
    const set = new Set<string>();
    for (const n of novels) for (const g of n.genre) if (g) set.add(g);
    return ["All", ...[...set].sort()];
  }, [novels]);

  const filtered = novels.filter((n) => {
    const hay = `${n.title} ${n.author} ${n.description} ${n.genre.join(" ")}`.toLowerCase();
    if (q.trim() && !hay.includes(q.trim().toLowerCase())) return false;
    if (genre !== "All" && !n.genre.includes(genre)) return false;
    return true;
  });

  return (
    <section className="mt-10">
      <h2 className="font-serif text-xl font-bold text-ink-950">All titles</h2>
      <p className="mt-1 text-sm text-ink-500">Search, filter by genre, then start reading</p>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search title, author, or tag"
        className="mt-4 w-full rounded-full border border-ink-200 bg-white px-4 py-2.5 text-sm outline-none ring-[#07c160]/30 focus:ring-2"
      />

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {genres.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setGenre(g)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs ${
              genre === g
                ? "bg-[#07c160] text-white"
                : "bg-ink-100 text-ink-600 hover:bg-ink-200"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-ink-200 p-8 text-center text-sm text-ink-500">
          No titles match.
        </p>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {filtered.map((novel) => (
            <NovelCard
              key={novel.slug}
              novel={novel}
              favorited={fav.has(novel.slug)}
              progressLabel={progressLabel[novel.slug]}
            />
          ))}
        </div>
      )}
    </section>
  );
}
