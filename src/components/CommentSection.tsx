"use client";

import { useEffect, useState } from "react";

interface CommentItem {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export function CommentSection({
  novelSlug,
  chapterSlug,
}: {
  novelSlug: string;
  chapterSlug: string;
}) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [okMsg, setOkMsg] = useState("");

  async function loadComments() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/comments?novelSlug=${encodeURIComponent(novelSlug)}&chapterSlug=${encodeURIComponent(chapterSlug)}`
      );
      const data = (await res.json()) as { comments?: CommentItem[] };
      setComments(data.comments || []);
    } catch {
      setComments([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const saved = localStorage.getItem("comment_display_name");
    if (saved) setAuthorName(saved);
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [novelSlug, chapterSlug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setOkMsg("");

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

    localStorage.setItem("comment_display_name", authorName.trim());
    setContent("");
    setOkMsg("Posted! Thanks for joining the discussion.");
    if (data.comment) {
      setComments((prev) => [data.comment!, ...prev]);
    } else {
      await loadComments();
    }
    setSubmitting(false);
  }

  return (
    <section className="mt-14 border-t border-ink-200 pt-10">
      <h2 className="font-serif text-2xl font-bold text-ink-950">Discussion</h2>
      <p className="mt-1 text-sm text-ink-500">
        Share theories, favorite lines, or what you think happens next.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3 rounded-2xl border border-ink-200 bg-white p-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">Display name</label>
          <input
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            maxLength={40}
            placeholder="Your name"
            className="w-full rounded-lg border border-ink-200 px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-700">Comment</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={2000}
            rows={4}
            placeholder="What did you think of this chapter?"
            className="w-full rounded-lg border border-ink-200 px-3 py-2"
            required
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {okMsg && <p className="text-sm text-green-700">{okMsg}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-ink-900 px-4 py-2 text-sm text-white hover:bg-ink-800 disabled:opacity-50"
        >
          {submitting ? "Posting…" : "Post comment"}
        </button>
      </form>

      <div className="mt-8 space-y-4">
        {loading ? (
          <p className="text-sm text-ink-400">Loading comments…</p>
        ) : comments.length === 0 ? (
          <p className="rounded-xl border border-dashed border-ink-200 p-6 text-center text-sm text-ink-500">
            No comments yet — be the first to start the conversation.
          </p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="rounded-2xl border border-ink-100 bg-white p-5">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-medium text-ink-900">{c.authorName}</p>
                <time className="text-xs text-ink-400">
                  {new Date(c.createdAt).toLocaleString()}
                </time>
              </div>
              <p className="mt-2 whitespace-pre-wrap leading-relaxed text-ink-700">{c.content}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
