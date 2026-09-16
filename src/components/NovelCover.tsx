"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const PLACEHOLDER_GRADIENTS = [
  "from-ink-800 via-ink-700 to-accent-dark",
  "from-accent-dark via-ink-800 to-ink-900",
  "from-ink-900 via-accent-dark to-ink-700",
  "from-ink-700 via-ink-900 to-accent",
  "from-accent via-ink-800 to-ink-950",
];

function hashTitle(title: string): number {
  let h = 0;
  for (let i = 0; i < title.length; i++) {
    h = (h * 31 + title.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

interface NovelCoverProps {
  title: string;
  cover?: string | null;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

export function NovelCover({
  title,
  cover,
  className,
  priority,
  sizes = "(max-width: 640px) 100vw, 240px",
}: NovelCoverProps) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(cover) && !failed;
  const gradient = PLACEHOLDER_GRADIENTS[hashTitle(title) % PLACEHOLDER_GRADIENTS.length];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-ink-200 shadow-md ring-1 ring-ink-950/5",
        className
      )}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cover!}
          alt={`${title} cover`}
          sizes={sizes}
          className="absolute inset-0 h-full w-full object-cover"
          loading={priority ? "eager" : "lazy"}
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br px-4 text-center",
            gradient
          )}
          aria-hidden={!showImage}
        >
          <span className="font-serif text-lg font-bold leading-snug text-white/95 sm:text-xl line-clamp-4">
            {title}
          </span>
          <span className="mt-3 h-px w-10 bg-white/40" />
        </div>
      )}
    </div>
  );
}
