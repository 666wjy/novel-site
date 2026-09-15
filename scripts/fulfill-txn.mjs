import fs from "fs";
import crypto from "crypto";
import { neon } from "@neondatabase/serverless";

for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim();
}

const txnId = process.argv[2] || "txn_01m2hnt87g4c0xkm174yzw7sda";
const sql = neon(process.env.DATABASE_URL);

const paddleRes = await fetch(`https://api.paddle.com/transactions/${txnId}`, {
  headers: {
    Authorization: `Bearer ${process.env.PADDLE_API_KEY}`,
    "Paddle-Version": "1",
  },
});
const paddleJson = await paddleRes.json();
if (!paddleRes.ok || !paddleJson.data) {
  console.error("Paddle error", paddleRes.status, paddleJson);
  process.exit(1);
}

const data = paddleJson.data;
const custom = data.custom_data || {};
const email = String(custom.email || "").toLowerCase().trim();
const type = custom.type;
const novelSlug = custom.novelSlug || null;

console.log({ status: data.status, email, type, novelSlug });

if (!(data.status === "completed" || data.status === "paid") || !email || !type) {
  console.error("Cannot fulfill — missing status/email/type");
  process.exit(1);
}

const existing = await sql`
  SELECT id, email, novel_slug, type, stripe_session_id
  FROM purchases
  WHERE stripe_session_id = ${txnId}
`;

if (existing.length) {
  console.log("Already in DB:", existing[0]);
} else {
  const id = crypto.randomUUID();
  await sql`
    INSERT INTO purchases (id, email, novel_slug, type, stripe_session_id, created_at)
    VALUES (${id}, ${email}, ${novelSlug}, ${type}, ${txnId}, now())
  `;
  console.log("Inserted purchase", id);
}

const token = crypto
  .createHmac("sha256", process.env.ACCESS_TOKEN_SECRET || "dev-secret-change-me")
  .update(email)
  .digest("hex");

const site = process.env.NEXT_PUBLIC_SITE_URL || "https://incredible-youtiao-87a037.netlify.app";
const params = new URLSearchParams({
  txn: txnId,
  email,
  type,
  ...(novelSlug ? { novel: novelSlug } : {}),
});

console.log("\nOpen this URL (sets login cookies):");
console.log(`${site}/success?${params.toString()}`);
console.log("\nOr open novel after visiting success:");
console.log(`${site}/novel/${novelSlug}`);
console.log("\nreader_email=", email);
console.log("reader_token=", token);
