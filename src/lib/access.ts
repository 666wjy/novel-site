import { cookies } from "next/headers";
import { hasNovelAccess, verifyAccessToken } from "@/lib/purchases";

export async function checkReaderAccess(novelSlug: string): Promise<boolean> {
  const cookieStore = await cookies();
  const email = cookieStore.get("reader_email")?.value;
  const token = cookieStore.get("reader_token")?.value;

  if (!email || !token) return false;
  if (!verifyAccessToken(email, token)) return false;
  return await hasNovelAccess(email, novelSlug);
}
