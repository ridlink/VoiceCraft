import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
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
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAudioGenerationSchema = createInsertSchema(audioGenerations).omit({
  id: true,
  createdAt: true,
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
