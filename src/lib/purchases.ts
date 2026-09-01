import fs from "fs";
import path from "path";
import crypto from "crypto";
import { eq } from "drizzle-orm";
import { getDb, isDatabaseEnabled } from "@/db";
import { purchases as purchasesTable } from "@/db/schema";

export interface PurchaseRecord {
  id: string;
  email: string;
  novelSlug?: string;
  type: "novel_unlock" | "subscription";
  stripeSessionId: string;
  createdAt: string;
  expiresAt?: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const PURCHASES_FILE = path.join(DATA_DIR, "purchases.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readPurchasesFromFile(): PurchaseRecord[] {
  ensureDataDir();
  if (!fs.existsSync(PURCHASES_FILE)) return [];
  return JSON.parse(fs.readFileSync(PURCHASES_FILE, "utf-8")) as PurchaseRecord[];
}

function writePurchasesToFile(records: PurchaseRecord[]) {
  ensureDataDir();
  fs.writeFileSync(PURCHASES_FILE, JSON.stringify(records, null, 2));
}

function mapPurchaseRow(row: typeof purchasesTable.$inferSelect): PurchaseRecord {
  return {
    id: row.id,
    email: row.email,
    novelSlug: row.novelSlug ?? undefined,
    type: row.type,
    stripeSessionId: row.stripeSessionId,
    createdAt: row.createdAt.toISOString(),
    expiresAt: row.expiresAt?.toISOString(),
  };
}

export async function addPurchase(record: Omit<PurchaseRecord, "id" | "createdAt">) {
  const entry: PurchaseRecord = {
    ...record,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    email: record.email.toLowerCase().trim(),
  };

  if (isDatabaseEnabled()) {
    const db = getDb();
    await db
      .insert(purchasesTable)
      .values({
        id: entry.id,
        email: entry.email,
        novelSlug: entry.novelSlug ?? null,
        type: entry.type,
        stripeSessionId: entry.stripeSessionId,
        createdAt: new Date(entry.createdAt),
        expiresAt: entry.expiresAt ? new Date(entry.expiresAt) : null,
      })
      .onConflictDoNothing({ target: purchasesTable.stripeSessionId });
    return entry;
  }

  const purchases = readPurchasesFromFile();
  if (purchases.some((p) => p.stripeSessionId === entry.stripeSessionId)) {
    return purchases.find((p) => p.stripeSessionId === entry.stripeSessionId)!;
  }
  purchases.push(entry);
  writePurchasesToFile(purchases);
  return entry;
}

export async function hasNovelAccess(email: string, novelSlug: string): Promise<boolean> {
  const normalized = email.toLowerCase().trim();
  const now = Date.now();
  const purchases = await getPurchasesByEmail(normalized);

  for (const p of purchases) {
    if (p.type === "subscription") {
      if (!p.expiresAt || new Date(p.expiresAt).getTime() > now) return true;
    }
    if (p.type === "novel_unlock" && p.novelSlug === novelSlug) return true;
  }
  return false;
}

async function getPurchasesByEmail(email: string): Promise<PurchaseRecord[]> {
  if (isDatabaseEnabled()) {
    const db = getDb();
    const rows = await db.select().from(purchasesTable).where(eq(purchasesTable.email, email));
    return rows.map(mapPurchaseRow);
  }
  return readPurchasesFromFile().filter((p) => p.email.toLowerCase() === email);
}

export async function findPurchaseBySession(sessionId: string): Promise<PurchaseRecord | undefined> {
  if (isDatabaseEnabled()) {
    const db = getDb();
    const rows = await db
      .select()
      .from(purchasesTable)
      .where(eq(purchasesTable.stripeSessionId, sessionId))
      .limit(1);
    return rows[0] ? mapPurchaseRow(rows[0]) : undefined;
  }
  return readPurchasesFromFile().find((p) => p.stripeSessionId === sessionId);
}

export async function getAllPurchases(): Promise<PurchaseRecord[]> {
  if (isDatabaseEnabled()) {
    const db = getDb();
    const rows = await db.select().from(purchasesTable);
    return rows
      .map(mapPurchaseRow)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  return readPurchasesFromFile().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getAccessToken(email: string): string {
  const secret = process.env.ACCESS_TOKEN_SECRET || "dev-secret-change-me";
  return crypto.createHmac("sha256", secret).update(email.toLowerCase().trim()).digest("hex");
}

export function verifyAccessToken(email: string, token: string): boolean {
  return getAccessToken(email) === token;
}
