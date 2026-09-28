"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type PreviewRow = {
  order: number;
  title: string;
  slug: string;
  chars: number;
  preview: string;
};

export function TxtImportPanel({
  novelSlug,
  existingCount,
}: {
  novelSlug: string;
  existingCount: number;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [text, setText] = useState("");
  const [replace, setReplace] = useState(existingCount === 0);
  const [preview, setPreview] = useState<PreviewRow[] | null>(null);
  const [mode, setMode] = useState<string>("");
  const [warning, setWarning] = useState("");
  const [error, setError] = useState("");
  const [okMsg, setOkMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function readFile(file: File) {
    setError("");
    setOkMsg("");
    setPreview(null);
    setFileName(file.name);

    // Try UTF-8 first; fallback to GBK for common Chinese TXT exports
    const buf = await file.arrayBuffer();
    let decoded = new TextDecoder("utf-8", { fatal: false }).decode(buf);
    // Heuristic: lots of replacement chars → try gbk
    const bad = (decoded.match(/\uFFFD/g) || []).length;
    if (bad > 5 || /锟|�|Ã./.test(decoded.slice(0, 200))) {
      try {
        decoded = new TextDecoder("gbk" as string).decode(buf);
      } catch {
        /* keep utf-8 */
      }
    }
    setText(decoded);
    await runPreview(decoded);
  }

  async function runPreview(raw: string) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/novels/${novelSlug}/chapters/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: raw, previewOnly: true }),
      });
      const data = (await res.json()) as {
        error?: string;
        chapters?: PreviewRow[];
        mode?: string;
        warning?: string;
        count?: number;
      };
      if (!res.ok) {
        setError(data.error || "预览失败");
        setPreview(null);
        return;
      }
      setPreview(data.chapters || []);
      setMode(data.mode || "");
      setWarning(data.warning || "");
    } catch {
      setError("预览请求失败");
    } finally {
      setBusy(false);
    }
  }

  async function handleImport() {
    if (!text.trim()) {
      setError("请先选择 TXT 文件");
      return;
    }
    if (replace && existingCount > 0) {
      const ok = window.confirm(
        `将删除本书现有的 ${existingCount} 章，再用 TXT 全部替换。确定吗？`
      );
      if (!ok) return;
    }

    setBusy(true);
    setError("");
    setOkMsg("");
    try {
      const res = await fetch(`/api/admin/novels/${novelSlug}/chapters/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, replace }),
      });
      const data = (await res.json()) as {
        error?: string;
        imported?: number;
        warning?: string;
      };
      if (!res.ok) {
        setError(data.error || "导入失败");
        return;
      }
      setOkMsg(`已导入 ${data.imported} 章${data.warning ? `（${data.warning}）` : ""}`);
      setPreview(null);
      setText("");
      setFileName("");
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    } catch {
      setError("导入请求失败");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border-2 border-dashed border-[#07c160]/40 bg-[#07c160]/5 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-serif text-lg font-bold text-ink-950">整本 TXT 一键导入</h3>
          <p className="mt-1 text-sm text-ink-600">
            上传整本书的 .txt，自动按「第X章 / Chapter N」切开并写入数据库。不用一章章粘贴。
          </p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="rounded-full bg-[#07c160] px-4 py-2 text-sm font-medium text-white hover:bg-[#06ad56] disabled:opacity-50"
        >
          选择 TXT 文件
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".txt,text/plain"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void readFile(f);
          }}
        />
      </div>

      <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-ink-500">
        <li>推荐格式：每章一行标题，如「第一章 觉醒」或「Chapter 1 Title」，下面跟正文</li>
        <li>支持 UTF-8 / 常见 GBK 中文 TXT</li>
        <li>没有章节标题时，会按篇幅自动切段（仍可导入，建议事后在列表里改标题）</li>
      </ul>

      {fileName && (
        <p className="mt-3 text-sm text-ink-700">
          已选：<span className="font-medium">{fileName}</span>
          {text ? ` · ${text.length.toLocaleString()} 字` : ""}
        </p>
      )}

      {warning && <p className="mt-2 text-sm text-amber-700">{warning}</p>}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {okMsg && <p className="mt-2 text-sm text-green-700">{okMsg}</p>}

      {preview && preview.length > 0 && (
        <div className="mt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-ink-800">
              预览：识别到 {preview.length} 章
              {mode === "chunks" ? "（自动切段）" : mode === "headings" ? "（按标题分章）" : ""}
            </p>
            <label className="flex items-center gap-2 text-sm text-ink-700">
              <input
                type="checkbox"
                checked={replace}
                onChange={(e) => setReplace(e.target.checked)}
              />
              替换本书全部已有章节
              {existingCount > 0 ? `（当前 ${existingCount} 章）` : ""}
            </label>
          </div>

          <ol className="mt-3 max-h-64 space-y-2 overflow-y-auto rounded-xl border border-ink-200 bg-white p-3">
            {preview.map((c) => (
              <li key={c.slug} className="border-b border-ink-50 pb-2 last:border-0 last:pb-0">
                <p className="text-sm font-medium text-ink-900">
                  {c.order}. {c.title}{" "}
                  <span className="font-normal text-ink-400">
                    · {c.chars} 字 · {c.slug}
                  </span>
                </p>
                <p className="mt-0.5 line-clamp-2 text-xs text-ink-500">{c.preview}</p>
              </li>
            ))}
          </ol>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleImport()}
              className="rounded-full bg-ink-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-ink-800 disabled:opacity-50"
            >
              {busy ? "导入中…" : `确认导入 ${preview.length} 章`}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setPreview(null);
                setText("");
                setFileName("");
                setWarning("");
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="rounded-full border border-ink-200 px-4 py-2.5 text-sm text-ink-600 hover:bg-ink-50"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
