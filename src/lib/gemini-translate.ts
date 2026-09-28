/**
 * Chinese → English translation for admin.
 * Providers (auto-picked):
 *  1. DeepSeek — works in mainland China (DEEPSEEK_API_KEY)
 *  2. Gemini — Google AI Studio (often blocked in CN: "User location is not supported")
 *  3. OpenAI-compatible — TRANSLATE_BASE_URL + TRANSLATE_API_KEY
 */

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

type Provider = "deepseek" | "gemini" | "openai";

function detectProvider(): Provider {
  const forced = (process.env.TRANSLATE_PROVIDER || "auto").toLowerCase();
  if (forced === "deepseek" || forced === "gemini" || forced === "openai") {
    return forced;
  }
  if (process.env.DEEPSEEK_API_KEY) return "deepseek";
  if (process.env.TRANSLATE_API_KEY && process.env.TRANSLATE_BASE_URL) return "openai";
  if (process.env.GEMINI_API_KEY) return "gemini";
  throw new Error(
    "未配置翻译密钥。国内请用 DeepSeek：在 .env.local 写 DEEPSEEK_API_KEY=sk-...（https://platform.deepseek.com/api_keys ）。海外可用 GEMINI_API_KEY。"
  );
}

export function getTranslateProviderLabel(): string {
  try {
    const p = detectProvider();
    if (p === "deepseek") return "DeepSeek";
    if (p === "openai") return "OpenAI-compatible";
    return "Gemini";
  } catch {
    return "未配置";
  }
}

async function callDeepSeek(prompt: string): Promise<string> {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) throw new Error("缺少 DEEPSEEK_API_KEY");

  const model = process.env.DEEPSEEK_MODEL || "deepseek-chat";
  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      max_tokens: 8192,
      messages: [
        {
          role: "system",
          content:
            "You are a professional literary translator. Reply with the requested format only. No markdown fences unless asked.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  const json = (await res.json()) as {
    error?: { message?: string };
    choices?: Array<{ message?: { content?: string } }>;
  };
  if (!res.ok) {
    throw new Error(json.error?.message || `DeepSeek 请求失败 (${res.status})`);
  }
  const text = json.choices?.[0]?.message?.content || "";
  if (!text.trim()) throw new Error("DeepSeek 返回空内容");
  return text.trim();
}

async function callOpenAICompat(prompt: string): Promise<string> {
  const key = process.env.TRANSLATE_API_KEY;
  const base = (process.env.TRANSLATE_BASE_URL || "").replace(/\/$/, "");
  const model = process.env.TRANSLATE_MODEL || "gpt-4o-mini";
  if (!key || !base) throw new Error("缺少 TRANSLATE_API_KEY / TRANSLATE_BASE_URL");

  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      max_tokens: 8192,
      messages: [
        {
          role: "system",
          content: "You are a professional literary translator. Reply with the requested format only.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  const json = (await res.json()) as {
    error?: { message?: string };
    choices?: Array<{ message?: { content?: string } }>;
  };
  if (!res.ok) {
    throw new Error(json.error?.message || `翻译 API 失败 (${res.status})`);
  }
  const text = json.choices?.[0]?.message?.content || "";
  if (!text.trim()) throw new Error("翻译 API 返回空内容");
  return text.trim();
}

const GEMINI_DEFAULT = "gemini-3.6-flash";
const GEMINI_FALLBACKS = ["gemini-3.6-flash", "gemini-3.5-flash", "gemini-3.5-flash-lite"];

async function callGeminiOnce(model: string, prompt: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("缺少 GEMINI_API_KEY");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": key,
    },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 8192 },
    }),
  });

  const json = (await res.json()) as {
    error?: { message?: string };
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  if (!res.ok) {
    throw new Error(json.error?.message || `Gemini 失败 (${res.status})`);
  }
  const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
  if (!text.trim()) throw new Error("Gemini 返回空内容");
  return text.trim();
}

async function callGemini(prompt: string): Promise<string> {
  const preferred = process.env.GEMINI_MODEL || GEMINI_DEFAULT;
  const models = [preferred, ...GEMINI_FALLBACKS.filter((m) => m !== preferred)];
  const errors: string[] = [];

  for (const model of models) {
    try {
      return await callGeminiOnce(model, prompt);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${model}: ${msg}`);
      if (/location is not supported/i.test(msg)) {
        throw new Error(
          "Gemini 在你当前网络地区不可用（User location is not supported）。请改用国内 DeepSeek：1) 打开 https://platform.deepseek.com/api_keys 创建密钥 2) 在 .env.local 增加 DEEPSEEK_API_KEY=sk-xxx 3) 重启 npm run dev"
        );
      }
      const retryable = /no longer available|not found|not supported|INVALID_ARGUMENT.*model/i.test(
        msg
      );
      if (!retryable) throw err;
    }
  }
  throw new Error(errors.join(" | ") || "Gemini 全部模型失败");
}

async function generateText(prompt: string): Promise<string> {
  const provider = detectProvider();
  try {
    if (provider === "deepseek") return await callDeepSeek(prompt);
    if (provider === "openai") return await callOpenAICompat(prompt);
    return await callGemini(prompt);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // Auto-fallback: Gemini blocked → DeepSeek if key exists
    if (
      provider === "gemini" &&
      /location is not supported|Gemini 在你当前网络地区不可用/i.test(msg) &&
      process.env.DEEPSEEK_API_KEY
    ) {
      return callDeepSeek(prompt);
    }
    throw err;
  }
}

function extractJson<T>(raw: string): T {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = (fenced?.[1] || raw).trim();
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("模型返回的不是 JSON");
  return JSON.parse(body.slice(start, end + 1)) as T;
}

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
