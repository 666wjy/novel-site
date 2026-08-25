"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [novelSlug, setNovelSlug] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      setStatus("error");
      return;
    }

    fetch(`/api/verify-session?session_id=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setStatus("error");
          return;
        }
        document.cookie = `reader_email=${encodeURIComponent(data.email)}; path=/; max-age=31536000; SameSite=Lax`;
        document.cookie = `reader_token=${data.token}; path=/; max-age=31536000; SameSite=Lax`;
        setNovelSlug(data.novelSlug);
        setStatus("ok");
        setTimeout(() => {
          router.push(data.novelSlug ? `/novel/${data.novelSlug}` : "/");
        }, 2000);
      })
      .catch(() => setStatus("error"));
  }, [searchParams, router]);

  return (
    <div className="py-20 text-center">
      {status === "loading" && (
        <>
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-accent border-t-transparent" />
          <p className="mt-4 text-ink-600">正在确认支付...</p>
        </>
      )}
      {status === "ok" && (
        <>
          <p className="text-4xl">🎉</p>
          <h1 className="mt-4 font-serif text-2xl font-bold text-ink-950">解锁成功！</h1>
          <p className="mt-2 text-ink-600">正在跳转，请稍候...</p>
          {novelSlug && (
            <Link href={`/novel/${novelSlug}`} className="mt-4 inline-block text-accent hover:underline">
              立即阅读 →
            </Link>
          )}
        </>
      )}
      {status === "error" && (
        <>
          <h1 className="font-serif text-2xl font-bold text-ink-950">验证失败</h1>
          <p className="mt-2 text-ink-600">请联系客服，或稍后重试</p>
          <Link href="/" className="mt-4 inline-block text-accent hover:underline">
            返回首页
          </Link>
        </>
      )}
    </div>
  );
}
