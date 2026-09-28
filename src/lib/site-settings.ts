import { neon } from "@neondatabase/serverless";
import { siteConfig } from "@/lib/site-config";

export type SiteSettings = {
  siteName: string;
  tagline: string;
  freeChaptersDefault: number;
  featuredSlugs: string[];
};

const DEFAULTS: SiteSettings = {
  siteName: siteConfig.siteName,
  tagline: siteConfig.tagline,
  freeChaptersDefault: siteConfig.freeChaptersDefault,
  featuredSlugs: [],
};

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  return neon(url);
}

async function ensureTable() {
  const sql = getSql();
  if (!sql) return;
  await sql`CREATE TABLE IF NOT EXISTS site_settings (
    key text PRIMARY KEY,
    value text NOT NULL
  )`;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const sql = getSql();
  if (!sql) return { ...DEFAULTS };
  try {
    await ensureTable();
    const rows = (await sql`SELECT key, value FROM site_settings`) as {
      key: string;
      value: string;
    }[];
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    let featured: string[] = [];
    try {
      featured = map.featuredSlugs ? (JSON.parse(map.featuredSlugs) as string[]) : [];
    } catch {
      featured = [];
    }
    return {
      siteName: map.siteName || DEFAULTS.siteName,
      tagline: map.tagline || DEFAULTS.tagline,
      freeChaptersDefault: Number(map.freeChaptersDefault) || DEFAULTS.freeChaptersDefault,
      featuredSlugs: featured.filter(Boolean),
    };
  } catch (err) {
    console.error("getSiteSettings:", err);
    return { ...DEFAULTS };
  }
}

export async function saveSiteSettings(input: SiteSettings): Promise<SiteSettings> {
  const sql = getSql();
  if (!sql) throw new Error("DATABASE_URL 未配置");
  await ensureTable();
  const entries: [string, string][] = [
    ["siteName", input.siteName.trim()],
    ["tagline", input.tagline.trim()],
    ["freeChaptersDefault", String(input.freeChaptersDefault)],
    ["featuredSlugs", JSON.stringify(input.featuredSlugs)],
  ];
  for (const [key, value] of entries) {
    await sql`
      INSERT INTO site_settings (key, value) VALUES (${key}, ${value})
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `;
  }
  return getSiteSettings();
}
