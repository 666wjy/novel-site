"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export function FavoriteButton({
  novelSlug,
  initialFavorited,
  loggedIn,
}: {
  novelSlug: string;
  initialFavorited: boolean;
  loggedIn: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [pending, setPending] = useState(false);

  async function toggle() {
    if (!loggedIn) {
      router.push(`/login?next=${encodeURIComponent(pathname || `/novel/${novelSlug}`)}`);
      return;
    }
    setPending(true);
    try {
      const res = await fetch(
        favorited ? `/api/favorites?novelSlug=${encodeURIComponent(novelSlug)}` : "/api/favorites",
        {
          method: favorited ? "DELETE" : "POST",
          headers: favorited ? undefined : { "Content-Type": "application/json" },
          body: favorited ? undefined : JSON.stringify({ novelSlug }),
        }
      );
      if (res.status === 401) {
        router.push(`/login?next=${encodeURIComponent(pathname || `/novel/${novelSlug}`)}`);
        return;
      }
      if (!res.ok) throw new Error("failed");
      setFavorited(!favorited);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void toggle()}
      disabled={pending}
      className="inline-flex items-center justify-center rounded-xl border border-ink-300 bg-white px-5 py-2.5 text-sm font-semibold text-ink-800 transition hover:border-accent/40 hover:bg-ink-50 disabled:opacity-60"
    >
      {favorited ? "Saved" : "Save"}
    </button>
  );
}
