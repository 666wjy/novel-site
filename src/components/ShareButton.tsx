"use client";

import { useState } from "react";

export function ShareButton({
  title,
  text,
}: {
  title: string;
  text?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        return;
      }
    } catch {
      /* user cancelled or unsupported */
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={() => void share()}
      className="inline-flex items-center justify-center rounded-xl border border-ink-300 bg-white px-4 py-2.5 text-sm font-semibold text-ink-800 transition hover:border-[#07c160]/40 hover:text-[#07c160]"
    >
      {copied ? "Link copied" : "Share"}
    </button>
  );
}
