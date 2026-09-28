"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { readerBodyClass, useReaderPrefs } from "@/components/ReadingSettings";

export interface CommentItem {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
  quoteText: string | null;
}

type Block =
  | { kind: "p"; id: string; html: string; text: string }
  | { kind: "html"; id: string; html: string };

type PanelState = {
  quote: string;
  blockId: string | null;
  top: number;
  mode: "view" | "write";
};

function normalizeWs(s: string) {
  return s.replace(/\s+/g, " ").trim();
}

/** Attach ideas to a paragraph (full text) or a long excerpt inside it. */
function ideaBelongsToParagraph(paraText: string, quote: string) {
  const p = normalizeWs(paraText);
  const q = normalizeWs(quote);
  if (!p || !q) return false;
  if (p === q) return true;
  if (q.length >= 16 && p.includes(q)) return true;
  if (p.length >= 16 && q.includes(p)) return true;
  return false;
}

function parseBlocks(html: string): Block[] {
  if (!html.trim()) return [];
  const wrapped = `<div id="root">${html}</div>`;
  const doc = new DOMParser().parseFromString(wrapped, "text/html");
  const root = doc.getElementById("root");
  if (!root) return [];

  const blocks: Block[] = [];
  let i = 0;
  for (const child of Array.from(root.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      const t = child.textContent?.trim();
      if (t) {
        blocks.push({ kind: "p", id: `b-${i++}`, html: t, text: normalizeWs(t) });
      }
      continue;
    }
    if (child.nodeType !== Node.ELEMENT_NODE) continue;
    const el = child as HTMLElement;
    const tag = el.tagName.toLowerCase();
    if (tag === "p") {
      const inner = el.innerHTML;
      const text = normalizeWs(el.textContent || "");
      if (text) blocks.push({ kind: "p", id: `b-${i++}`, html: inner, text });
    } else {
      blocks.push({ kind: "html", id: `b-${i++}`, html: el.outerHTML });
    }
  }
  return blocks;
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "Just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(iso).toLocaleDateString();
}

function initials(name: string) {
  const t = name.trim();
  if (!t) return "?";
  return t.slice(0, 1).toUpperCase();
}

function IdeaForm({
  novelSlug,
  chapterSlug,
  quoteText,
  onPosted,
  autofocus,
}: {
  novelSlug: string;
  chapterSlug: string;
  quoteText: string;
  onPosted: (c: CommentItem) => void;
  autofocus?: boolean;
}) {
  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("comment_display_name");
    if (saved) setAuthorName(saved);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ novelSlug, chapterSlug, authorName, content, quoteText }),
    });
    const data = (await res.json()) as { error?: string; comment?: CommentItem };
    if (!res.ok) {
      setError(data.error || "Failed to post");
      setSubmitting(false);
      return;
    }
    if (authorName.trim()) localStorage.setItem("comment_display_name", authorName.trim());
    setContent("");
    if (data.comment) onPosted(data.comment);
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input
        value={authorName}
        onChange={(e) => setAuthorName(e.target.value)}
        maxLength={40}
        placeholder="Name (optional)"
        className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={2000}
        rows={3}
        placeholder="Write your idea…"
        className="w-full resize-none rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm leading-relaxed"
        required
        autoFocus={autofocus}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-[#07c160] px-5 py-2 text-sm font-medium text-white hover:bg-[#06ad56] disabled:opacity-50"
        >
          {submitting ? "Posting…" : "Post idea"}
        </button>
      </div>
    </form>
  );
}

function ChapterCommentForm({
  novelSlug,
  chapterSlug,
  onPosted,
}: {
  novelSlug: string;
  chapterSlug: string;
  onPosted: (c: CommentItem) => void;
}) {
  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("comment_display_name");
    if (saved) setAuthorName(saved);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ novelSlug, chapterSlug, authorName, content }),
    });
    const data = (await res.json()) as { error?: string; comment?: CommentItem };
    if (!res.ok) {
      setError(data.error || "Failed to post");
      setSubmitting(false);
      return;
    }
    if (authorName.trim()) localStorage.setItem("comment_display_name", authorName.trim());
    setContent("");
    if (data.comment) onPosted(data.comment);
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-3 rounded-2xl border border-ink-200 bg-white p-5">
      <input
        value={authorName}
        onChange={(e) => setAuthorName(e.target.value)}
        maxLength={40}
        placeholder="Name (optional)"
        className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={2000}
        rows={4}
        placeholder="What did you think of this chapter?"
        className="w-full rounded-lg border border-ink-200 px-3 py-2 text-sm"
        required
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-ink-900 px-4 py-2 text-sm text-white hover:bg-ink-800 disabled:opacity-50"
      >
        {submitting ? "Posting…" : "Post chapter comment"}
      </button>
    </form>
  );
}

export function ChapterReading({
  html,
  novelSlug,
  chapterSlug,
}: {
  html: string;
  novelSlug: string;
  chapterSlug: string;
}) {
  const prefs = useReaderPrefs();
  const wrapRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const paraRefs = useRef<Map<string, HTMLElement>>(new Map());

  const [blocks, setBlocks] = useState<Block[]>([]);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [panel, setPanel] = useState<PanelState | null>(null);
  const [selBar, setSelBar] = useState<{ x: number; y: number; text: string; blockId: string } | null>(
    null
  );

  // Parse once on client (and whenever chapter html changes)
  useLayoutEffect(() => {
    setBlocks(parseBlocks(html));
  }, [html]);

  const quoteComments = useMemo(() => comments.filter((c) => c.quoteText), [comments]);
  const chapterComments = useMemo(() => comments.filter((c) => !c.quoteText), [comments]);

  const countByBlock = useMemo(() => {
    const map = new Map<string, number>();
    for (const b of blocks) {
      if (b.kind !== "p") continue;
      let n = 0;
      for (const c of quoteComments) {
        if (c.quoteText && ideaBelongsToParagraph(b.text, c.quoteText)) n += 1;
      }
      if (n) map.set(b.id, n);
    }
    return map;
  }, [blocks, quoteComments]);

  const panelComments = useMemo(() => {
    if (!panel) return [];
    return quoteComments.filter(
      (c) => c.quoteText && ideaBelongsToParagraph(panel.quote, c.quoteText)
    );
  }, [panel, quoteComments]);

  const loadComments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/comments?novelSlug=${encodeURIComponent(novelSlug)}&chapterSlug=${encodeURIComponent(chapterSlug)}`
      );
      const data = (await res.json()) as { comments?: CommentItem[] };
      setComments((data.comments || []).map((c) => ({ ...c, quoteText: c.quoteText ?? null })));
    } catch {
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [novelSlug, chapterSlug]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  // Outside click / Esc closes panel & selection bar
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      if (panelRef.current?.contains(t)) return;
      if (t.closest?.("[data-idea-trigger]")) return;
      if (t.closest?.("[data-sel-bar]")) return;
      setPanel(null);
      setSelBar(null);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setPanel(null);
        setSelBar(null);
      }
    }
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function panelTopForEl(el: HTMLElement) {
    const wrap = wrapRef.current;
    if (!wrap) return 0;
    return el.getBoundingClientRect().bottom - wrap.getBoundingClientRect().top + 10;
  }

  function openPanel(opts: {
    quote: string;
    blockId: string | null;
    anchor: HTMLElement;
    mode?: "view" | "write";
  }) {
    setSelBar(null);
    setPanel({
      quote: normalizeWs(opts.quote),
      blockId: opts.blockId,
      top: panelTopForEl(opts.anchor),
      mode: opts.mode ?? "view",
    });
  }

  function handleParaTrigger(blockId: string, text: string) {
    const el = paraRefs.current.get(blockId);
    if (!el) return;
    if (panel?.blockId === blockId) {
      setPanel(null);
      return;
    }
    openPanel({ quote: text, blockId, anchor: el, mode: "view" });
  }

  function handleMouseUp() {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !bodyRef.current) {
      return;
    }
    if (!bodyRef.current.contains(sel.anchorNode)) return;

    const text = normalizeWs(sel.toString());
    if (text.length < 2 || text.length > 500) return;

    // Find which paragraph contains the selection
    let node: Node | null = sel.anchorNode;
    let blockId: string | null = null;
    while (node && node !== bodyRef.current) {
      if (node instanceof HTMLElement && node.dataset.blockId) {
        blockId = node.dataset.blockId;
        break;
      }
      node = node.parentNode;
    }
    if (!blockId) return;

    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const wrapRect = wrapRef.current!.getBoundingClientRect();
    setSelBar({
      x: Math.min(Math.max(rect.left + rect.width / 2 - wrapRect.left, 48), wrapRect.width - 48),
      y: rect.top - wrapRect.top - 44,
      text,
      blockId,
    });
  }

  function writeIdeaFromSelection() {
    if (!selBar) return;
    const el = paraRefs.current.get(selBar.blockId);
    if (!el) return;
    openPanel({
      quote: selBar.text,
      blockId: selBar.blockId,
      anchor: el,
      mode: "write",
    });
    window.getSelection()?.removeAllRanges();
  }

  function handlePosted(c: CommentItem) {
    setComments((prev) => [c, ...prev]);
    if (c.quoteText) {
      setPanel((p) =>
        p
          ? {
              ...p,
              quote: normalizeWs(c.quoteText!),
              mode: "view",
            }
          : p
      );
    }
  }

  return (
    <>
      <div className="relative" ref={wrapRef}>
        <p className="reader-hint mb-5 text-center text-xs">
          Tap ▾ for ideas · select text to write · tap chapter title to show/hide bars
        </p>

        <div
          ref={bodyRef}
          className={readerBodyClass(prefs)}
          onMouseUp={handleMouseUp}
        >
          {blocks.length === 0 ? (
            <div dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            blocks.map((b) => {
              if (b.kind === "html") {
                return (
                  <div key={b.id} dangerouslySetInnerHTML={{ __html: b.html }} />
                );
              }
              const count = countByBlock.get(b.id) ?? 0;
              const active = panel?.blockId === b.id;
              return (
                <p
                  key={b.id}
                  data-block-id={b.id}
                  ref={(el) => {
                    if (el) paraRefs.current.set(b.id, el);
                    else paraRefs.current.delete(b.id);
                  }}
                  className={[
                    "reader-para",
                    count > 0 ? "para-has-ideas" : "",
                    active ? "para-idea-open" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <span dangerouslySetInnerHTML={{ __html: b.html }} />
                  <button
                    type="button"
                    data-idea-trigger
                    className={count > 0 ? "para-cmt-btn has-comments" : "para-cmt-btn"}
                    aria-label={count > 0 ? `${count} ideas` : "Write an idea"}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleParaTrigger(b.id, b.text);
                    }}
                  >
                    {count > 0 && <span className="para-cmt-count">{count}</span>}
                    <span className="para-cmt-arrow" aria-hidden="true">
                      ▾
                    </span>
                  </button>
                </p>
              );
            })
          )}
        </div>

        {/* Selection toolbar — like WeChat “写想法” */}
        {selBar && (
          <div
            data-sel-bar
            className="absolute z-40 -translate-x-1/2"
            style={{ left: selBar.x, top: Math.max(selBar.y, 0) }}
          >
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={writeIdeaFromSelection}
              className="rounded-lg bg-[#2f2f2f] px-3 py-2 text-xs font-medium text-white shadow-lg"
            >
              Write idea
            </button>
          </div>
        )}

        {/* Idea panel under the paragraph */}
        {panel && (
          <div
            ref={panelRef}
            style={{ top: panel.top }}
            className="idea-panel absolute left-0 right-0 z-30"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="overflow-hidden rounded-2xl border border-ink-200/80 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.12)]">
              <div className="flex items-center justify-between gap-3 border-b border-ink-100 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-ink-900">Ideas</p>
                  <p className="text-[11px] text-ink-400">
                    {panelComments.length > 0
                      ? `${panelComments.length} on this passage`
                      : "Be the first to share a thought"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPanel(null)}
                  className="rounded-full px-2.5 py-1 text-xs text-ink-400 hover:bg-ink-50 hover:text-ink-700"
                >
                  Close
                </button>
              </div>

              <div className="px-4 py-3">
                <blockquote className="line-clamp-4 rounded-lg bg-[#f7f7f7] px-3 py-2 text-[13px] leading-relaxed text-ink-600">
                  {panel.quote}
                </blockquote>

                {panel.mode === "view" && (
                  <div className="mt-3 max-h-56 space-y-3 overflow-y-auto pr-1">
                    {panelComments.length === 0 ? (
                      <p className="py-2 text-center text-xs text-ink-400">No ideas yet</p>
                    ) : (
                      panelComments.map((c) => (
                        <div key={c.id} className="flex gap-2.5">
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#07c160]/15 text-xs font-semibold text-[#07c160]"
                            aria-hidden
                          >
                            {initials(c.authorName)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline gap-2">
                              <span className="truncate text-sm font-medium text-ink-900">
                                {c.authorName}
                              </span>
                              <time className="shrink-0 text-[10px] text-ink-400">
                                {relativeTime(c.createdAt)}
                              </time>
                            </div>
                            <p className="mt-0.5 whitespace-pre-wrap text-sm leading-relaxed text-ink-700">
                              {c.content}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                <div className="mt-3 border-t border-ink-100 pt-3">
                  {panel.mode === "view" ? (
                    <button
                      type="button"
                      onClick={() => setPanel((p) => (p ? { ...p, mode: "write" } : p))}
                      className="w-full rounded-full border border-ink-200 py-2.5 text-sm text-ink-600 hover:border-[#07c160]/40 hover:text-[#07c160]"
                    >
                      Write an idea
                    </button>
                  ) : (
                    <>
                      <IdeaForm
                        novelSlug={novelSlug}
                        chapterSlug={chapterSlug}
                        quoteText={panel.quote}
                        onPosted={handlePosted}
                        autofocus
                      />
                      {panelComments.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setPanel((p) => (p ? { ...p, mode: "view" } : p))}
                          className="mt-2 text-xs text-ink-400 hover:text-ink-600"
                        >
                          ← Back to ideas
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <section className="reader-discuss mt-14 border-t pt-10">
        <h2 className="font-serif text-2xl font-bold">Chapter discussion</h2>
        <p className="reader-hint mt-1 text-sm">
          Whole-chapter talk. Paragraph ideas live under ▾ above.
        </p>
        <ChapterCommentForm
          novelSlug={novelSlug}
          chapterSlug={chapterSlug}
          onPosted={handlePosted}
        />
        <div className="mt-8 space-y-4">
          {loading ? (
            <p className="reader-hint text-sm">Loading…</p>
          ) : chapterComments.length === 0 ? (
            <p className="reader-discuss-card rounded-xl border-dashed p-6 text-center text-sm opacity-60">
              No chapter comments yet.
            </p>
          ) : (
            chapterComments.map((c) => (
              <div key={c.id} className="reader-discuss-card rounded-2xl p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-medium">{c.authorName}</p>
                  <time className="reader-hint text-xs">{relativeTime(c.createdAt)}</time>
                </div>
                <p className="mt-2 whitespace-pre-wrap leading-relaxed opacity-90">{c.content}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );
}
