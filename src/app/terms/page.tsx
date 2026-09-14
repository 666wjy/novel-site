import { siteConfig } from "@/lib/site-config";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-serif text-3xl font-bold text-ink-950">Terms of Service</h1>
      <p className="mt-2 text-sm text-ink-500">Last updated: September 14, 2026</p>

      <div className="mt-6 space-y-4 text-ink-700 leading-relaxed">
        <p>
          Welcome to {siteConfig.siteName} (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;), an original fiction
          reading website. By accessing or purchasing content on this site, you agree to these Terms.
        </p>

        <h2 className="pt-2 font-serif text-xl font-bold text-ink-950">1. Service</h2>
        <p>
          We provide digital access to original fiction. Some chapters are free; paid unlocks and
          subscriptions grant access to additional digital reading content.
        </p>

        <h2 className="pt-2 font-serif text-xl font-bold text-ink-950">2. Accounts &amp; purchases</h2>
        <p>
          Purchases are processed by our payment partner (Paddle). Access is tied to the email address
          you provide at checkout. You are responsible for keeping that email accurate.
        </p>

        <h2 className="pt-2 font-serif text-xl font-bold text-ink-950">3. License</h2>
        <p>
          After purchase you receive a personal, non-transferable license to read the unlocked content
          for personal use. You may not redistribute, resell, or scrape our content.
        </p>

        <h2 className="pt-2 font-serif text-xl font-bold text-ink-950">4. Acceptable use</h2>
        <p>
          Do not misuse the site, attempt unauthorized access, or use the service for illegal
          activity. We may suspend access for violations.
        </p>

        <h2 className="pt-2 font-serif text-xl font-bold text-ink-950">5. Refunds</h2>
        <p>
          Refunds are described in our{" "}
          <Link href="/refund" className="text-accent hover:underline">
            Refund Policy
          </Link>
          .
        </p>

        <h2 className="pt-2 font-serif text-xl font-bold text-ink-950">6. Contact</h2>
        <p>
          Questions:{" "}
          <a href="mailto:19359932547@163.com" className="text-accent hover:underline">
            19359932547@163.com
          </a>
        </p>
      </div>
    </div>
  );
}

export const metadata = {
  title: `Terms of Service · ${siteConfig.siteName}`,
};
