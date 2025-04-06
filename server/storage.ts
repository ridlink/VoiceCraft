import { 
  users, type User, type InsertUser,
  voices, type Voice, type InsertVoice,
  audioGenerations, type AudioGeneration, type InsertAudioGeneration
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Voice methods
  saveVoices(voices: InsertVoice[]): Promise<void>;
  getVoices(): Promise<Voice[]>;
  getVoice(id: string): Promise<Voice | undefined>;
  
  // Audio generation methods
  saveAudioGeneration(generation: InsertAudioGeneration): Promise<AudioGeneration>;
  getRecentAudioGenerations(limit?: number): Promise<AudioGeneration[]>;
  getAudioGeneration(id: number): Promise<AudioGeneration | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private voicesMap: Map<string, Voice>;
  private audioGenerationsMap: Map<number, AudioGeneration>;
  private userCurrentId: number;
  private audioGenCurrentId: number;

  constructor() {
    this.users = new Map();
    this.voicesMap = new Map();
    this.audioGenerationsMap = new Map();
    this.userCurrentId = 1;
    this.audioGenCurrentId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Voice methods
  async saveVoices(insertVoices: InsertVoice[]): Promise<void> {
    for (const insertVoice of insertVoices) {
      const voice: Voice = { ...insertVoice };
      this.voicesMap.set(voice.id, voice);
    }
  }

  async getVoices(): Promise<Voice[]> {
    return Array.from(this.voicesMap.values());
  }

  async getVoice(id: string): Promise<Voice | undefined> {
    return this.voicesMap.get(id);
  }

  // Audio generation methods
  async saveAudioGeneration(insertGeneration: InsertAudioGeneration): Promise<AudioGeneration> {
    const id = this.audioGenCurrentId++;
    const now = new Date();
    const generation: AudioGeneration = { 
      ...insertGeneration, 
      id,
      createdAt: now
    };
    this.audioGenerationsMap.set(id, generation);
    return generation;
  }

  async getRecentAudioGenerations(limit: number = 10): Promise<AudioGeneration[]> {
    return Array.from(this.audioGenerationsMap.values())
      .sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt.getTime() - a.createdAt.getTime();
      })
      .slice(0, limit);
  }

  async getAudioGeneration(id: number): Promise<AudioGeneration | undefined> {
    return this.audioGenerationsMap.get(id);
  }
}

export const storage = new MemStorage();
