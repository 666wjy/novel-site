"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import { AuthMenu } from "@/components/AuthMenu";

const links = [
  { href: "/", label: "Home" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
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
          <AuthMenu />
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-ink-200 bg-ink-100 mt-auto">
      <div className="mx-auto max-w-5xl px-4 py-8 text-center text-sm text-ink-500">
        <p>
          © {new Date().getFullYear()} {siteConfig.siteName} · Original fiction platform
        </p>
        <p className="mt-1">
          Stories are created by authors with AI assistance. Copyright belongs to the authors.
        </p>
        <p className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
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
