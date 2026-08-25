import { siteConfig } from "@/lib/site-config";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl prose prose-ink">
      <h1 className="font-serif text-3xl font-bold text-ink-950">关于本站</h1>

      <p className="mt-4 leading-relaxed text-ink-700">
        {siteConfig.siteName} 是一个原创小说阅读平台。所有作品由作者本人创作，
        使用 AI 辅助生成大纲、润色文字，版权归属作者。
      </p>

      <h2 className="mt-8 font-serif text-xl font-bold">阅读方式</h2>
      <ul className="mt-3 space-y-2 text-ink-700">
        <li>每本书前 3 章免费试读</li>
        <li>喜欢可单本解锁（$2.99）或订阅全站（$9.99/月）</li>
        <li>支付完成后自动解锁，同一邮箱永久有效</li>
      </ul>

      <h2 className="mt-8 font-serif text-xl font-bold">作者上传</h2>
      <p className="mt-3 text-ink-700">
        在 <code className="rounded bg-ink-100 px-1.5 py-0.5 text-sm">content/novels/</code>{" "}
        目录下按示例格式添加 Markdown 章节文件即可上架新书。
      </p>

      <h2 className="mt-8 font-serif text-xl font-bold">AI 创作说明</h2>
      <p className="mt-3 text-ink-700">
        你可以用 ChatGPT、Claude 等工具辅助写小说，但请确保：
      </p>
      <ul className="mt-3 space-y-2 text-ink-700">
        <li>故事是原创的，不要洗稿或抄袭他人作品</li>
        <li>在站点上标注「AI 辅助创作」</li>
        <li>你对最终发布的内容负责</li>
      </ul>
    </div>
  );
}

export const metadata = {
  title: `关于 · ${siteConfig.siteName}`,
};
