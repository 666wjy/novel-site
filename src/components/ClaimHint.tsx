import Link from "next/link";

export function ClaimHint({ email }: { email: string }) {
  return (
    <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      检测到旧的解锁邮箱 {email}。请用该邮箱{" "}
      <Link
        href={`/register?email=${encodeURIComponent(email)}&next=/library`}
        className="font-medium underline"
      >
        注册
      </Link>
      {" "}或{" "}
      <Link
        href={`/login?email=${encodeURIComponent(email)}&next=/library`}
        className="font-medium underline"
      >
        登录
      </Link>
      ，即可找回已购作品。
    </div>
  );
}
