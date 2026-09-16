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
    return <span className="hidden w-16 sm:inline-block" />;
  }

  if (!email) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(pathname || "/")}`}
        className="rounded-lg px-3 py-2 text-sm text-ink-600 transition hover:bg-ink-100 hover:text-ink-900"
      >
        登录
      </Link>
    );
  }

  return (
    <span className="flex items-center gap-1">
      <Link
        href="/library"
        className={`rounded-lg px-3 py-2 text-sm transition ${
          pathname === "/library"
            ? "bg-accent/10 font-medium text-accent"
            : "text-ink-600 hover:bg-ink-100 hover:text-ink-900"
        }`}
      >
        书架
      </Link>
      <button
        type="button"
        onClick={() => void logout()}
        className="rounded-lg px-3 py-2 text-sm text-ink-600 transition hover:bg-ink-100 hover:text-ink-900"
      >
        退出
      </button>
    </span>
  );
}
