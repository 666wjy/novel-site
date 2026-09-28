import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminLoggedIn } from "@/lib/admin-auth";
import { listRecentComments } from "@/lib/comments";
import { AdminCommentDeleteButton } from "@/app/admin/AdminCommentDeleteButton";

export default async function AdminIdeasPage() {
  if (!(await isAdminLoggedIn())) redirect("/admin/login");
  const comments = await listRecentComments(80);
  const ideas = comments.filter((c) => c.quoteText);
  const chapterTalk = comments.filter((c) => !c.quoteText);

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-ink-950">想法与讨论</h1>
      <p className="mt-1 text-sm text-ink-500">
        段内想法 {ideas.length} · 整章讨论 {chapterTalk.length}。不当内容可删除。
      </p>
      <ul className="mt-6 space-y-3">
        {comments.length === 0 && <p className="text-sm text-ink-500">暂无评论</p>}
        {comments.map((c) => (
          <li key={c.id} className="rounded-2xl border border-ink-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink-900">
                  {c.quoteText ? "想法" : "章评"} · {c.authorName}
                </p>
                <p className="mt-0.5 text-xs text-ink-400">
                  <Link href={`/novel/${c.novelSlug}/${c.chapterSlug}`} className="hover:text-[#07c160]">
                    {c.novelSlug} / {c.chapterSlug}
                  </Link>
                  {" · "}
                  {new Date(c.createdAt).toLocaleString("zh-CN")}
                </p>
                {c.quoteText && (
                  <p className="mt-2 border-l-2 border-[#07c160]/40 pl-2 text-xs italic text-ink-500">
                    {c.quoteText.slice(0, 180)}
                    {c.quoteText.length > 180 ? "…" : ""}
                  </p>
                )}
                <p className="mt-2 text-sm text-ink-800">{c.content}</p>
              </div>
              <AdminCommentDeleteButton id={c.id} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
