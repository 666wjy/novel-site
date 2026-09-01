"use client";

export function AdminLogoutButton() {
  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-lg border border-ink-200 px-4 py-2 text-sm transition hover:bg-ink-50"
    >
      退出登录
    </button>
  );
}
