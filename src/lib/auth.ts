import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { eq } from "drizzle-orm";
import { SignJWT, jwtVerify } from "jose";
import { getDb, isDatabaseEnabled } from "@/db";
import { users as usersTable } from "@/db/schema";

export const SESSION_COOKIE = "sf_session";
const SESSION_DAYS = 30;

export type SessionUser = {
  id: string;
  email: string;
};

function getAuthSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const derived = crypto.scryptSync(password, salt, 64);
  return `${salt.toString("hex")}:${derived.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  const derived = crypto.scryptSync(password, salt, expected.length);
  if (derived.length !== expected.length) return false;
  return crypto.timingSafeEqual(derived, expected);
}

export async function signSession(user: SessionUser): Promise<string> {
  return new SignJWT({ email: user.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(getAuthSecret());
}

export async function readSessionToken(token: string | undefined | null): Promise<SessionUser | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getAuthSecret());
    const id = typeof payload.sub === "string" ? payload.sub : "";
    const email = typeof payload.email === "string" ? payload.email.toLowerCase().trim() : "";
    if (!id || !email) return null;
    return { id, email };
  } catch {
    return null;
  }
}

export function applySessionCookie(res: NextResponse, token: string) {
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  return readSessionToken(store.get(SESSION_COOKIE)?.value);
}

export async function findUserByEmail(email: string) {
  if (!isDatabaseEnabled()) return null;
  const db = getDb();
  const rows = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email.toLowerCase().trim()))
    .limit(1);
  return rows[0] ?? null;
}

export async function createUser(email: string, password: string): Promise<SessionUser> {
  if (!isDatabaseEnabled()) {
    throw new Error("Database is required for accounts");
  }
  const db = getDb();
  const id = crypto.randomUUID();
  const normalized = email.toLowerCase().trim();
  await db.insert(usersTable).values({
    id,
    email: normalized,
    passwordHash: hashPassword(password),
  });
  return { id, email: normalized };
}

export function safeNextPath(next: string | null | undefined): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return "/library";
}
