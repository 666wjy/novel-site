import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";
import { hasNovelAccess } from "@/lib/purchases";

export async function checkReaderAccess(novelSlug: string): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;
  return await hasNovelAccess(session.email, novelSlug);
}

export async function getLegacyReaderEmail(): Promise<string | null> {
  const session = await getSession();
  if (session) return null;
  const store = await cookies();
  const email = store.get("reader_email")?.value;
  return email ? decodeURIComponent(email).toLowerCase().trim() : null;
}
