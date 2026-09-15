# Paddle 收款配置（Live 正式环境）

读者付款 → Paddle（代收款）→ 你的结算账户 → PayPal / 银行 → 再转到 Payoneer / 工行。

网站代码已改为 **Paddle Billing**，不再用 Stripe / Lemon Squeezy。

---

## 第 1 步：确认在 Live

Dashboard 顶部应显示 **You're in Live**（不要 Switch to Sandbox）。

若弹出 “first integration / sandbox”，**不要**选进沙盒；留在 Live，直接建产品和密钥。

---

## 第 2 步：创建产品与价格

左侧 **Catalog → Products → New product**

### A. 单本解锁

- Name: `Unlock one novel`
- Price: **$2.99 USD** · **One-time**
- 创建后复制 **Price ID**（形如 `pri_...`）→ `PADDLE_PRICE_NOVEL_UNLOCK`

### B. 全站订阅

- Name: `StoryForge monthly`
- Price: **$9.99 USD** · **Recurring · Monthly**
- 复制 **Price ID** → `PADDLE_PRICE_SUBSCRIPTION`

---

## 第 3 步：结账域名 / 默认支付页

**Checkout → Checkout settings**

1. **Default payment link** 必须填结账页（不是 success）：

```text
https://incredible-youtiao-87a037.netlify.app/checkout
```

2. 若要求 **Approved domains**，添加：

```text
incredible-youtiao-87a037.netlify.app
```

保存并等待审核通过。

3. **Client-side token**（打开付款弹窗需要）  
   Developer tools → Authentication → **Client-side tokens** → 创建 Live token（`live_...`）  
   → 环境变量 `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`

---

## 第 4 步：API Key

**Developer tools → Authentication**（或 API keys）

- 创建 **Live** API key  
- 权限至少包含 Transactions、Customers  
- 复制 → `PADDLE_API_KEY`（`pdl_live_...`）

---

## 第 5 步：Webhook（Notifications）

**Developer tools → Notifications → New destination**

- URL:

```text
https://incredible-youtiao-87a037.netlify.app/api/webhook
```

- 事件至少勾选：
  - `transaction.completed`
  - `subscription.activated`（若有）
  - `subscription.created`（若有）

- 复制 **Endpoint secret** → `PADDLE_WEBHOOK_SECRET`

---

## 第 6 步：环境变量

### 本地 `.env.local` / Netlify

```env
PADDLE_API_KEY=pdl_live_...
PADDLE_PRICE_NOVEL_UNLOCK=pri_...
PADDLE_PRICE_SUBSCRIPTION=pri_...
PADDLE_WEBHOOK_SECRET=pdl_ntfsec_...
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=live_...
NEXT_PUBLIC_SITE_URL=https://incredible-youtiao-87a037.netlify.app
```

Netlify 改完后 **Trigger deploy**。可删除旧的 `LEMONSQUEEZY_*` / `STRIPE_*`。

---

## 第 7 步：结算账户（Payout）

在 Paddle 里绑定收款方式（按后台提示：银行 / 其它）。  
中国个人按 Paddle 要求如实填写；钱到账后再转到 Payoneer / 工行。

---

## 测试

1. VPN 打开站点 → 第 4 章 → 输入邮箱 → 应跳转 Paddle 结账  
2. 小额实付一笔，确认回到 `/success` 并解锁  

---

## Checklist

- [ ] Live 模式（非 Sandbox）
- [ ] 两个 Price ID（单本 + 月付订阅）
- [ ] Default payment link + 域名批准
- [ ] Live API Key
- [ ] Webhook + Secret
- [ ] Netlify 环境变量并重新部署
- [ ] 实付测试解锁
- [ ] 绑定结算账户
