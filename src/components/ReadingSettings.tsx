"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "sf_reader_prefs";

export type FontSize = "sm" | "md" | "lg" | "xl";
export type LineHeight = "snug" | "normal" | "relaxed";
export type ReaderTheme = "white" | "sepia" | "green" | "night";
export type ReaderFont = "serif" | "sans";
export type ReaderWidth = "narrow" | "normal" | "wide";

export interface ReaderPrefs {
  fontSize: FontSize;
  lineHeight: LineHeight;
  theme: ReaderTheme;
  font: ReaderFont;
  width: ReaderWidth;
}

export const DEFAULT_READER_PREFS: ReaderPrefs = {
  fontSize: "md",
  lineHeight: "relaxed",
  theme: "sepia",
  font: "serif",
  width: "normal",
};

const FONT_CLASS: Record<FontSize, string> = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-xl",
  xl: "text-2xl",
};

const LINE_CLASS: Record<LineHeight, string> = {
  snug: "leading-relaxed",
  normal: "leading-loose",
  relaxed: "leading-[2]",
};

export const THEME_META: Record<
  ReaderTheme,
  { label: string; swatch: string; night?: boolean }
> = {
  white: { label: "White", swatch: "#ffffff" },
  sepia: { label: "Paper", swatch: "#f5f0e0" },
  green: { label: "Green", swatch: "#c7edcc" },
  night: { label: "Night", swatch: "#1c1c1c", night: true },
};

export function readPrefs(): ReaderPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_READER_PREFS;
    const parsed = JSON.parse(raw) as Partial<ReaderPrefs>;
    return {
      fontSize: parsed.fontSize ?? DEFAULT_READER_PREFS.fontSize,
      lineHeight: parsed.lineHeight ?? DEFAULT_READER_PREFS.lineHeight,
      theme: parsed.theme ?? DEFAULT_READER_PREFS.theme,
      font: parsed.font ?? DEFAULT_READER_PREFS.font,
      width: parsed.width ?? DEFAULT_READER_PREFS.width,
    };
  } catch {
    return DEFAULT_READER_PREFS;
  }
}

export function writePrefs(next: ReaderPrefs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("sf-reader-prefs", { detail: next }));
}

export function useReaderPrefs(): ReaderPrefs {
  const [prefs, setPrefs] = useState<ReaderPrefs>(DEFAULT_READER_PREFS);

  useEffect(() => {
    setPrefs(readPrefs());
    function onChange(e: Event) {
      const detail = (e as CustomEvent<ReaderPrefs>).detail;
      if (detail?.fontSize && detail?.lineHeight && detail?.theme) setPrefs(detail);
    }
    window.addEventListener("sf-reader-prefs", onChange);
    return () => window.removeEventListener("sf-reader-prefs", onChange);
  }, []);

  return prefs;
}

export function readerBodyClass(prefs: ReaderPrefs): string {
  return cn(
    "prose-ink reader-body-text",
    prefs.font === "sans" ? "font-sans" : "font-serif",
    FONT_CLASS[prefs.fontSize],
    LINE_CLASS[prefs.lineHeight]
  );
}

export const WIDTH_CLASS: Record<ReaderWidth, string> = {
  narrow: "max-w-xl",
  normal: "max-w-2xl",
  wide: "max-w-3xl",
};

export function updateReaderPrefs(partial: Partial<ReaderPrefs>) {
  const next = { ...readPrefs(), ...partial };
  writePrefs(next);
  return next;
}

/** Compact settings panel used in reader bottom sheet */
export function ReaderSettingsPanel({
  prefs,
  onChange,
}: {
  prefs: ReaderPrefs;
  onChange: (partial: Partial<ReaderPrefs>) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-medium opacity-60">Background</p>
        <div className="mt-2 flex gap-3">
          {(Object.keys(THEME_META) as ReaderTheme[]).map((key) => (
            <button
              key={key}
              type="button"
              title={THEME_META[key].label}
              onClick={() => onChange({ theme: key })}
              className={cn(
                "h-9 w-9 rounded-full border-2 shadow-sm transition",
                prefs.theme === key ? "border-[#07c160] scale-110" : "border-black/10"
              )}
              style={{ background: THEME_META[key].swatch }}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium opacity-60">Font size</p>
        <div className="mt-2 flex gap-1">
          {(
            [
              ["sm", "A-"],
              ["md", "A"],
              ["lg", "A+"],
              ["xl", "A++"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ fontSize: value })}
              className={cn(
                "flex-1 rounded-lg py-2 text-sm transition",
                prefs.fontSize === value
                  ? "bg-[#07c160] text-white"
                  : "bg-black/5 opacity-80 hover:bg-black/10"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium opacity-60">Line spacing</p>
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
              onClick={() => onChange({ lineHeight: value })}
              className={cn(
                "flex-1 rounded-lg py-2 text-xs transition",
                prefs.lineHeight === value
                  ? "bg-[#07c160] text-white"
                  : "bg-black/5 opacity-80 hover:bg-black/10"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium opacity-60">Font</p>
        <div className="mt-2 flex gap-1">
          {(
            [
              ["serif", "Serif"],
              ["sans", "Sans"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ font: value })}
              className={cn(
                "flex-1 rounded-lg py-2 text-xs transition",
                prefs.font === value
                  ? "bg-[#07c160] text-white"
                  : "bg-black/5 opacity-80 hover:bg-black/10"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium opacity-60">Page width</p>
        <div className="mt-2 flex gap-1">
          {(
            [
              ["narrow", "Narrow"],
              ["normal", "Normal"],
              ["wide", "Wide"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ width: value })}
              className={cn(
                "flex-1 rounded-lg py-2 text-xs transition",
                prefs.width === value
                  ? "bg-[#07c160] text-white"
                  : "bg-black/5 opacity-80 hover:bg-black/10"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Legacy standalone button (kept for non-shell pages if needed) */
export function ReadingSettings() {
  const [prefs, setPrefs] = useState<ReaderPrefs>(DEFAULT_READER_PREFS);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setPrefs(readPrefs());
  }, []);

  function update(partial: Partial<ReaderPrefs>) {
    const next = updateReaderPrefs(partial);
    setPrefs(next);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-lg border border-ink-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-ink-600 transition hover:border-ink-300 hover:text-ink-900"
        aria-expanded={open}
      >
        Aa
      </button>
      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            aria-label="Close settings"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-ink-200 bg-white p-4 shadow-lg">
            <ReaderSettingsPanel prefs={prefs} onChange={update} />
          </div>
        </>
      )}
    </div>
  );
}
