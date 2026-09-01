# 原创小说阅读站 · 部署指南

一个支持 **自有小说 + 前几章免费 + Stripe 付费解锁** 的海外阅读网站。

## 功能

- 首页展示全部小说
- 每本书前 N 章免费（默认 3 章，可在 `novels.json` 配置）
- 超出免费章节显示付费墙
- Stripe 支付：单本解锁 $2.99 / 全站订阅 $9.99 月
- PostgreSQL 数据库（Neon）存订单、小说、章节
- 简易管理后台 `/admin` 查看订单
- 内容可用 Markdown 管理，导入数据库后线上读取

> 数据库配置见 [DATABASE.md](./DATABASE.md)

## 目录结构

```
novel-site/
├── content/
│   ├── novels.json              # 小说列表元数据
│   └── novels/
│       └── [slug]/
│           └── chapters/
│               ├── 01.md        # 章节 Markdown
│               └── 02.md
├── src/                         # Next.js 源码
├── data/                        # 购买记录（自动生成）
└── .env.local                   # 环境变量
```

## 本地运行

### 1. 安装 Node.js

下载安装：https://nodejs.org （LTS 版本）

### 2. 安装依赖

```bash
cd novel-site
npm install
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env.local`，填入 Stripe 密钥。

### 4. 启动开发服务器

```bash
npm run dev
```

打开 http://localhost:3000

## Stripe 配置步骤

1. 注册 [Stripe](https://stripe.com)（支持中国身份注册）
2. 进入 Dashboard → **Products**，创建两个产品：
   - **单本解锁** — 一次性 $2.99 → 复制 Price ID 到 `STRIPE_PRICE_NOVEL_UNLOCK`
   - **全站订阅** —  recurring $9.99/月 → 复制到 `STRIPE_PRICE_SUBSCRIPTION`
3. 复制 API Keys 到 `.env.local`
4. 本地测试 Webhook（可选）：
   ```bash
   stripe listen --forward-to localhost:3000/api/webhook
   ```
   把输出的 `whsec_...` 填入 `STRIPE_WEBHOOK_SECRET`

支付成功后会跳转到 `/success` 页面，自动解锁。

## 如何添加自己的小说

### 1. 在 `content/novels.json` 添加条目

```json
{
  "slug": "my-novel",
  "title": "我的小说",
  "author": "你的名字",
  "description": "简介...",
  "cover": "/covers/my-novel.jpg",
  "genre": ["玄幻", "连载中"],
  "status": "ongoing",
  "freeChapters": 3,
  "priceLabel": "$2.99",
  "updatedAt": "2026-08-24"
}
```

### 2. 创建章节目录

```
content/novels/my-novel/chapters/01.md
```

### 3. 章节 Markdown 格式

```markdown
---
slug: chapter-01
title: 第一章 标题
order: 1
summary: 章节摘要（可选）
---

正文内容...

段落之间空一行。
```

### 4. 用 AI 写小说

推荐流程：

1. 用 ChatGPT / Claude 生成**原创**大纲和章节（不要洗稿他人作品）
2. 复制到 `.md` 文件，按上面格式加 frontmatter
3. 自己润色一遍，确保连贯
4. 在 `novels.json` 注册即可上架

## 部署到国外（推荐 Vercel）

1. 把代码推到 GitHub
2. 登录 [vercel.com](https://vercel.com)，Import 项目
3. 在 Environment Variables 填入 `.env.local` 里的所有变量
4. `NEXT_PUBLIC_SITE_URL` 改为你的域名，如 `https://yourdomain.com`
5. Deploy

### 自定义域名

Vercel → Project → Settings → Domains → 添加域名  
在域名注册商处把 DNS 指向 Vercel。

### Stripe Webhook（生产环境）

Stripe Dashboard → Webhooks → Add endpoint：

- URL: `https://yourdomain.com/api/webhook`
- Events: `checkout.session.completed`
- 复制 Signing secret 到 Vercel 环境变量

## 其他部署选项

| 平台 | 特点 |
|------|------|
| **Vercel** | 免费额度、自动 HTTPS，最适合 Next.js |
| **Railway / Render** | 类似，支持自定义 |
| **VPS（Vultr / DigitalOcean）** | 完全控制，需自己配 Nginx + PM2 |

## AI 创作注意事项

- 故事必须是**原创**的，不要用 AI 改写他人小说
- 站点已标注「AI 辅助创作」，保持透明
- 你对发布内容负责
- 若目标读者在海外，可考虑后续加英文版

## 常见问题

**Q: 不配置 Stripe 能看免费章吗？**  
A: 可以。前 3 章不依赖 Stripe，只有付费章需要。

**Q: 购买记录存在哪？**  
A: 本地 `data/purchases.json`。生产环境建议后续换 SQLite 或 PostgreSQL。

**Q: 怎么改免费章节数？**  
A: 修改 `novels.json` 里该书的 `freeChapters` 字段。

**Q: 怎么改价格？**  
A: 在 Stripe Dashboard 改 Product 价格，并更新 `priceLabel` 显示文字。

---

祝上架顺利。有问题可以继续问。
