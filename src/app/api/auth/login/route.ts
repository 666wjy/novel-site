import { NextRequest, NextResponse } from "next/server";
import {
  applySessionCookie,
  findUserByEmail,
  safeNextPath,
  signSession,
  verifyPassword,
} from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email || "").toLowerCase().trim();
    const password = String(body.password || "");
    const next = safeNextPath(body.next);

    const user = await findUserByEmail(email);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: "Incorrect email or password" }, { status: 401 });
    }

    const token = await signSession({ id: user.id, email: user.email });
    const res = NextResponse.json({ ok: true, email: user.email, next });
    applySessionCookie(res, token);
    return res;
  } catch (err) {
    console.error("login error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Sign-in failed" },
      { status: 500 }
    );
  }
}
