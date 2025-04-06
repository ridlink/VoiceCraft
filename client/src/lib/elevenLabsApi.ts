import { z } from "zod";
import { TtsRequest } from "@shared/schema";

export async function generateSpeech(data: TtsRequest): Promise<any> {
  const response = await fetch("/api/text-to-speech", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
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
  const response = await fetch("/api/voices");
  
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to fetch voices: ${errorBody}`);
  }
  
  return response.json();
}

export async function getApiStatus() {
  const response = await fetch("/api/status");
  
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to get API status: ${errorBody}`);
  }
  
  return response.json();
}

export async function getRecentGenerations() {
  const response = await fetch("/api/generations");
  
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to fetch recent generations: ${errorBody}`);
  }
  
  return response.json();
}
