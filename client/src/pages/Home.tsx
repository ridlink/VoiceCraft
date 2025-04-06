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
  } | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string>("");

  // Fetch API status
  const { data: apiStatus } = useQuery({
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
    onSuccess: (data) => {
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
  }) => {
    setAudioData(generationData);
  };

  const playRecentGeneration = async (generation: AudioGeneration) => {
    try {
      // We would need to regenerate the audio since we don't store the actual audio data
      const res = await apiRequest("POST", "/api/text-to-speech", {
        text: generation.text,
        voiceId: generation.voiceId,
        stability: generation.stability || 50,
        clarity: generation.clarity || 70,
      });
      
      const data = await res.json();
      
      setAudioData({
        audio: data.audio,
        format: data.format,
        text: generation.text,
        voiceId: generation.voiceId,
      });
      
      setSelectedVoice(generation.voiceId);
      
      toast({
        title: "Audio Loaded",
        description: "Previously generated audio has been loaded.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error Loading Audio",
        description: "Failed to load the previous generation. Please try generating it again.",
      });
    }
  };

  const apiConnected = apiStatus?.status === "connected";
  
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
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
