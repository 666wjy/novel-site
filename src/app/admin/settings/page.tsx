import { redirect } from "next/navigation";
import { isAdminLoggedIn } from "@/lib/admin-auth";
import { getSiteSettings } from "@/lib/site-settings";
import { SettingsForm } from "@/app/admin/SettingsForm";

export default async function AdminSettingsPage() {
  if (!(await isAdminLoggedIn())) redirect("/admin/login");
  const settings = await getSiteSettings();

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-ink-950">站点设置</h1>
      <p className="mt-1 text-sm text-ink-500">
        站名、试读章数、发现页推荐。保存后前台立即按新配置显示。
      </p>
      <div className="mt-6">
        <SettingsForm initial={settings} />
      </div>
    </div>
  );
}
