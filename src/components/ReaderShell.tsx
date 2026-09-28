"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import {
  readPrefs,
  updateReaderPrefs,
  useReaderPrefs,
  ReaderSettingsPanel,
  WIDTH_CLASS,
  type ReaderPrefs,
} from "@/components/ReadingSettings";
import { cn } from "@/lib/utils";

export type ReaderChapterItem = {
  slug: string;
  title: string;
  order: number;
  free?: boolean;
  locked?: boolean;
};

export function ReaderShell({
  novelSlug,
  novelTitle,
  chapterSlug,
  chapterTitle,
  chapterOrder,
  chapters,
  prev,
  next,
  children,
}: {
  novelSlug: string;
  novelTitle: string;
  chapterSlug: string;
  chapterTitle: string;
  chapterOrder: number;
  chapters: ReaderChapterItem[];
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
  children: ReactNode;
}) {
  const prefs = useReaderPrefs();
  const [chrome, setChrome] = useState(true);
  const [tocOpen, setTocOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [localPrefs, setLocalPrefs] = useState<ReaderPrefs>(prefs);

  useEffect(() => {
    setLocalPrefs(prefs);
  }, [prefs]);

  useEffect(() => {
    // Ensure prefs hydrated for theme class
    setLocalPrefs(readPrefs());
  }, []);

  const progressPct =
    chapters.length > 0
      ? Math.round((chapterOrder / chapters.length) * 100)
      : 0;

  function patchPrefs(partial: Partial<ReaderPrefs>) {
    const next = updateReaderPrefs(partial);
    setLocalPrefs(next);
  }

  return (
    <div
      className={cn("reader-shell min-h-screen", `theme-${localPrefs.theme}`)}
      data-theme={localPrefs.theme}
    >
      {/* Top bar */}
      <header
        className={cn(
          "reader-chrome fixed inset-x-0 top-0 z-40 border-b transition-transform duration-200",
          chrome ? "translate-y-0" : "-translate-y-full"
        )}
      >
        <div className={cn("mx-auto flex items-center gap-2 px-3 py-2.5", WIDTH_CLASS[localPrefs.width])}>
          <Link
            href={`/novel/${novelSlug}`}
            className="rounded-lg px-2 py-1.5 text-sm opacity-80 hover:opacity-100"
          >
            ←
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{novelTitle}</p>
            <p className="truncate text-[11px] opacity-50">
              Ch. {chapterOrder} · {chapterTitle}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              const url = window.location.href;
              if (navigator.share) {
                void navigator.share({ title: `${novelTitle} · ${chapterTitle}`, url });
              } else {
                void navigator.clipboard.writeText(url);
              }
            }}
            className="rounded-lg px-2 py-1.5 text-xs opacity-70 hover:opacity-100"
          >
            Share
          </button>
        </div>
        <div className="h-0.5 w-full bg-black/5">
          <div
            className="h-full bg-[#07c160] transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </header>

      {/* Content — tap chapter title to show/hide chrome */}
      <div
        className={cn(
          "mx-auto px-4 transition-[padding] duration-200 sm:px-6",
          WIDTH_CLASS[localPrefs.width],
          chrome ? "pb-28 pt-16" : "pb-10 pt-8"
        )}
      >
        <header
          className="mb-8 cursor-pointer text-center"
          onClick={() => setChrome((v) => !v)}
          title="Tap to show or hide controls"
        >
          <p className="text-sm opacity-45">Chapter {chapterOrder}</p>
          <h1 className="mt-2 font-serif text-3xl font-bold leading-snug sm:text-4xl">
            {chapterTitle}
          </h1>
          <div className="mx-auto mt-5 h-px w-14 opacity-20" style={{ background: "currentColor" }} />
        </header>

        <div className="relative z-10">{children}</div>
      </div>

      {/* Bottom toolbar */}
      <nav
        className={cn(
          "reader-chrome fixed inset-x-0 bottom-0 z-40 border-t transition-transform duration-200",
          chrome ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className={cn("mx-auto flex items-stretch justify-around px-2 py-2", WIDTH_CLASS[localPrefs.width])}>
          <ToolBtn
            label="Contents"
            onClick={() => {
              setSettingsOpen(false);
              setTocOpen(true);
              setChrome(true);
            }}
            icon={
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h10v2H4v-2z" />
              </svg>
            }
          />
          <ToolBtn
            label="Aa"
            onClick={() => {
              setTocOpen(false);
              setSettingsOpen(true);
              setChrome(true);
            }}
            icon={<span className="text-base font-semibold leading-none">Aa</span>}
          />
          {prev ? (
            <Link
              href={`/novel/${novelSlug}/${prev.slug}`}
              className="flex min-w-[4.5rem] flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[10px] opacity-80 hover:opacity-100"
            >
              <span className="text-lg leading-none">‹</span>
              Prev
            </Link>
          ) : (
            <span className="flex min-w-[4.5rem] flex-col items-center gap-0.5 px-2 py-1.5 text-[10px] opacity-30">
              <span className="text-lg leading-none">‹</span>
              Prev
            </span>
          )}
          {next ? (
            <Link
              href={`/novel/${novelSlug}/${next.slug}`}
              className="flex min-w-[4.5rem] flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[10px] opacity-80 hover:opacity-100"
            >
              <span className="text-lg leading-none">›</span>
              Next
            </Link>
          ) : (
            <span className="flex min-w-[4.5rem] flex-col items-center gap-0.5 px-2 py-1.5 text-[10px] opacity-30">
              <span className="text-lg leading-none">›</span>
              Next
            </span>
          )}
        </div>
        <p className="pb-2 text-center text-[10px] opacity-40">
          {progressPct}% · Ch. {chapterOrder}/{chapters.length || "?"}
        </p>
      </nav>

      {/* TOC sheet */}
      {tocOpen && (
        <Sheet onClose={() => setTocOpen(false)} title="Contents">
          <ol className="max-h-[60vh] space-y-0.5 overflow-y-auto">
            {chapters.map((ch) => {
              const active = ch.slug === chapterSlug;
              const inner = (
                <>
                  <span className="w-8 shrink-0 tabular-nums opacity-40">{ch.order}</span>
                  <span className="min-w-0 flex-1 truncate">{ch.title}</span>
                  {ch.locked ? (
                    <span className="text-[10px] opacity-40">Lock</span>
                  ) : ch.free ? (
                    <span className="text-[10px] text-[#07c160]">Free</span>
                  ) : null}
                </>
              );
              return (
                <li key={ch.slug}>
                  {ch.locked ? (
                    <div
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm opacity-50"
                      )}
                    >
                      {inner}
                    </div>
                  ) : (
                    <Link
                      href={`/novel/${novelSlug}/${ch.slug}`}
                      onClick={() => setTocOpen(false)}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition",
                        active
                          ? "bg-[#07c160]/15 font-medium text-[#07c160]"
                          : "hover:bg-black/5"
                      )}
                    >
                      {inner}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </Sheet>
      )}

      {/* Settings sheet */}
      {settingsOpen && (
        <Sheet onClose={() => setSettingsOpen(false)} title="Reading settings">
          <ReaderSettingsPanel prefs={localPrefs} onChange={patchPrefs} />
        </Sheet>
      )}
    </div>
  );
}

function ToolBtn({
  label,
  onClick,
  icon,
}: {
  label: string;
  onClick: () => void;
  icon: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-w-[4.5rem] flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[10px] opacity-80 hover:opacity-100"
    >
      {icon}
      {label}
    </button>
  );
}

function Sheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button type="button" className="absolute inset-0 bg-black/35" aria-label="Close" onClick={onClose} />
      <div className="reader-sheet relative z-10 max-h-[75vh] overflow-hidden rounded-t-2xl border-t px-4 pb-8 pt-3 shadow-2xl">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-black/15" />
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">{title}</h2>
          <button type="button" onClick={onClose} className="text-sm opacity-50 hover:opacity-80">
            Done
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
