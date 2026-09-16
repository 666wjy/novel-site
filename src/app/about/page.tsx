import { siteConfig } from "@/lib/site-config";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl prose prose-ink">
      <h1 className="font-serif text-3xl font-bold text-ink-950">About</h1>

      <p className="mt-4 leading-relaxed text-ink-700">
        {siteConfig.siteName} is an original fiction platform. Stories are written by their
        authors, often with AI help for outlines and polishing. Copyright belongs to the authors.
      </p>

      <h2 className="mt-8 font-serif text-xl font-bold">How reading works</h2>
      <ul className="mt-3 space-y-2 text-ink-700">
        <li>First 3 chapters of each book are free</li>
        <li>Unlock one novel ($2.99) or subscribe to the whole site ($9.99/mo)</li>
        <li>After payment, access is tied to your signed-in account email</li>
      </ul>

      <h2 className="mt-8 font-serif text-xl font-bold">For authors</h2>
      <p className="mt-3 text-ink-700">
        Publish through the admin dashboard (or Markdown under{" "}
        <code className="rounded bg-ink-100 px-1.5 py-0.5 text-sm">content/novels/</code>
        ). New chapters go live as soon as you save them.
      </p>

      <h2 className="mt-8 font-serif text-xl font-bold">AI-assisted writing</h2>
      <p className="mt-3 text-ink-700">
        Tools like ChatGPT or Claude can help you draft, as long as you:
      </p>
      <ul className="mt-3 space-y-2 text-ink-700">
        <li>Publish original work — no scraping or plagiarizing others</li>
        <li>Disclose AI assistance on the site</li>
        <li>Take responsibility for what you publish</li>
      </ul>
    </div>
  );
}

export const metadata = {
  title: `About · ${siteConfig.siteName}`,
};
