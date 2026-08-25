import fs from "fs";
import path from "path";
import crypto from "crypto";

const DATA_DIR = path.join(process.cwd(), "data");
const PURCHASES_FILE = path.join(DATA_DIR, "purchases.json");

export interface PurchaseRecord {
  id: string;
  email: string;
  novelSlug?: string;
  type: "novel_unlock" | "subscription";
  stripeSessionId: string;
  createdAt: string;
  expiresAt?: string;
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readPurchases(): PurchaseRecord[] {
  ensureDataDir();
  if (!fs.existsSync(PURCHASES_FILE)) return [];
  return JSON.parse(fs.readFileSync(PURCHASES_FILE, "utf-8")) as PurchaseRecord[];
}

function writePurchases(records: PurchaseRecord[]) {
  ensureDataDir();
  fs.writeFileSync(PURCHASES_FILE, JSON.stringify(records, null, 2));
}

export function addPurchase(record: Omit<PurchaseRecord, "id" | "createdAt">) {
  const purchases = readPurchases();
  const entry: PurchaseRecord = {
    ...record,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  purchases.push(entry);
  writePurchases(purchases);
  return entry;
}

export function hasNovelAccess(email: string, novelSlug: string): boolean {
  const normalized = email.toLowerCase().trim();
  const now = Date.now();
  const purchases = readPurchases().filter(
    (p) => p.email.toLowerCase() === normalized
  );

  for (const p of purchases) {
    if (p.type === "subscription") {
      if (!p.expiresAt || new Date(p.expiresAt).getTime() > now) return true;
    }
    if (p.type === "novel_unlock" && p.novelSlug === novelSlug) return true;
  }
  return false;
}

export function getAccessToken(email: string): string {
  const secret = process.env.ACCESS_TOKEN_SECRET || "dev-secret-change-me";
  return crypto.createHmac("sha256", secret).update(email.toLowerCase().trim()).digest("hex");
}

export function verifyAccessToken(email: string, token: string): boolean {
  return getAccessToken(email) === token;
}

export function findPurchaseBySession(sessionId: string): PurchaseRecord | undefined {
  return readPurchases().find((p) => p.stripeSessionId === sessionId);
}
