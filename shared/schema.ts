import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define user roles
export type UserRole = "user" | "admin" | "owner";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").default("user").notNull(),
  gameCompleted: boolean("game_completed").default(false).notNull(),
  adsWatched: integer("ads_watched").default(0).notNull(),
  tokenCount: integer("token_count").default(0).notNull(), // Website token balance
  inGameTokenBalance: integer("in_game_token_balance").default(0).notNull(), // Roblox game token balance  
  token: text("token"),
  isTokenRedeemed: boolean("is_token_redeemed").default(false),
  lastQuestCompletedAt: timestamp("last_quest_completed_at"),
  dailyQuestCount: integer("daily_quest_count").default(0),
  isVIP: boolean("is_vip").default(false),
  vipExpiresAt: timestamp("vip_expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  // Referral system fields
  robloxUserId: integer("roblox_user_id").unique(), // Store Roblox UserId for referral tracking
  referralCode: text("referral_code").unique(), // Unique referral code for this user
  referredBy: text("referred_by"), // Referral code of the user who invited them
});

// Referral tracking table
export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  inviterUserId: integer("inviter_user_id").notNull(), // Roblox UserId of the inviter
  inviteeUserId: integer("invitee_user_id").notNull(), // Roblox UserId of the invited player
  inviterUsername: text("inviter_username").notNull(), // Username of inviter for easy lookup
  inviteeUsername: text("invitee_username").notNull(), // Username of invitee for easy lookup
  totalTokensEarnedByInvitee: integer("total_tokens_earned_by_invitee").default(0).notNull(),
  regularPaymentMade: boolean("regular_payment_made").default(false).notNull(), // Has 1 token been paid when invitee redeemed 10 tokens?
  vipTokensPaidOut: integer("vip_tokens_paid_out").default(0).notNull(), // How many VIP tokens have been paid out
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Redemption codes table for Roblox integration
export const redemptionCodes = pgTable("redemption_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(), // The redemption code (e.g., "BLUX-R5DE-CKEJ-OK8V")
  tokens: integer("tokens").notNull(), // Amount of tokens this code is worth
  createdBy: text("created_by").notNull(), // Username of the user who generated this code
  createdByRobloxId: integer("created_by_roblox_id"), // Roblox UserId of the creator (for balance transfer)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  redeemedBy: integer("redeemed_by"), // Roblox UserId of the user who redeemed this code
  redeemedAt: timestamp("redeemed_at"), // When the code was redeemed
  isRedeemed: boolean("is_redeemed").default(false).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
}).extend({
  role: z.enum(["user", "admin", "owner"]).default("user"),
});

export const updateUserSchema = createInsertSchema(users).pick({
  role: true,
  gameCompleted: true,
  adsWatched: true,
  tokenCount: true,
  inGameTokenBalance: true,
  token: true,
  isTokenRedeemed: true,
  lastQuestCompletedAt: true,
  dailyQuestCount: true,
  isVIP: true,
  vipExpiresAt: true,
  robloxUserId: true,
  referralCode: true,
  referredBy: true,
});

// Referral schema
export const insertReferralSchema = createInsertSchema(referrals).pick({
  inviterUserId: true,
  inviteeUserId: true,
  inviterUsername: true,
  inviteeUsername: true,
});

export const updateReferralSchema = createInsertSchema(referrals).pick({
  totalTokensEarnedByInvitee: true,
  regularPaymentMade: true,
  vipTokensPaidOut: true,
});

export const insertRedemptionCodeSchema = createInsertSchema(redemptionCodes).pick({
  code: true,
  tokens: true,
  createdBy: true,
}).extend({
  createdByRobloxId: createInsertSchema(redemptionCodes).shape.createdByRobloxId.optional(),
});

export const updateRedemptionCodeSchema = createInsertSchema(redemptionCodes).pick({
  redeemedBy: true,
  redeemedAt: true,
  isRedeemed: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type UpdateReferral = z.infer<typeof updateReferralSchema>;
export type Referral = typeof referrals.$inferSelect;
export type InsertRedemptionCode = z.infer<typeof insertRedemptionCodeSchema>;
export type UpdateRedemptionCode = z.infer<typeof updateRedemptionCodeSchema>;
export type RedemptionCode = typeof redemptionCodes.$inferSelect;
