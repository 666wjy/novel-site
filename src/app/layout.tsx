import type { Metadata } from "next";
import { Noto_Sans_SC, Noto_Serif_SC } from "next/font/google";
import { SiteChrome } from "@/components/SiteChrome";
import { getSiteSettings } from "@/lib/site-settings";
import "./globals.css";

const notoSerif = Noto_Serif_SC({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

const notoSans = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  return {
    title: {
      default: s.siteName,
      template: `%s · ${s.siteName}`,
    },
    description: s.tagline,
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${notoSerif.variable} ${notoSans.variable}`}>
      <body className="flex min-h-screen flex-col bg-paper font-sans text-ink-900 antialiased">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
