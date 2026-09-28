import fs from "fs";
import { neon } from "@neondatabase/serverless";

for (const line of fs.readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim();
}

const sql = neon(process.env.DATABASE_URL);
const novels = await sql`select slug, title, author, description, genre from novels`;
console.log("NOVELS", JSON.stringify(novels, null, 2));
for (const n of novels) {
  const ch = await sql`
    select slug, title, "order", length(content) as len
    from chapters
    where novel_slug = ${n.slug}
    order by "order"
  `;
  console.log("CHAPTERS", n.slug, JSON.stringify(ch, null, 2));
}
