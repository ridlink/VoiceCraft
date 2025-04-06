import { pgTable, text, serial, integer, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  avatar: text("avatar"),
  apiKey: text("api_key"),
  role: text("role").default("user"),
  totalGenerations: integer("total_generations").default(0),
  monthlyQuota: integer("monthly_quota").default(100),
  createdAt: timestamp("created_at").defaultNow(),
  lastLoginAt: timestamp("last_login_at"),
});

export const usersRelations = relations(users, ({ many }) => ({
  audioGenerations: many(audioGenerations),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  fullName: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Voice model - represents available voices from Eleven Labs
export const voices = pgTable("voices", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  language: text("language"),
  category: text("category"),
  premium: boolean("premium").default(false),
});

export const insertVoiceSchema = createInsertSchema(voices);
export type InsertVoice = z.infer<typeof insertVoiceSchema>;
export type Voice = typeof voices.$inferSelect;

// Audio Generation model - represents audio generations by users
export const audioGenerations = pgTable("audio_generations", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  voiceId: text("voice_id").notNull(),
  voiceName: text("voice_name"),
  stability: integer("stability").default(50),
  clarity: integer("clarity").default(70),
  audioUrl: text("audio_url"),
  format: text("format").default("mp3"),
  duration: integer("duration"),
  downloadCount: integer("download_count").default(0),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const audioGenerationsRelations = relations(audioGenerations, ({ one }) => ({
  user: one(users, {
    fields: [audioGenerations.userId],
    references: [users.id],
  }),
  voice: one(voices, {
    fields: [audioGenerations.voiceId],
    references: [voices.id],
  }),
}));

export const insertAudioGenerationSchema = createInsertSchema(audioGenerations).omit({
  id: true,
  createdAt: true,
  downloadCount: true,
});

export type InsertAudioGeneration = z.infer<typeof insertAudioGenerationSchema>;
export type AudioGeneration = typeof audioGenerations.$inferSelect;

// Schema for text-to-speech generation request
export const ttsRequestSchema = z.object({
  text: z.string().min(1).max(5000),
  voiceId: z.string(),
  stability: z.number().min(0).max(100).default(50),
  clarity: z.number().min(0).max(100).default(70),
});

export type TtsRequest = z.infer<typeof ttsRequestSchema>;

// User Statistics
export const userStats = pgTable("user_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  date: date("date").notNull(),
  generationCount: integer("generation_count").default(0),
  characterCount: integer("character_count").default(0),
  audioDuration: integer("audio_duration").default(0), // in seconds
});

export const userStatsRelations = relations(userStats, ({ one }) => ({
  user: one(users, {
    fields: [userStats.userId],
    references: [users.id],
  }),
}));

export const insertUserStatsSchema = createInsertSchema(userStats).omit({
  id: true,
});

export type InsertUserStats = z.infer<typeof insertUserStatsSchema>;
export type UserStats = typeof userStats.$inferSelect;

// Popular Voices Statistics
export const voiceStats = pgTable("voice_stats", {
  id: serial("id").primaryKey(),
  voiceId: text("voice_id").references(() => voices.id).notNull(),
  useCount: integer("use_count").default(0),
  averageRating: integer("average_rating"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const voiceStatsRelations = relations(voiceStats, ({ one }) => ({
  voice: one(voices, {
    fields: [voiceStats.voiceId],
    references: [voices.id],
  }),
}));

export type VoiceStats = typeof voiceStats.$inferSelect;
