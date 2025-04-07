import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import Footer from "@/components/Footer";
import TextToSpeechForm from "@/components/TextToSpeechForm";
import VoiceSelector from "@/components/VoiceSelector";
import AudioPlayer from "@/components/AudioPlayer";
import RecentGenerations from "@/components/RecentGenerations";
import { apiRequest } from "@/lib/queryClient";
import type { Voice, AudioGeneration } from "@shared/schema";
import { TbMicrophone, TbDownload, TbWaveSquare } from "react-icons/tb";

export default function Home() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
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
  
  // Delete audio generation mutation
  const deleteMutation = useMutation({
    mutationFn: async (generationId: number) => {
      const response = await apiRequest("DELETE", `/api/generations/${generationId}`);
      if (!response.ok) {
        throw new Error("Failed to delete generation");
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate the generations query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/generations"] });
      
      toast({
        title: "Generation Deleted",
        description: "The audio generation has been successfully deleted.",
      });
      
      // If the current audio is from the deleted generation, clear it
      if (audioData) {
        setAudioData(null);
      }
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: error.message || "Failed to delete the generation. Please try again.",
      });
    }
  });
  
  // Handle deleting a generation
  const handleDeleteGeneration = (generation: AudioGeneration) => {
    if (generation.id) {
      deleteMutation.mutate(generation.id);
    }
  };
  
  // Handle downloading a recent generation
  const downloadRecentGeneration = async (generation: AudioGeneration, format: string) => {
    try {
      setIsLoading(true);
      
      if (!generation.id) {
        throw new Error("Invalid generation ID");
      }
      
      // First update the download count
      await fetch(`/api/generations/${generation.id}/increment-download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Create a filename for the download
      const filename = `voicecraft-${generation.text.substring(0, 20).replace(/[^a-z0-9]/gi, '-')}.${format}`;
      
      // Direct approach - open a new window/tab with the audio endpoint URL
      // The browser will handle the download as the Content-Disposition header is set to attachment
      const apiKey = localStorage.getItem("elevenLabsApiKey");
      const headers: Record<string, string> = {};
      
      if (apiKey) {
        headers["x-api-key"] = apiKey;
      }
      
      // Fetch the audio data
      const response = await fetch(`/api/generations/${generation.id}/audio`, { headers });
      
      if (!response.ok) {
        throw new Error("Failed to fetch audio data for download");
      }
      
      // Get the audio blob
      const blob = await response.blob();
      
      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
      
      // Create a link element and trigger the download
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
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
    <div className="flex flex-col">
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

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-primary-700 text-sm font-medium">Total Voices</h3>
                <p className="text-2xl font-bold text-primary-900 mt-1">
                  {voices?.length || 0}
                </p>
              </div>
              <div className="bg-primary-100 p-3 rounded-full text-primary-600">
                <TbMicrophone size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-blue-700 text-sm font-medium">Audio Generated</h3>
                <p className="text-2xl font-bold text-blue-900 mt-1">
                  {recentGenerations?.length || 0}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                <TbWaveSquare size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-emerald-700 text-sm font-medium">Downloads</h3>
                <p className="text-2xl font-bold text-emerald-900 mt-1">
                  {recentGenerations?.reduce((sum, gen) => sum + (gen.downloadCount || 0), 0) || 0}
                </p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-full text-emerald-600">
                <TbDownload size={24} />
              </div>
            </div>
          </div>
        </div>

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
              onDelete={handleDeleteGeneration}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
