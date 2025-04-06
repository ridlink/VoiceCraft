import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import axios from "axios";
import { ttsRequestSchema } from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

const ELEVEN_LABS_API_KEY = process.env.ELEVEN_LABS_API_KEY || "sk_20b1a5899d669aed061c48e8242efd55f43abf2445bfd0f3";
const ELEVEN_LABS_API_URL = "https://api.elevenlabs.io/v1";

export async function registerRoutes(app: Express): Promise<Server> {
  // Fetch available voices from Eleven Labs
  app.get("/api/voices", async (_req: Request, res: Response) => {
    try {
      const response = await axios.get(`${ELEVEN_LABS_API_URL}/voices`, {
        headers: {
          "xi-api-key": ELEVEN_LABS_API_KEY,
        },
      });

      const voices = response.data.voices.map((voice: any) => ({
        id: voice.voice_id,
        name: voice.name,
        description: voice.description || "",
        language: voice.labels?.language || "English",
        category: voice.category || "standard",
        premium: voice.category === "premium",
      }));

      await storage.saveVoices(voices);
      return res.json(voices);
    } catch (error) {
      console.error("Error fetching voices:", error);
      return res.status(500).json({ 
        message: "Failed to fetch voices from Eleven Labs",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Text-to-speech generation endpoint
  app.post("/api/text-to-speech", async (req: Request, res: Response) => {
    try {
      const validatedData = ttsRequestSchema.parse(req.body);
      
      // Convert stability and clarity to ElevenLabs parameters
      const stability = validatedData.stability / 100;
      const similarity_boost = validatedData.clarity / 100;
      
      const response = await axios.post(
        `${ELEVEN_LABS_API_URL}/text-to-speech/${validatedData.voiceId}`,
        {
          text: validatedData.text,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability,
            similarity_boost,
          },
        },
        {
          headers: {
            "xi-api-key": ELEVEN_LABS_API_KEY,
            "Content-Type": "application/json",
            Accept: "audio/mpeg",
          },
          responseType: "arraybuffer",
        }
      );
      
      // Convert array buffer to base64 for sending to client
      const audioBase64 = Buffer.from(response.data).toString("base64");
      
      // Get voice name
      const voice = await storage.getVoice(validatedData.voiceId);
      const voiceName = voice?.name || "Unknown";
      
      // Save the generation to history
      const audioGeneration = await storage.saveAudioGeneration({
        text: validatedData.text,
        voiceId: validatedData.voiceId,
        voiceName,
        stability: validatedData.stability,
        clarity: validatedData.clarity,
        audioUrl: "", // We don't store the actual audio data in the DB
      });
      
      return res.json({
        id: audioGeneration.id,
        audio: audioBase64,
        format: "mp3"
      });
    } catch (error) {
      console.error("Error generating speech:", error);
      
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          message: "Validation error",
          error: validationError.message
        });
      }
      
      return res.status(500).json({
        message: "Failed to generate speech",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get recent audio generations
  app.get("/api/generations", async (_req: Request, res: Response) => {
    try {
      const generations = await storage.getRecentAudioGenerations();
      return res.json(generations);
    } catch (error) {
      console.error("Error fetching generations:", error);
      return res.status(500).json({ 
        message: "Failed to fetch recent generations",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // API Status check
  app.get("/api/status", async (_req: Request, res: Response) => {
    try {
      // Check if we can access the Eleven Labs API
      await axios.get(`${ELEVEN_LABS_API_URL}/voices`, {
        headers: {
          "xi-api-key": ELEVEN_LABS_API_KEY,
        },
      });
      
      return res.json({ 
        status: "connected",
        message: "API connection successful" 
      });
    } catch (error) {
      console.error("API status check failed:", error);
      return res.status(500).json({ 
        status: "error",
        message: "API connection failed",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
