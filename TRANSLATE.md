# Gemini 免费英译（后台一键）

把中文章节翻成英文并写入数据库，给海外读者看。

## 1. 申请免费 Key（约 1 分钟）

1. 打开 [Google AI Studio](https://aistudio.google.com/apikey)
2. 用 Google 账号登录
3. **Create API key** → 复制

免费额度足够你这种短篇连载（有日请求上限，别一次翻几百章）。

## 2. 写入环境变量

本地 `.env.local`：

```env
GEMINI_API_KEY=你的密钥
# 可选，默认 gemini-2.5-flash
# GEMINI_MODEL=gemini-2.5-flash
```

Netlify：**Site settings → Environment variables** 同样加 `GEMINI_API_KEY`，然后重新部署。

## 3. 使用

1. 登录 `/admin`
2. 打开某本小说
3. 点 **一键全书英译**（或「只译书目信息」）
4. 单章也可点列表里的 **英译**

会**覆盖**当前标题/正文。重要中文请先自己备份或另开一本中文版。

## 注意

- 翻译质量接近机翻润色，重要作品建议再人工扫一眼
- 若报模型不可用，把 `GEMINI_MODEL` 改成 AI Studio 里当前免费模型名（如 `gemini-2.5-flash`）
