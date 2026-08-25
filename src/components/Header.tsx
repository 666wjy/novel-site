"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "首页" },
  { href: "/pricing", label: "定价" },
  { href: "/about", label: "关于" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b border-ink-200 bg-ink-50/90 backdrop-blur sticky top-0 z-50">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="group">
          <span className="font-serif text-xl font-bold text-ink-950 group-hover:text-accent transition">
            {siteConfig.siteName}
          </span>
          <span className="hidden sm:block text-xs text-ink-500 mt-0.5">{siteConfig.tagline}</span>
        </Link>
        <nav className="flex gap-1 sm:gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm transition",
                pathname === link.href
                  ? "bg-accent/10 text-accent font-medium"
                  : "text-ink-600 hover:bg-ink-100 hover:text-ink-900"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-ink-200 bg-ink-100 mt-auto">
      <div className="mx-auto max-w-5xl px-4 py-8 text-center text-sm text-ink-500">
        <p>© {new Date().getFullYear()} {siteConfig.siteName} · 原创作品平台</p>
        <p className="mt-1">内容由作者使用 AI 辅助创作，版权归属作者本人</p>
      </div>
    </footer>
  );
}
