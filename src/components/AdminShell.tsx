"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "概览", exact: true },
  { href: "/admin/ideas", label: "想法", exact: false },
  { href: "/admin/orders", label: "订单", exact: false },
  { href: "/admin/settings", label: "站点设置", exact: false },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  if (pathname.startsWith("/admin/login")) return <>{children}</>;

  return (
    <div className="min-h-screen bg-[#f6f7f6]">
      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6">
        <aside className="hidden w-44 shrink-0 md:block">
          <p className="px-3 text-xs font-semibold uppercase tracking-wide text-ink-400">运营后台</p>
          <nav className="mt-3 space-y-1">
            {links.map((l) => {
              const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "block rounded-lg px-3 py-2 text-sm",
                    active ? "bg-[#07c160]/15 font-medium text-[#07c160]" : "text-ink-700 hover:bg-white"
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
            <Link href="/" className="block rounded-lg px-3 py-2 text-sm text-ink-500 hover:bg-white">
              前台发现
            </Link>
          </nav>
        </aside>
        <div className="min-w-0 flex-1">
          <div className="mb-4 flex gap-2 overflow-x-auto md:hidden">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="shrink-0 rounded-full bg-white px-3 py-1 text-sm text-ink-700 ring-1 ring-ink-200"
              >
                {l.label}
              </Link>
            ))}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
