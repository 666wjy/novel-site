/**
 * Split a full-book .txt into chapters.
 * Supports common Chinese/English headings, e.g.
 *   第一章 觉醒
 *   第1章、第１２章
 *   Chapter 1: Title
 */

export type SplitChapter = {
  order: number;
  title: string;
  content: string;
  /** Suggested URL slug, e.g. chapter-01 */
  slug: string;
};

const HEADING_RE =
  /^(?:第[0-9０-９一二三四五六七八九十百千万零〇两]+章|Chapter\s+\d+|CHAPTER\s+\d+)(?:[：:\s、.．\-—–].*)?$/;

function normalizeNewlines(text: string) {
  return text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function slugFromOrder(order: number) {
  return `chapter-${String(order).padStart(2, "0")}`;
}

function cleanTitle(line: string) {
  return line.replace(/\s+/g, " ").trim().slice(0, 120) || `Chapter`;
}

function cleanBody(text: string) {
  return text.replace(/^\n+/, "").replace(/\n+$/, "").trim();
}

/**
 * If the file has no chapter headings, split into ~N-char chunks by blank lines
 * so a raw paste still becomes readable chapters.
 */
function splitByParagraphs(text: string, targetChars = 2500): SplitChapter[] {
  const paras = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  if (paras.length === 0) return [];

  const chunks: string[] = [];
  let buf = "";
  for (const p of paras) {
    if (buf && buf.length + p.length + 2 > targetChars) {
      chunks.push(buf);
      buf = p;
    } else {
      buf = buf ? `${buf}\n\n${p}` : p;
    }
  }
  if (buf) chunks.push(buf);

  return chunks.map((content, i) => {
    const order = i + 1;
    const firstLine = content.split("\n")[0]?.slice(0, 40) || `第 ${order} 章`;
    return {
      order,
      title: `第 ${order} 章 · ${firstLine}${firstLine.length >= 40 ? "…" : ""}`,
      content,
      slug: slugFromOrder(order),
    };
  });
}

export function splitTxtIntoChapters(raw: string): {
  chapters: SplitChapter[];
  mode: "headings" | "chunks" | "empty";
  warning?: string;
} {
  const text = normalizeNewlines(raw).trim();
  if (!text) return { chapters: [], mode: "empty", warning: "文件是空的" };

  const lines = text.split("\n");
  const headingIndexes: { line: number; title: string }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (!trimmed) continue;
    if (HEADING_RE.test(trimmed)) {
      headingIndexes.push({ line: i, title: cleanTitle(trimmed) });
    }
  }

  if (headingIndexes.length === 0) {
    const chapters = splitByParagraphs(text);
    return {
      chapters,
      mode: "chunks",
      warning:
        chapters.length > 0
          ? "未识别到「第X章 / Chapter N」标题，已按篇幅自动切段。建议在 TXT 里用「第一章」这类标题分章后再导入。"
          : "无法从文件中切出章节",
    };
  }

  // Preface before first heading → optional chapter 0 only if substantial
  const chapters: SplitChapter[] = [];
  let order = 1;

  const preface = cleanBody(lines.slice(0, headingIndexes[0].line).join("\n"));
  if (preface.length > 80) {
    chapters.push({
      order: order++,
      title: "序章",
      content: preface,
      slug: slugFromOrder(1),
    });
    // renumber slugs after we know final orders — fix below
  }

  for (let h = 0; h < headingIndexes.length; h++) {
    const start = headingIndexes[h].line + 1;
    const end = h + 1 < headingIndexes.length ? headingIndexes[h + 1].line : lines.length;
    const content = cleanBody(lines.slice(start, end).join("\n"));
    if (!content) continue;
    chapters.push({
      order: order++,
      title: headingIndexes[h].title,
      content,
      slug: slugFromOrder(order - 1),
    });
  }

  // Fix order/slug sequentially
  const normalized = chapters.map((ch, i) => ({
    ...ch,
    order: i + 1,
    slug: slugFromOrder(i + 1),
  }));

  return {
    chapters: normalized,
    mode: "headings",
    warning:
      preface.length > 0 && preface.length <= 80
        ? "文首有少量说明文字已忽略（不足成章）。"
        : undefined,
  };
}

export function estimateChars(chapters: SplitChapter[]) {
  return chapters.reduce((n, c) => n + c.content.length, 0);
}
