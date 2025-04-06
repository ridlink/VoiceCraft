import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function useAudioPlayer(audioSrc: string | null) {
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Update audio source when it changes
  useEffect(() => {
    if (audioSrc && audioRef.current) {
      setIsLoading(true);
      
      // Reset state for new audio
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      
      try {
        // Create a new Blob from the base64 data
        const base64Data = audioSrc.split(',')[1];
        // Default to audio/mpeg if no specific type is found in the data URL
        const audioType = audioSrc.includes('audio/mp3') ? 'audio/mpeg' : 
                         audioSrc.includes('audio/wav') ? 'audio/wav' : 
                         'audio/mpeg';
        
        // Create a Blob from the base64 data
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
        
        const blob = new Blob(byteArrays, { type: audioType });
        const blobUrl = URL.createObjectURL(blob);
        
        // Set the new audio source from the blob URL
        audioRef.current.src = blobUrl;
        audioRef.current.load();
        
        // Clean up the blob URL when the component unmounts
        return () => {
          URL.revokeObjectURL(blobUrl);
        };
      } catch (error) {
        console.error("Error creating audio blob:", error);
        // Fallback to direct base64 data URL
        audioRef.current.src = audioSrc;
        audioRef.current.load();
      }
      
      // Add a console log to help with debugging
      console.log("Audio source updated and loaded");
    } else if (!audioSrc && audioRef.current) {
      // Clear the audio source if none is provided
      audioRef.current.src = "";
      audioRef.current.load();
      setIsLoading(false);
    }
  }, [audioSrc]);

  // Set up event listeners when the component mounts
  useEffect(() => {
    const audio = audioRef.current;
    
    if (!audio) return;
    
    const handleLoadedMetadata = () => {
      console.log("Audio metadata loaded, duration:", audio.duration);
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
    
    const handleCanPlayThrough = () => {
      console.log("Audio can play through");
      setIsLoading(false);
    };
    
    const handleLoadedData = () => {
      console.log("Audio data loaded");
      setIsLoading(false);
    };
    
    const handlePlay = () => {
      console.log("Audio playing");
      setIsPlaying(true);
    };
    
    const handlePause = () => {
      console.log("Audio paused");
      setIsPlaying(false);
    };
    
    const handleError = (e: ErrorEvent) => {
      console.error("Audio error:", e);
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Playback Error",
        description: "There was an error playing the audio. Please try again.",
      });
    };
    
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("loadeddata", handleLoadedData);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("canplaythrough", handleCanPlayThrough);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("error", handleError as EventListener);
    
    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("loadeddata", handleLoadedData);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("canplaythrough", handleCanPlayThrough);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("error", handleError as EventListener);
    };
  }, [toast]);

  // Toggle play/pause
  const togglePlay = async () => {
    if (!audioRef.current) return;
    
    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        const playPromise = audioRef.current.play();
        
        // Modern browsers return a promise from play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("Audio playback started successfully");
              setIsPlaying(true);
            })
            .catch(error => {
              console.error("Error playing audio:", error);
              setIsPlaying(false);
              toast({
                variant: "destructive",
                title: "Playback Error",
                description: "There was an error playing the audio. Please try again.",
              });
            });
        } else {
          // Older browsers don't return a promise
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.error("Toggle play error:", error);
      setIsPlaying(false);
      toast({
        variant: "destructive",
        title: "Playback Error",
        description: "There was an error with the audio playback. Please try again.",
      });
    }
  };

  // Restart audio
  const restart = async () => {
    if (!audioRef.current) return;
    
    try {
      audioRef.current.currentTime = 0;
      
      if (!isPlaying) {
        const playPromise = audioRef.current.play();
        
        // Modern browsers return a promise from play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("Audio restart successful");
              setIsPlaying(true);
            })
            .catch(error => {
              console.error("Error restarting audio:", error);
              setIsPlaying(false);
              toast({
                variant: "destructive",
                title: "Playback Error",
                description: "There was an error restarting the audio. Please try again.",
              });
            });
        } else {
          // Older browsers don't return a promise
          setIsPlaying(true);
        }
      }
    } catch (error) {
      console.error("Restart error:", error);
      toast({
        variant: "destructive",
        title: "Playback Error",
        description: "There was an error restarting the audio. Please try again.",
      });
    }
  };

  // Seek to position
  const seek = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !audioSrc) return;
    
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const percentage = offsetX / rect.width;
    
    audioRef.current.currentTime = percentage * duration;
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
  const downloadAudio = (format: string) => {
    if (!audioSrc) return;
    
    try {
      // Extract the base64 data from data URL
      const base64Data = audioSrc.split(',')[1];
      
      // Create a Blob from the base64 data
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
      
      // Use the correct MIME type for the download based on format
      const mimeType = format === 'mp3' ? 'audio/mpeg' : `audio/${format}`;
      const blob = new Blob(byteArrays, { type: mimeType });
      const blobUrl = URL.createObjectURL(blob);
      
      // Create a temporary <a> element to trigger download
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `voicecraft-audio.${format}`;
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
      console.error("Download error:", error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "There was an error downloading the audio. Please try again.",
      });
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
  };
}
