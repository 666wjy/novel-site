"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export function AuthMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setEmail(data.user?.email ?? null);
      })
      .catch(() => {
        if (!cancelled) setEmail(null);
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setEmail(null);
    router.refresh();
    if (pathname.startsWith("/library")) router.push("/");
  }

  if (email === undefined) {
    return <span className="hidden w-14 sm:inline-block" />;
  }

  if (!email) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(pathname || "/")}`}
        className="rounded-full px-3 py-1.5 text-sm text-ink-600 transition hover:bg-ink-100 hover:text-ink-900"
      >
        Me
      </Link>
    );
  }

  return (
    <span className="flex items-center gap-0.5">
      <Link
        href="/library"
        className="hidden rounded-full px-3 py-1.5 text-sm text-ink-500 sm:inline"
        title={email}
      >
        Me
      </Link>
      <button
        type="button"
        onClick={() => void logout()}
        className="rounded-full px-3 py-1.5 text-sm text-ink-600 transition hover:bg-ink-100 hover:text-ink-900"
      >
        Sign out
      </button>
    </span>
  );
}
