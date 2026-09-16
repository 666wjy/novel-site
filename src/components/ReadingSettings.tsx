"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "sf_reader_prefs";

export type FontSize = "sm" | "md" | "lg";
export type LineHeight = "snug" | "normal" | "relaxed";

export interface ReaderPrefs {
  fontSize: FontSize;
  lineHeight: LineHeight;
}

const DEFAULTS: ReaderPrefs = { fontSize: "md", lineHeight: "relaxed" };

const FONT_CLASS: Record<FontSize, string> = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-xl",
};

const LINE_CLASS: Record<LineHeight, string> = {
  snug: "leading-relaxed",
  normal: "leading-loose",
  relaxed: "leading-[2]",
};

function readPrefs(): ReaderPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<ReaderPrefs>;
    return {
      fontSize: parsed.fontSize ?? DEFAULTS.fontSize,
      lineHeight: parsed.lineHeight ?? DEFAULTS.lineHeight,
    };
  } catch {
    return DEFAULTS;
  }
}

export function useReaderPrefs(): ReaderPrefs {
  const [prefs, setPrefs] = useState<ReaderPrefs>(DEFAULTS);

  useEffect(() => {
    setPrefs(readPrefs());
    function onChange(e: Event) {
      const detail = (e as CustomEvent<ReaderPrefs>).detail;
      if (detail?.fontSize && detail?.lineHeight) setPrefs(detail);
    }
    window.addEventListener("sf-reader-prefs", onChange);
    return () => window.removeEventListener("sf-reader-prefs", onChange);
  }, []);

  return prefs;
}

export function readerBodyClass(prefs: ReaderPrefs): string {
  return cn(
    "prose-ink font-serif text-ink-800",
    FONT_CLASS[prefs.fontSize],
    LINE_CLASS[prefs.lineHeight]
  );
}

export function ReadingSettings() {
  const [prefs, setPrefs] = useState<ReaderPrefs>(DEFAULTS);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setPrefs(readPrefs());
  }, []);

  function update(partial: Partial<ReaderPrefs>) {
    setPrefs((prev) => {
      const next = { ...prev, ...partial };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent("sf-reader-prefs", { detail: next }));
      return next;
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg border border-ink-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-ink-600 transition hover:border-ink-300 hover:text-ink-900"
        aria-expanded={open}
      >
        Reading settings
      </button>
      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            aria-label="Close settings"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-ink-200 bg-white p-4 shadow-lg">
            <p className="text-xs font-medium text-ink-500">Font size</p>
            <div className="mt-2 flex gap-1">
              {(
                [
                  ["sm", "S"],
                  ["md", "M"],
                  ["lg", "L"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => update({ fontSize: value })}
                  className={cn(
                    "flex-1 rounded-lg py-1.5 text-xs transition",
                    prefs.fontSize === value
                      ? "bg-accent text-white"
                      : "bg-ink-50 text-ink-700 hover:bg-ink-100"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs font-medium text-ink-500">Line spacing</p>
            <div className="mt-2 flex gap-1">
              {(
                [
                  ["snug", "Tight"],
                  ["normal", "Normal"],
                  ["relaxed", "Loose"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => update({ lineHeight: value })}
                  className={cn(
                    "flex-1 rounded-lg py-1.5 text-xs transition",
                    prefs.lineHeight === value
                      ? "bg-accent text-white"
                      : "bg-ink-50 text-ink-700 hover:bg-ink-100"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
