import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <h1 className="font-serif text-4xl font-bold text-ink-950">404</h1>
      <p className="mt-4 text-ink-600">页面不存在</p>
      <Link href="/" className="mt-6 inline-block text-accent hover:underline">
        返回首页
      </Link>
    </div>
  );
}
