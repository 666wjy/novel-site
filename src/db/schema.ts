import {
  pgTable,
  text,
  timestamp,
  integer,
  jsonb,
  pgEnum,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const purchaseTypeEnum = pgEnum("purchase_type", ["novel_unlock", "subscription"]);
export const novelStatusEnum = pgEnum("novel_status", ["ongoing", "completed"]);

export const purchases = pgTable(
  "purchases",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    novelSlug: text("novel_slug"),
    type: purchaseTypeEnum("type").notNull(),
    stripeSessionId: text("stripe_session_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
  },
  (table) => [uniqueIndex("purchases_stripe_session_idx").on(table.stripeSessionId)]
);

export const novels = pgTable("novels", {
  slug: text("slug").primaryKey(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  description: text("description").notNull(),
  cover: text("cover").notNull(),
  genre: jsonb("genre").$type<string[]>().notNull(),
  status: novelStatusEnum("status").notNull(),
  freeChapters: integer("free_chapters").notNull(),
  priceLabel: text("price_label").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

export const chapters = pgTable(
  "chapters",
  {
    id: text("id").primaryKey(),
    novelSlug: text("novel_slug")
      .notNull()
      .references(() => novels.slug, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    order: integer("order").notNull(),
    summary: text("summary"),
    content: text("content").notNull(),
  },
  (table) => [uniqueIndex("chapters_novel_slug_idx").on(table.novelSlug, table.slug)]
);

export const comments = pgTable("comments", {
  id: text("id").primaryKey(),
  novelSlug: text("novel_slug")
    .notNull()
    .references(() => novels.slug, { onDelete: "cascade" }),
  chapterSlug: text("chapter_slug").notNull(),
  authorName: text("author_name").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
