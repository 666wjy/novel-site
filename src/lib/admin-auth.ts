import crypto from "crypto";
import { cookies } from "next/headers";

export function getAdminToken(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return "";
  return crypto.createHmac("sha256", "admin-session").update(password).digest("hex");
}

export async function isAdminLoggedIn(): Promise<boolean> {
  const token = getAdminToken();
  if (!token) return false;
  const cookieStore = await cookies();
  return cookieStore.get("admin_token")?.value === token;
}
