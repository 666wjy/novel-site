import fs from "fs";
import { neon } from "@neondatabase/serverless";

for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim();
}

const sql = neon(process.env.DATABASE_URL);
const rows = await sql`select id, email, novel_slug, type, stripe_session_id from purchases order by created_at desc limit 10`;
console.log(rows);
