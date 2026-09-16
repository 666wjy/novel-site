/**
 * Free-tier Gemini translation helpers (Google AI Studio API key).
 * Model defaults to gemini-2.5-flash; override with GEMINI_MODEL.
 */

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set — add a free key from Google AI Studio");
  return key;
}

function getModel(): string {
  return process.env.GEMINI_MODEL || "gemini-2.5-flash";
}

async function generateText(prompt: string): Promise<string> {
  const model = getModel();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(getApiKey())}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 8192,
      },
    }),
  });

  const json = (await res.json()) as {
    error?: { message?: string };
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  if (!res.ok) {
    throw new Error(json.error?.message || `Gemini request failed (${res.status})`);
  }

  const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
  if (!text.trim()) throw new Error("Gemini returned empty text");
  return text.trim();
}

function extractJson<T>(raw: string): T {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = (fenced?.[1] || raw).trim();
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("Gemini response was not JSON");
  return JSON.parse(body.slice(start, end + 1)) as T;
}

export type NovelMetaTranslation = {
  title: string;
  author: string;
  description: string;
  genre: string[];
};

export type ChapterTranslation = {
  title: string;
  summary: string;
  content: string;
};

export async function translateNovelMeta(input: {
  title: string;
  author: string;
  description: string;
  genre: string[];
}): Promise<NovelMetaTranslation> {
  const prompt = `You are a professional literary translator. Translate the following Chinese novel metadata into natural English for an overseas fiction site.

Rules:
- Keep the story meaning; do not add spoilers or marketing fluff.
- Genre tags should be short English labels (e.g. Sci-Fi, Adventure). Drop status-like tags such as "Ongoing" from genre.
- If the author is a placeholder like "你的名字", use "W. Jiayi".
- Return ONLY valid JSON with keys: title, author, description, genre (string array).

Source JSON:
${JSON.stringify(input, null, 2)}`;

  return extractJson<NovelMetaTranslation>(await generateText(prompt));
}

export async function translateChapter(input: {
  title: string;
  summary?: string | null;
  content: string;
}): Promise<ChapterTranslation> {
  const prompt = `You are a professional literary translator for English web fiction.

Translate this Chinese chapter into engaging, natural English prose.
Preserve Markdown formatting (bold, paragraphs, blank lines).
Do not add notes, prefaces, or Chinese characters.
Return ONLY valid JSON with keys: title, summary, content.

Source:
${JSON.stringify(
  {
    title: input.title,
    summary: input.summary || "",
    content: input.content,
  },
  null,
  2
)}`;

  return extractJson<ChapterTranslation>(await generateText(prompt));
}

export function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
