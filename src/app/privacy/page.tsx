import { siteConfig } from "@/lib/site-config";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-serif text-3xl font-bold text-ink-950">Privacy Policy</h1>
      <p className="mt-2 text-sm text-ink-500">Last updated: September 14, 2026</p>

      <div className="mt-6 space-y-4 text-ink-700 leading-relaxed">
        <p>
          This Privacy Policy explains how {siteConfig.siteName} collects and uses information when
          you visit or purchase from our website.
        </p>

        <h2 className="pt-2 font-serif text-xl font-bold text-ink-950">1. Information we collect</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Email address you provide to unlock content or subscribe</li>
          <li>Purchase and access records needed to deliver digital content</li>
          <li>Basic technical data such as browser type and IP-related geo signals used for site access rules</li>
          <li>Comments you voluntarily post on chapters</li>
        </ul>

        <h2 className="pt-2 font-serif text-xl font-bold text-ink-950">2. Payments</h2>
        <p>
          Payments are handled by Paddle as Merchant of Record. We do not store your full card
          details. Paddle processes payment data under its own privacy policy.
        </p>

        <h2 className="pt-2 font-serif text-xl font-bold text-ink-950">3. How we use information</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>To unlock purchased novels or subscriptions</li>
          <li>To operate, secure, and improve the website</li>
          <li>To respond to support requests</li>
        </ul>

        <h2 className="pt-2 font-serif text-xl font-bold text-ink-950">4. Sharing</h2>
        <p>
          We share data only with service providers needed to run the site (for example hosting and
          payment processing). We do not sell your personal information.
        </p>

        <h2 className="pt-2 font-serif text-xl font-bold text-ink-950">5. Retention</h2>
        <p>
          We keep purchase and access records as long as needed to provide ongoing access and meet
          legal requirements.
        </p>

        <h2 className="pt-2 font-serif text-xl font-bold text-ink-950">6. Contact</h2>
        <p>
          Privacy questions:{" "}
          <a href="mailto:19359932547@163.com" className="text-accent hover:underline">
            19359932547@163.com
          </a>
        </p>
      </div>
    </div>
  );
}

export const metadata = {
  title: `Privacy Policy · ${siteConfig.siteName}`,
};
