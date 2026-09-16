"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function UnlockBanner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const unlocked = searchParams.get("unlocked");
    if (unlocked === "1") {
      setMessage("解锁成功！请确保已用购买邮箱登录，即可阅读全部章节。");
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
