import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-serif text-3xl font-bold text-ink-950">Pricing</h1>
      <p className="mt-2 text-ink-600">Simple and clear — try free, then decide</p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-xl font-bold">Unlock one novel</h2>
          <p className="mt-2 text-3xl font-bold text-accent">$2.99</p>
          <p className="mt-1 text-sm text-ink-500">One-time purchase. Keep every chapter forever.</p>
          <ul className="mt-4 space-y-2 text-sm text-ink-600">
            <li>✓ First 3 chapters free</li>
            <li>✓ Permanent access after unlock</li>
            <li>✓ Includes future chapter updates</li>
          </ul>
        </div>

        <div className="rounded-2xl border-2 border-accent bg-amber-50/50 p-6 shadow-sm">
          <h2 className="font-serif text-xl font-bold">Site subscription</h2>
          <p className="mt-2 text-3xl font-bold text-accent">
            $9.99<span className="text-base font-normal text-ink-500">/mo</span>
          </p>
          <p className="mt-1 text-sm text-ink-500">Read every title on the site</p>
          <ul className="mt-4 space-y-2 text-sm text-ink-600">
            <li>✓ Unlimited reading across all novels</li>
            <li>✓ New releases included automatically</li>
            <li>✓ Cancel anytime</li>
          </ul>
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-ink-500">
        Open any novel, sign in, and pay securely via Paddle
      </p>
      <p className="mt-4 text-center">
        <Link href="/" className="text-accent hover:underline">
          ← Back to browse
        </Link>
      </p>
    </div>
  );
}

export const metadata = {
  title: `Pricing · ${siteConfig.siteName}`,
};
