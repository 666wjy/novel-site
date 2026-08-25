"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function UnlockBanner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const unlocked = searchParams.get("unlocked");
    const email = searchParams.get("email");
    const token = searchParams.get("token");

    if (unlocked === "1" && email && token) {
      document.cookie = `reader_email=${encodeURIComponent(email)}; path=/; max-age=31536000; SameSite=Lax`;
      document.cookie = `reader_token=${token}; path=/; max-age=31536000; SameSite=Lax`;
      setMessage("解锁成功！现在可以阅读全部章节了。");
      router.replace(window.location.pathname);
    }
  }, [searchParams, router]);

  if (!message) return null;

  return (
    <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
      {message}
    </div>
  );
}

export function getReaderCookies(): { email?: string; token?: string } {
  if (typeof document === "undefined") return {};
  const cookies = document.cookie.split(";").reduce<Record<string, string>>((acc, c) => {
    const [k, v] = c.trim().split("=");
    acc[k] = decodeURIComponent(v);
    return acc;
  }, {});
  return { email: cookies.reader_email, token: cookies.reader_token };
}
