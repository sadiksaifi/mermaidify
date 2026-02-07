// Define your Drizzle schema tables here
// Example:
// export const users = pgTable("users", (t) => ({
//   id: t.uuid().defaultRandom().primaryKey(),
//   name: t.text().notNull(),
//   createdAt: t.timestamp("created_at").defaultNow().notNull(),
// }));

export { pgTable } from "drizzle-orm/pg-core";
