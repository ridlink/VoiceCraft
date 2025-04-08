import { db, pool } from "./db";
import { eq, desc, and } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import session from "express-session";
import { 
  users, type User, type InsertUser,
  voices, type Voice, type InsertVoice,
  audioGenerations, type AudioGeneration, type InsertAudioGeneration,
  userStats, type UserStats, type InsertUserStats,
  voiceStats, type VoiceStats
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStats(userId: number, charactersGenerated: number, durationSeconds: number): Promise<void>;
  
  // Voice methods
  saveVoices(voices: InsertVoice[]): Promise<void>;
  getVoices(): Promise<Voice[]>;
  getVoice(id: string): Promise<Voice | undefined>;
  updateVoiceStats(voiceId: string): Promise<void>;
  getPopularVoices(limit?: number): Promise<Voice[]>;
  
  // Audio generation methods
  saveAudioGeneration(generation: InsertAudioGeneration): Promise<AudioGeneration>;
  getRecentAudioGenerations(limit?: number): Promise<AudioGeneration[]>;
  getUserAudioGenerations(userId: number, limit?: number): Promise<AudioGeneration[]>;
  getAudioGeneration(id: number): Promise<AudioGeneration | undefined>;
  updateAudioGenerationDownloadCount(id: number): Promise<void>;
  deleteAudioGeneration(id: number): Promise<void>;
  
  // Session store for authentication
  sessionStore: session.Store;
}

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool,
      createTableIfMissing: true
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const [user] = await db.insert(users).values(insertUser).returning();
      return user;
    } catch (error) {
      console.error("Database error creating user:", error);
      throw new Error("Failed to create user in database");
    }
  }

  async updateUserStats(userId: number, charactersGenerated: number, durationSeconds: number): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    
    // Check if a stat record exists for today
    const [existingStat] = await db.select()
      .from(userStats)
      .where(
        and(
          eq(userStats.userId, userId),
          eq(userStats.date, todayStr)
        )
      );
    
    if (existingStat) {
      // Update existing stats
      await db.update(userStats)
        .set({
          generationCount: (existingStat.generationCount || 0) + 1,
          characterCount: (existingStat.characterCount || 0) + charactersGenerated,
          audioDuration: (existingStat.audioDuration || 0) + durationSeconds
        })
        .where(eq(userStats.id, existingStat.id));
    } else {
      // Create new stats record
      await db.insert(userStats).values({
        userId,
        date: todayStr,
        generationCount: 1,
        characterCount: charactersGenerated,
        audioDuration: durationSeconds
      });
    }
    
    // Update user total generations
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (user) {
      await db.update(users)
        .set({ totalGenerations: (user.totalGenerations || 0) + 1 })
        .where(eq(users.id, userId));
    }
  }

  async saveVoices(voicesData: InsertVoice[]): Promise<void> {
    for (const voice of voicesData) {
      try {
        // Check if voice exists
        const [existingVoice] = await db.select().from(voices).where(eq(voices.id, voice.id));
        
        // Prepare a basic voice object with the essential fields
        const baseVoiceData = {
          id: voice.id,
          name: voice.name,
          description: voice.description,
          language: voice.language,
          category: voice.category,
          premium: voice.premium
        };
        
        if (!existingVoice) {
          // Insert new voice with minimal fields (compatible with existing schema)
          await db.insert(voices).values(baseVoiceData);
          
          // Initialize voice stats with only the essential fields
          try {
            await db.insert(voiceStats).values({
              voiceId: voice.id,
              useCount: 0
            });
          } catch (statsError) {
            console.error(`Error initializing voice stats for ${voice.id}:`, statsError);
          }
        } else {
          // Update existing voice with minimal fields
          await db.update(voices)
            .set(baseVoiceData)
            .where(eq(voices.id, voice.id));
        }
      } catch (error) {
        console.error(`Error saving voice ${voice.id}:`, error);
      }
    }
  }

  async getVoices(): Promise<Voice[]> {
    return db.select().from(voices);
  }

  async getVoice(id: string): Promise<Voice | undefined> {
    const [voice] = await db.select().from(voices).where(eq(voices.id, id));
    return voice;
  }

  async updateVoiceStats(voiceId: string): Promise<void> {
    try {
      const [existingStat] = await db.select().from(voiceStats).where(eq(voiceStats.voiceId, voiceId));
      
      if (existingStat) {
        // Only update the useCount which we know exists
        await db.update(voiceStats)
          .set({ 
            useCount: (existingStat.useCount || 0) + 1
          })
          .where(eq(voiceStats.voiceId, voiceId));
      } else {
        // Insert with only essential fields
        await db.insert(voiceStats).values({
          voiceId,
          useCount: 1
        });
      }
    } catch (error) {
      console.error(`Error updating voice stats for ${voiceId}:`, error);
      // We already tried with minimal fields, so just log the error
    }
  }

  async getPopularVoices(limit: number = 5): Promise<any[]> {
    // Join voices with voiceStats and order by useCount
    // Only select fields that exist in the current database
    const result = await db.select({
      id: voices.id,
      name: voices.name,
      description: voices.description,
      language: voices.language,
      category: voices.category,
      premium: voices.premium
    })
    .from(voices)
    .leftJoin(voiceStats, eq(voices.id, voiceStats.voiceId))
    .orderBy(desc(voiceStats.useCount))
    .limit(limit);
    
    return result;
  }

  async saveAudioGeneration(generation: InsertAudioGeneration): Promise<AudioGeneration> {
    const [savedGeneration] = await db.insert(audioGenerations)
      .values(generation)
      .returning();
    
    // Update stats if userId is provided
    if (generation.userId) {
      await this.updateUserStats(
        generation.userId, 
        generation.text.length, 
        generation.duration || 0
      );
      
      // Update voice stats
      await this.updateVoiceStats(generation.voiceId);
    }
    
    return savedGeneration;
  }

  async getRecentAudioGenerations(limit: number = 10): Promise<AudioGeneration[]> {
    return db.select()
      .from(audioGenerations)
      .orderBy(desc(audioGenerations.createdAt))
      .limit(limit);
  }

  async getUserAudioGenerations(userId: number, limit: number = 10): Promise<AudioGeneration[]> {
    return db.select()
      .from(audioGenerations)
      .where(eq(audioGenerations.userId, userId))
      .orderBy(desc(audioGenerations.createdAt))
      .limit(limit);
  }

  async getAudioGeneration(id: number): Promise<AudioGeneration | undefined> {
    const [generation] = await db.select()
      .from(audioGenerations)
      .where(eq(audioGenerations.id, id));
    
    return generation;
  }

  async updateAudioGenerationDownloadCount(id: number): Promise<void> {
    const [generation] = await db.select()
      .from(audioGenerations)
      .where(eq(audioGenerations.id, id));
    
    if (generation) {
      await db.update(audioGenerations)
        .set({ downloadCount: (generation.downloadCount || 0) + 1 })
        .where(eq(audioGenerations.id, id));
    }
  }
  
  async deleteAudioGeneration(id: number): Promise<void> {
    await db.delete(audioGenerations)
      .where(eq(audioGenerations.id, id));
  }
}

export const storage = new DatabaseStorage();
