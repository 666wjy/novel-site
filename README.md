# 原创小说阅读站 · 部署指南

一个支持 **自有小说 + 前几章免费 + Paddle 付费解锁** 的海外阅读网站。

## 功能

- 首页展示全部小说
- 每本书前 N 章免费（默认 3 章，可在 `novels.json` 配置）
- 超出免费章节显示付费墙
- Paddle 支付：单本解锁 $2.99 / 全站订阅 $9.99 月
- PostgreSQL 数据库（Neon）存订单、小说、章节
- 简易管理后台 `/admin` 查看订单
- 内容可用 Markdown 管理，导入数据库后线上读取

> 数据库配置见 [DATABASE.md](./DATABASE.md)  
> 收款配置见 [PADDLE.md](./PADDLE.md)

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

复制 `.env.example` 为 `.env.local`，按 [PADDLE.md](./PADDLE.md) 填入 Live 密钥与 Price ID。

### 4. 启动开发服务器

```bash
npm run dev
```

打开 http://localhost:3000

## Paddle 配置

完整步骤见 [PADDLE.md](./PADDLE.md)。摘要：

1. 注册 [Paddle](https://www.paddle.com)，在 **Live** 创建单本 / 订阅价格
2. 复制 Price ID（`pri_...`）、API Key、Webhook Secret
3. Default payment link 指向站点 `/success`，配置 Webhook
4. 写入 `.env.local` / Netlify 并部署

支付成功后跳转 `/success`，Webhook 写入订单后自动解锁。

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

Paddle Dashboard → Developer tools → Notifications：

- URL: `https://yourdomain.com/api/webhook`
- Events: `transaction.completed`, `subscription.activated`
- 把 Endpoint secret 写入环境变量 `PADDLE_WEBHOOK_SECRET`

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

**Q: 不配置 Paddle 能看免费章吗？**  
A: 可以。前 3 章不依赖支付，只有付费章需要。

**Q: 购买记录存在哪？**  
A: 有 `DATABASE_URL` 时存 Neon `purchases` 表；否则本地 `data/purchases.json`。

**Q: 怎么改免费章节数？**  
A: 修改 `novels.json` 里该书的 `freeChapters` 字段（或后台改库）。

**Q: 怎么改价格？**  
A: 在 Paddle Catalog 改 Price，并更新站内 `priceLabel` 显示文字。

---

祝上架顺利。有问题可以继续问。
