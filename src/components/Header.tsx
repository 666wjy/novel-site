"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import { AuthMenu } from "@/components/AuthMenu";

const links = [
  { href: "/", label: "Discover" },
  { href: "/library", label: "Shelf" },
  { href: "/pricing", label: "Pricing" },
];

export function Header() {
  const pathname = usePathname();
  const [name, setName] = useState(siteConfig.siteName);

  useEffect(() => {
    fetch("/api/site")
      .then((r) => r.json())
      .then((d: { siteName?: string }) => {
        if (d.siteName) setName(d.siteName);
      })
      .catch(() => undefined);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-ink-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="group shrink-0">
          <span className="font-serif text-lg font-bold text-ink-950 transition group-hover:text-[#07c160] sm:text-xl">
            {name}
          </span>
        </Link>
        <nav className="flex items-center gap-0.5 sm:gap-1">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm transition",
                  active
                    ? "bg-[#07c160]/12 font-medium text-[#07c160]"
                    : "text-ink-600 hover:bg-ink-100 hover:text-ink-900"
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <AuthMenu />
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto border-t border-ink-200 bg-white/60">
      <div className="mx-auto max-w-5xl px-4 py-8 text-center text-sm text-ink-500">
        <p>
          © {new Date().getFullYear()} {siteConfig.siteName} · Read · Save · Discuss
        </p>
        <p className="mt-1 text-xs text-ink-400">
          Stories by authors with AI assistance. Copyright belongs to the authors.
        </p>
        <p className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs">
          <Link href="/about" className="hover:text-ink-800 hover:underline">
            About
          </Link>
          <Link href="/terms" className="hover:text-ink-800 hover:underline">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-ink-800 hover:underline">
            Privacy
          </Link>
          <Link href="/refund" className="hover:text-ink-800 hover:underline">
            Refunds
          </Link>
        </p>
      </div>
    </footer>
  );
}
