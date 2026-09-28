"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname() || "/";
  const hide = pathname.startsWith("/admin") || pathname.startsWith("/login") || pathname.startsWith("/register");
  if (hide) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-200/80 bg-white/95 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)] pt-1">
        <Tab href="/" label="Discover" active={pathname === "/"} />
        <Tab href="/library" label="Shelf" active={pathname.startsWith("/library")} />
        <Tab href="/library" label="Me" active={false} />
      </div>
    </nav>
  );
}

function Tab({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex min-w-[4.5rem] flex-col items-center py-2 text-[11px]",
        active ? "font-semibold text-[#07c160]" : "text-ink-500"
      )}
    >
      <span className="mb-0.5 text-base leading-none">{label === "Discover" ? "◎" : label === "Shelf" ? "▤" : "○"}</span>
      {label}
    </Link>
  );
}
