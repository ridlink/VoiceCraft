import { z } from "zod";
import { TtsRequest } from "@shared/schema";

// Get the API key from localStorage
function getApiKey(): string | null {
  return localStorage.getItem("elevenLabsApiKey");
}

export async function generateSpeech(data: TtsRequest): Promise<any> {
  const apiKey = getApiKey();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  if (apiKey) {
    headers["x-api-key"] = apiKey;
  }
  
  const response = await fetch("/api/text-to-speech", {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to generate speech: ${errorBody}`);
  }

  const responseData = await response.json();
  return responseData;
}

export async function getVoices() {
  const apiKey = getApiKey();
  const headers: Record<string, string> = {};
  
  if (apiKey) {
    headers["x-api-key"] = apiKey;
  }
  
  const response = await fetch("/api/voices", { headers });
  
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to fetch voices: ${errorBody}`);
  }
  
  return response.json();
}

export async function getApiStatus() {
  const apiKey = getApiKey();
  const headers: Record<string, string> = {};
  
  if (apiKey) {
    headers["x-api-key"] = apiKey;
  }
  
  const response = await fetch("/api/status", { headers });
  
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to get API status: ${errorBody}`);
  }
  
  return response.json();
}

export async function getRecentGenerations() {
  const apiKey = getApiKey();
  const headers: Record<string, string> = {};
  
  if (apiKey) {
    headers["x-api-key"] = apiKey;
  }
  
  const response = await fetch("/api/generations", { headers });
  
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to fetch recent generations: ${errorBody}`);
  }
  
  return response.json();
}
