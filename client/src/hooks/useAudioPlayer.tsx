import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function useAudioPlayer(audioSrc: string | null) {
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Create Audio object on component mount
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    
    // Set up event listeners
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };
    
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    
    const handlePlay = () => {
      setIsPlaying(true);
    };
    
    const handlePause = () => {
      setIsPlaying(false);
    };
    
    const handleError = (e: Event) => {
      console.error("Audio error:", e);
      setIsLoading(false);
      setIsPlaying(false);
      setError(new Error("Audio playback error"));
      
      toast({
        variant: "destructive",
        title: "Playback Error",
        description: "Could not play the audio. Please try again."
      });
    };
    
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("error", handleError);
    
    return () => {
      // Cleanup
      audio.pause();
      audio.src = "";
      
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("error", handleError);
    };
  }, [toast]);
  
  // Update audio source when it changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioSrc) return;
    
    // Reset state
    setIsPlaying(false);
    setCurrentTime(0);
    setError(null);
    setIsLoading(true);
    
    // Set the source directly if it's not an API URL
    if (!audioSrc.startsWith('/api/')) {
      audio.src = audioSrc;
      audio.load();
      setIsLoading(false);
      return;
    }
    
    // For API URLs, fetch the audio data first
    const fetchAudio = async () => {
      try {
        // Get API key if available
        const apiKey = localStorage.getItem("elevenLabsApiKey");
        const headers: Record<string, string> = {};
        
        if (apiKey) {
          headers["x-api-key"] = apiKey;
        }
        
        // Fetch the audio
        const response = await fetch(audioSrc, {
          headers,
          credentials: 'same-origin',
          cache: 'no-cache' // Avoid browser caching
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch audio: ${response.status}`);
        }
        
        // Convert response to blob
        const blob = await response.blob();
        
        // Create object URL from blob
        const url = URL.createObjectURL(blob);
        
        // Set audio source
        audio.src = url;
        audio.load();
        
        // Clean up object URL when audio is loaded
        const handleLoaded = () => {
          audio.removeEventListener('canplaythrough', handleLoaded);
          setIsLoading(false);
        };
        
        audio.addEventListener('canplaythrough', handleLoaded, { once: true });
        
      } catch (error) {
        console.error("Error fetching audio:", error);
        setError(error instanceof Error ? error : new Error('Unknown error'));
        setIsLoading(false);
        
        toast({
          variant: "destructive",
          title: "Audio Loading Error",
          description: "Failed to load the audio. Please try again."
        });
      }
    };
    
    fetchAudio();
    
    // Cleanup function to revoke object URL
    return () => {
      const src = audio.src;
      if (src.startsWith('blob:')) {
        audio.pause();
        audio.src = '';
        URL.revokeObjectURL(src);
      }
    };
  }, [audioSrc, toast]);
  
  // Toggle play/pause
  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    try {
      if (isPlaying) {
        audio.pause();
      } else {
        // If audio source is an API endpoint and hasn't loaded yet, reload it
        if (audioSrc?.startsWith('/api/') && (audio.readyState === 0 || audio.error)) {
          setIsLoading(true);
          
          try {
            // Get API key if available
            const apiKey = localStorage.getItem("elevenLabsApiKey");
            const headers: Record<string, string> = {};
            
            if (apiKey) {
              headers["x-api-key"] = apiKey;
            }
            
            const response = await fetch(audioSrc, {
              headers,
              credentials: 'same-origin',
              cache: 'no-cache'
            });
            
            if (!response.ok) {
              throw new Error(`Failed to fetch audio: ${response.status}`);
            }
            
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            
            // Clean up old blob URL if exists
            if (audio.src.startsWith('blob:')) {
              URL.revokeObjectURL(audio.src);
            }
            
            audio.src = url;
            audio.load();
            
            // Wait for audio to be loaded
            await new Promise<void>((resolve) => {
              const handleCanPlay = () => {
                audio.removeEventListener('canplaythrough', handleCanPlay);
                resolve();
              };
              audio.addEventListener('canplaythrough', handleCanPlay, { once: true });
              
              // Also resolve on error to avoid hanging
              const handleError = () => {
                audio.removeEventListener('error', handleError);
                resolve();
              };
              audio.addEventListener('error', handleError, { once: true });
            });
            
            // Try to play
            await audio.play();
            
          } catch (error) {
            console.error("Error reloading audio:", error);
            throw error;
          } finally {
            setIsLoading(false);
          }
        } else {
          // Normal play
          await audio.play();
        }
      }
    } catch (error) {
      console.error("Toggle play error:", error);
      setIsPlaying(false);
      
      toast({
        variant: "destructive",
        title: "Playback Error",
        description: "Could not play the audio. Please try again."
      });
    }
  };
  
  // Restart audio
  const restart = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.currentTime = 0;
    
    if (!isPlaying) {
      togglePlay();
    }
  };
  
  // Seek to position
  const seek = (event: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const percentage = offsetX / rect.width;
    
    audio.currentTime = percentage * duration;
    setCurrentTime(percentage * duration);
  };
  
  // Format time in MM:SS
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds === 0) return "0:00";
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  
  // Download audio file
  const downloadAudio = async (format: string, fileName?: string) => {
    if (!audioSrc) {
      toast({
        variant: "destructive",
        title: "Download Failed", 
        description: "No audio available for download"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // For API endpoints, trigger the download through the browser
      if (audioSrc.startsWith('/api/')) {
        const generationId = audioSrc.split('/').pop();
        
        if (!generationId) {
          throw new Error("Invalid audio URL");
        }
        
        // First, increment download count
        await fetch(`/api/generations/${generationId}/increment-download`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        // Create a link and trigger the download
        const a = document.createElement('a');
        a.href = audioSrc;
        a.download = fileName || `voicecraft-audio.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        toast({
          title: "Download Started",
          description: `Your audio is being downloaded in ${format.toUpperCase()} format.`
        });
      } 
      // Handle direct blob URLs
      else if (audioSrc.startsWith('blob:')) {
        const a = document.createElement('a');
        a.href = audioSrc;
        a.download = fileName || `voicecraft-audio.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        toast({
          title: "Download Started",
          description: `Your audio is being downloaded in ${format.toUpperCase()} format.`
        });
      }
      // Handle data URLs (base64)
      else if (audioSrc.startsWith('data:')) {
        const parts = audioSrc.split(',');
        if (parts.length !== 2) {
          throw new Error("Invalid audio data format");
        }
        
        const base64Data = parts[1];
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
        
        const mimeType = format === 'mp3' ? 'audio/mpeg' : `audio/${format}`;
        const blob = new Blob(byteArrays, { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName || `voicecraft-audio.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Clean up the URL
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 100);
        
        toast({
          title: "Download Started",
          description: `Your audio is being downloaded in ${format.toUpperCase()} format.`
        });
      }
    } catch (error) {
      console.error("Download error:", error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "There was an error downloading the audio. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    audioRef,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    restart,
    seek,
    formatTime,
    downloadAudio,
    isLoading,
    error
  };
}