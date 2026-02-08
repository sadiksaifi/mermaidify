import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  integer,
  uniqueIndex,
  foreignKey,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Items — stores both files and folders in a single adjacency-list table
// ---------------------------------------------------------------------------
export const items = pgTable(
  "items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    parentId: uuid("parent_id"),
    name: text("name").notNull(),
    isFolder: boolean("is_folder").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
    }).onDelete("cascade"),

    uniqueIndex("unique_name_in_folder").on(
      table.userId,
      table.parentId,
      table.name
    ),
  ]
);

// ---------------------------------------------------------------------------
// File Contents — current mermaid diagram text (separated for perf)
// ---------------------------------------------------------------------------
export const fileContents = pgTable("file_contents", {
  id: uuid("id").primaryKey().defaultRandom(),
  itemId: uuid("item_id")
    .notNull()
    .references(() => items.id, { onDelete: "cascade" })
    .unique(),
  content: text("content").notNull().default(""),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// File Versions — version history for content
// ---------------------------------------------------------------------------
export const fileVersions = pgTable("file_versions", {
  id: uuid("id").primaryKey().defaultRandom(),
  itemId: uuid("item_id")
    .notNull()
    .references(() => items.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  version: integer("version").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// User Preferences — single JSONB column for all settings
// ---------------------------------------------------------------------------
export const userPreferences = pgTable("user_preferences", {
  userId: uuid("user_id").primaryKey(),
  preferences: jsonb("preferences").notNull().default({}),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------
export const itemsRelations = relations(items, ({ one, many }) => ({
  parent: one(items, {
    fields: [items.parentId],
    references: [items.id],
    relationName: "children",
  }),
  children: many(items, { relationName: "children" }),
  content: one(fileContents, {
    fields: [items.id],
    references: [fileContents.itemId],
  }),
  versions: many(fileVersions),
}));

export const fileContentsRelations = relations(fileContents, ({ one }) => ({
  item: one(items, { fields: [fileContents.itemId], references: [items.id] }),
}));

export const fileVersionsRelations = relations(fileVersions, ({ one }) => ({
  item: one(items, { fields: [fileVersions.itemId], references: [items.id] }),
}));
