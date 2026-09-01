import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAdminToken } from "@/lib/admin-auth";
import { isDatabaseEnabled } from "@/db";

export async function requireAdminApi() {
  if (!isDatabaseEnabled()) {
    return NextResponse.json({ error: "DATABASE_URL not configured" }, { status: 503 });
  }

  const cookieStore = await cookies();
  if (cookieStore.get("admin_token")?.value !== getAdminToken() || !getAdminToken()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
