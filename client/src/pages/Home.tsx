import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TextToSpeechForm from "@/components/TextToSpeechForm";
import VoiceSelector from "@/components/VoiceSelector";
import AudioPlayer from "@/components/AudioPlayer";
import RecentGenerations from "@/components/RecentGenerations";
import { apiRequest } from "@/lib/queryClient";
import type { Voice, AudioGeneration } from "@shared/schema";

export default function Home() {
  const { toast } = useToast();
  const [audioData, setAudioData] = useState<{
    audio: string;
    format: string;
    text: string;
    voiceId: string;
    contentType?: string;
  } | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Type for API status
  interface ApiStatus {
    status: string;
    message: string;
  }

  // Fetch API status
  const { data: apiStatus } = useQuery<ApiStatus>({
    queryKey: ["/api/status"],
    refetchInterval: 300000, // Check every 5 minutes
    onError: () => {
      toast({
        variant: "destructive",
        title: "API Connection Failed",
        description: "Could not connect to the Eleven Labs API. Please check your internet connection or try again later.",
      });
    }
  });

  // Fetch voices
  const { data: voices, isLoading: isLoadingVoices, error: voicesError } = useQuery<Voice[]>({
    queryKey: ["/api/voices"],
    onSuccess: (data: Voice[]) => {
      if (data.length > 0 && !selectedVoice) {
        setSelectedVoice(data[0].id);
      }
    }
  });

  // Fetch recent generations
  const { data: recentGenerations } = useQuery<AudioGeneration[]>({
    queryKey: ["/api/generations"],
  });

  // Show error for voices if necessary
  useEffect(() => {
    if (voicesError) {
      toast({
        variant: "destructive",
        title: "Error Loading Voices",
        description: "Failed to load voice options. Please refresh the page or try again later.",
      });
    }
  }, [voicesError, toast]);

  const handleGenerationComplete = (generationData: {
    audio: string;
    format: string;
    text: string;
    voiceId: string;
    contentType?: string;
  }) => {
    setAudioData(generationData);
  };

  const playRecentGeneration = async (generation: AudioGeneration) => {
    try {
      setIsLoading(true);
      
      // We would need to regenerate the audio since we don't store the actual audio data
      const res = await apiRequest("POST", "/api/text-to-speech", {
        text: generation.text,
        voiceId: generation.voiceId,
        stability: generation.stability || 50,
        clarity: generation.clarity || 70,
      });
      
      // Make sure the response is properly handled
      if (!res.ok) {
        throw new Error("Failed to regenerate audio");
      }
      
      const data = await res.json();
      
      if (!data.audio) {
        throw new Error("No audio data received");
      }
      
      // Set the voice first, then the audio data
      setSelectedVoice(generation.voiceId);
      
      setAudioData({
        audio: data.audio,
        format: data.format || "mp3",
        text: generation.text,
        voiceId: generation.voiceId,
        contentType: data.contentType || "audio/mpeg" // Include the content type for proper audio handling
      });
      
      toast({
        title: "Audio Loaded",
        description: "Previously generated audio has been loaded.",
      });
    } catch (error) {
      console.error("Error playing recent generation:", error);
      toast({
        variant: "destructive",
        title: "Error Loading Audio",
        description: "Failed to load the previous generation. Please try generating it again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const apiConnected = apiStatus?.status === "connected";
  
  // Handle downloading a recent generation
  const downloadRecentGeneration = async (generation: AudioGeneration, format: string) => {
    try {
      setIsLoading(true);
      
      // We need to regenerate the audio since we don't store the actual audio data
      const res = await apiRequest("POST", "/api/text-to-speech", {
        text: generation.text,
        voiceId: generation.voiceId,
        stability: generation.stability || 50,
        clarity: generation.clarity || 70,
      });
      
      if (!res.ok) {
        throw new Error("Failed to regenerate audio for download");
      }
      
      const data = await res.json();
      
      if (!data.audio) {
        throw new Error("No audio data received for download");
      }
      
      // Create a blob URL and trigger download
      const base64Data = data.audio;
      const byteCharacters = atob(base64Data);
      const byteArrays = [];
      
      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      
      // Use the correct MIME type for the download
      const mimeType = format === 'mp3' ? 'audio/mpeg' : `audio/${format}`;
      const blob = new Blob(byteArrays, { type: mimeType });
      const blobUrl = URL.createObjectURL(blob);
      
      // Create a temporary <a> element to trigger download
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `voicecraft-${generation.text.substring(0, 20).replace(/[^a-z0-9]/gi, '-')}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Clean up the blob URL
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 100);
      
      toast({
        title: "Download Started",
        description: `Your audio is being downloaded in ${format.toUpperCase()} format.`,
      });
    } catch (error) {
      console.error("Error downloading generation:", error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Failed to download the audio. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* API Status Alert */}
        {apiStatus && (
          <div className={`mb-6 px-4 py-3 rounded-lg border flex items-center justify-between ${
            apiConnected ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {apiConnected ? (
                <i className="ri-checkbox-circle-line text-green-500"></i>
              ) : (
                <i className="ri-error-warning-line text-red-500"></i>
              )}
              <span>{apiStatus.message}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Text Input & Voice Selection */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <TextToSpeechForm 
              voices={voices || []} 
              selectedVoice={selectedVoice}
              onVoiceChange={setSelectedVoice}
              onGenerationComplete={handleGenerationComplete}
              apiConnected={apiConnected}
            />
            
            <VoiceSelector
              voices={voices || []}
              selectedVoice={selectedVoice}
              onVoiceSelect={setSelectedVoice}
              isLoading={isLoadingVoices}
            />
          </div>
          
          {/* Right Column: Audio Player & History */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <AudioPlayer 
              audioData={audioData}
              selectedVoice={selectedVoice}
              voices={voices || []}
            />
            
            <RecentGenerations 
              generations={recentGenerations || []}
              onPlay={playRecentGeneration}
              onDownload={downloadRecentGeneration}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
