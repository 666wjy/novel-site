"use client";

import { usePathname } from "next/navigation";
import { Header, Footer } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";

/** Hide site chrome on chapter reader for immersive WeChat Read–style reading. */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isReader = /^\/novel\/[^/]+\/[^/]+\/?$/.test(pathname || "");
  const isAdmin = (pathname || "").startsWith("/admin");

  if (isReader || isAdmin) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 pb-24 sm:px-6 md:pb-8">{children}</main>
      <Footer />
      <BottomNav />
    </>
  );
}
