import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const reportsTable = pgTable("reports", {
  id: serial("id").primaryKey(),
  scamType: text("scam_type").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  description: text("description").notNull(),
  upvotes: integer("upvotes").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertReportSchema = createInsertSchema(reportsTable).omit({ id: true, upvotes: true, createdAt: true });
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reportsTable.$inferSelect;

export const scanStatsTable = pgTable("scan_stats", {
  id: serial("id").primaryKey(),
  totalScans: integer("total_scans").notNull().default(0),
  threatsBlocked: integer("threats_blocked").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
