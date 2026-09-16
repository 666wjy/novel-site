import { NextRequest, NextResponse } from "next/server";
import {
  applySessionCookie,
  createUser,
  findUserByEmail,
  safeNextPath,
  signSession,
} from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email || "").toLowerCase().trim();
    const password = String(body.password || "");
    const next = safeNextPath(body.next);

    if (!email.includes("@")) {
      return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "This email is already registered. Please sign in." }, { status: 409 });
    }

    const user = await createUser(email, password);
    const token = await signSession(user);
    const res = NextResponse.json({ ok: true, email: user.email, next });
    applySessionCookie(res, token);
    return res;
  } catch (err) {
    console.error("register error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Registration failed" },
      { status: 500 }
    );
  }
}
