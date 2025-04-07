import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import axios from "axios";
import { ttsRequestSchema } from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { setupAuth, requireAuth } from "./auth";

const DEFAULT_ELEVEN_LABS_API_KEY = process.env.ELEVEN_LABS_API_KEY || "sk_20b1a5899d669aed061c48e8242efd55f43abf2445bfd0f3";
const ELEVEN_LABS_API_URL = "https://api.elevenlabs.io/v1";

// Get the API key from request headers or use the default
function getApiKey(req: Request): string {
  return req.headers['x-api-key'] as string || DEFAULT_ELEVEN_LABS_API_KEY;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes and middleware
  setupAuth(app);
  // Fetch available voices from Eleven Labs
  app.get("/api/voices", async (req: Request, res: Response) => {
    try {
      const apiKey = getApiKey(req);
      const response = await axios.get(`${ELEVEN_LABS_API_URL}/voices`, {
        headers: {
          "xi-api-key": apiKey,
        },
      });

      // Log the raw response to see all available voice data
      console.log("Fetched voices from ElevenLabs:", JSON.stringify(response.data.voices[0], null, 2));
      
      const voices = response.data.voices.map((voice: any) => ({
        id: voice.voice_id,
        name: voice.name,
        description: voice.description || "",
        language: voice.labels?.language || "English",
        category: voice.category || "standard",
        premium: voice.category === "premium",
        previewUrl: voice.preview_url,
        // Store labels as a JSON string
        labels: JSON.stringify(voice.labels || {}),
        // Add additional properties for better filtering
        accent: voice.labels?.accent || null,
        age: voice.labels?.age || null,
        gender: voice.labels?.gender || null,
        useCase: voice.labels?.use_case || null,
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

  // Text-to-speech generation endpoint (requires authentication)
  app.post("/api/text-to-speech", requireAuth, async (req: Request, res: Response) => {
    try {
      const validatedData = ttsRequestSchema.parse(req.body);
      const apiKey = getApiKey(req);
      
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
            "xi-api-key": apiKey,
            "Content-Type": "application/json",
            Accept: "audio/mpeg",
          },
          responseType: "arraybuffer",
        }
      );
      
      // Convert array buffer to base64 for sending to client
      const audioBase64 = Buffer.from(response.data).toString("base64");
      
      // Get voice name (handle missing extended fields gracefully)
      let voiceName = "Voice";
      try {
        const voice = await storage.getVoice(validatedData.voiceId);
        if (voice && voice.name) {
          voiceName = voice.name;
        }
      } catch (voiceError) {
        console.error("Error fetching voice details:", voiceError);
      }
      
      // Save the generation to history with user ID
      const audioGeneration = await storage.saveAudioGeneration({
        text: validatedData.text,
        voiceId: validatedData.voiceId,
        voiceName,
        stability: validatedData.stability,
        clarity: validatedData.clarity,
        audioUrl: "", // We don't store the actual audio data in the DB
        userId: req.user?.id, // Add the authenticated user's ID
        duration: Math.ceil(response.headers['content-length'] ? parseInt(response.headers['content-length']) / 1024 / 16 : 0) // Estimate duration in seconds
      });
      
      // Return audio data with detailed media type
      return res.json({
        id: audioGeneration.id,
        audio: audioBase64,
        format: "mp3",
        contentType: "audio/mpeg" // Specify proper content type for clearer media handling
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

  // Get recent audio generations (public)
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
  
  // Get user's audio generations (authenticated)
  app.get("/api/user/generations", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const generations = await storage.getUserAudioGenerations(userId);
      return res.json(generations);
    } catch (error) {
      console.error("Error fetching user generations:", error);
      return res.status(500).json({ 
        message: "Failed to fetch user generations",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get user stats (authenticated)
  app.get("/api/user/stats", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      // Get the user's data
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Return user stats
      return res.json({
        username: user.username,
        totalGenerations: user.totalGenerations || 0,
        lastLogin: user.lastLoginAt,
        joinDate: user.createdAt
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
      return res.status(500).json({ 
        message: "Failed to fetch user stats",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get audio content for a specific generation
  app.get("/api/generations/:id/audio", requireAuth, async (req: Request, res: Response) => {
    try {
      const generationId = parseInt(req.params.id);
      
      if (isNaN(generationId)) {
        return res.status(400).json({ error: "Invalid generation ID" });
      }
      
      // Verify the generation exists
      const generation = await storage.getAudioGeneration(generationId);
      
      if (!generation) {
        return res.status(404).json({ error: "Generation not found" });
      }
      
      // Regenerate the audio since we don't store the actual audio in the database
      const apiKey = getApiKey(req);
      const response = await axios.post(
        `${ELEVEN_LABS_API_URL}/text-to-speech/${generation.voiceId}`,
        {
          text: generation.text,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: (generation.stability || 50) / 100,
            similarity_boost: (generation.clarity || 70) / 100,
          },
        },
        {
          headers: {
            "xi-api-key": apiKey,
            "Content-Type": "application/json",
            Accept: "audio/mpeg",
          },
          responseType: "arraybuffer",
        }
      );
      
      // Set the appropriate content type header and send the audio data directly
      res.set("Content-Type", "audio/mpeg");
      res.set("Content-Disposition", `attachment; filename="voicecraft-${generation.id}.mp3"`);
      return res.send(response.data);
      
    } catch (error) {
      console.error("Error fetching audio:", error);
      return res.status(500).json({ 
        message: "Failed to retrieve audio",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Increment download count for a generation
  app.post("/api/generations/:id/increment-download", requireAuth, async (req: Request, res: Response) => {
    try {
      const generationId = parseInt(req.params.id);
      
      if (isNaN(generationId)) {
        return res.status(400).json({ error: "Invalid generation ID" });
      }
      
      // Verify the generation exists
      const generation = await storage.getAudioGeneration(generationId);
      
      if (!generation) {
        return res.status(404).json({ error: "Generation not found" });
      }
      
      // Update the download count
      await storage.updateAudioGenerationDownloadCount(generationId);
      
      return res.status(200).json({ 
        success: true,
        message: "Download count updated successfully" 
      });
      
    } catch (error) {
      console.error("Error updating download count:", error);
      return res.status(500).json({ 
        message: "Failed to update download count",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Delete audio generation
  app.delete("/api/generations/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const generationId = parseInt(req.params.id);
      
      if (isNaN(generationId)) {
        return res.status(400).json({ error: "Invalid generation ID" });
      }
      
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      // Verify the generation exists
      const generation = await storage.getAudioGeneration(generationId);
      
      if (!generation) {
        return res.status(404).json({ error: "Generation not found" });
      }
      
      // Check if the user owns this generation or is an admin
      if (generation.userId !== userId) {
        return res.status(403).json({ error: "Not authorized to delete this generation" });
      }
      
      // Delete the generation
      await storage.deleteAudioGeneration(generationId);
      
      return res.status(200).json({ 
        success: true,
        message: "Generation deleted successfully" 
      });
    } catch (error) {
      console.error("Error deleting generation:", error);
      return res.status(500).json({ 
        message: "Failed to delete generation",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // API Status check
  app.get("/api/status", async (req: Request, res: Response) => {
    try {
      // Check if we can access the Eleven Labs API
      const apiKey = getApiKey(req);
      await axios.get(`${ELEVEN_LABS_API_URL}/voices`, {
        headers: {
          "xi-api-key": apiKey,
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
