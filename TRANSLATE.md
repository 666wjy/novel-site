# 一键英译（后台）

把中文章节翻成英文并写入数据库，给海外读者看。

## 国内推荐：DeepSeek（能用）

Google Gemini 在国内网络常报 **User location is not supported**，本地开发请用 DeepSeek。

1. 打开 [DeepSeek API Keys](https://platform.deepseek.com/api_keys) 注册并创建密钥  
2. 本地 `.env.local` 增加：

```env
DEEPSEEK_API_KEY=sk-你的密钥
# 可选
# DEEPSEEK_MODEL=deepseek-chat
# TRANSLATE_PROVIDER=deepseek
```

3. **重启** `npm run dev`  
4. 后台打开小说 → **只译书目信息** / **一键全书英译**

有免费额度 / 很便宜，短篇一般够用。

## 海外可选：Gemini

```env
GEMINI_API_KEY=你的密钥
GEMINI_MODEL=gemini-3.6-flash
```

申请：https://aistudio.google.com/apikey  

若报 location not supported，仍请改用 DeepSeek。

## 其它 OpenAI 兼容接口

```env
TRANSLATE_PROVIDER=openai
TRANSLATE_BASE_URL=https://api.xxx.com/v1
TRANSLATE_API_KEY=sk-xxx
TRANSLATE_MODEL=gpt-4o-mini
```

## 优先级（TRANSLATE_PROVIDER=auto 时）

1. 有 `DEEPSEEK_API_KEY` → DeepSeek  
2. 有 `TRANSLATE_API_KEY` + `TRANSLATE_BASE_URL` → 兼容接口  
3. 有 `GEMINI_API_KEY` → Gemini  

## 注意

- 翻译会**覆盖**当前标题/正文；重要中文请先备份  
- 改 `.env.local` 后必须重启开发服务  
