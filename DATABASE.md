# 数据库配置指南

项目使用 **Neon PostgreSQL**（免费）存储**小说、章节、订单**。

> 配好 `DATABASE_URL` 后，网站从数据库读小说，不再读 Markdown 文件。

## 一、注册 Neon 并获取连接串

1. 打开 https://neon.tech 注册
2. **Create a project**
3. 复制 **Connection string**：
   ```
   postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require
   ```

## 二、本地配置

`.env.local`：

```
DATABASE_URL=你的连接串
ADMIN_PASSWORD=后台密码
ACCESS_TOKEN_SECRET=随机长字符串
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

建表 + 导入现有示例小说：

```bash
npm run db:push
npm run db:seed
```

## 三、在后台直接管理小说（推荐）

1. 打开 http://localhost:3000/admin/login
2. 登录后点 **+ 添加小说**
3. 填书名、作者、简介等 → **创建小说**
4. 进入小说管理页 → **+ 添加章节** → 写正文 → 保存

**所有内容直接写入 PostgreSQL**，前台立刻可读。

## 四、Netlify 生产环境

Environment variables 添加：

| 变量 | 说明 |
|------|------|
| `DATABASE_URL` | Neon 连接串 |
| `ADMIN_PASSWORD` | 后台密码 |
| `ACCESS_TOKEN_SECRET` | 读者 token 签名 |
| `NEXT_PUBLIC_SITE_URL` | 站点 URL |

部署后访问：`https://你的域名/admin/login`

## 五、数据表

| 表 | 存什么 |
|----|--------|
| `novels` | 书名、作者、简介、免费章数、价格 |
| `chapters` | 章节标题、序号、**正文** |
| `purchases` | Stripe 订单 |

## 六、两种添加小说方式

| 方式 | 适合 |
|------|------|
| **后台网页** `/admin` | 日常更新，直接写进数据库 |
| **seed 脚本** `npm run db:seed` | 一次性把 `content/` 里 Markdown 导入库 |

## 七、未配数据库时

没设 `DATABASE_URL` 时，网站仍从 `content/` Markdown 读（仅适合本地开发）。

**线上务必配 DATABASE_URL，小说才持久存在。**
