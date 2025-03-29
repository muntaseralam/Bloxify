import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  gameCompleted: boolean("game_completed").default(false).notNull(),
  adsWatched: integer("ads_watched").default(0).notNull(),
  token: text("token"),
  isTokenRedeemed: boolean("is_token_redeemed").default(false),
  lastQuestCompletedAt: timestamp("last_quest_completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
});

export const updateUserSchema = createInsertSchema(users).pick({
  gameCompleted: true,
  adsWatched: true,
  token: true,
  isTokenRedeemed: true,
  lastQuestCompletedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type User = typeof users.$inferSelect;
