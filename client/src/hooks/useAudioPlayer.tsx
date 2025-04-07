import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function useAudioPlayer(audioSrc: string | null) {
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  
  // Create Audio object on component mount
  useEffect(() => {
    audioRef.current = new Audio();
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      
      // Clean up any blob URLs
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, []);
  
  // Update audio source when it changes - with optimized loading
  useEffect(() => {
    // Clean up previous blob URL
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
      setBlobUrl(null);
    }
    
    if (!audioSrc || !audioRef.current) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    // Use a worker-like approach to process the audio data asynchronously
    const processAudioData = async () => {
      try {
        // Reset state for new audio
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
        
        // Check if we have a base64 encoded string (content might already be in that format)
        if (audioSrc.startsWith('data:')) {
          // Extract the base64 data
          const parts = audioSrc.split(',');
          if (parts.length !== 2) {
            throw new Error("Invalid audio data format");
          }
          
          const base64Data = parts[1];
          
          // Determine the MIME type from the data URL
          const mimeMatch = parts[0].match(/data:(.*?);base64/);
          const mimeType = mimeMatch ? mimeMatch[1] : 'audio/mpeg';
          
          // Convert base64 to binary using more efficient approach
          const byteArray = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
          
          // Create a blob and object URL
          const blob = new Blob([byteArray], { type: mimeType });
          const url = URL.createObjectURL(blob);
          
          // Store the blob URL for later cleanup
          setBlobUrl(url);
          
          // Set the audio source with preload attribute for faster loading
          if (audioRef.current) {
            audioRef.current.preload = "auto";
            audioRef.current.src = url;
            
            // Use async/await to handle loading
            await new Promise(resolve => {
              if (audioRef.current) {
                audioRef.current.onloadeddata = resolve;
                audioRef.current.load();
              } else {
                resolve(null);
              }
            });
          }
          
          console.log("Audio processed and ready to play");
          setIsLoading(false); // Explicitly set loading to false when done
        } else {
          // If it's already a URL (like for downloaded voices), use it directly
          if (audioRef.current) {
            audioRef.current.preload = "auto";
            audioRef.current.src = audioSrc;
            audioRef.current.load();
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error processing audio data:", error);
        
        // Fallback to direct data URL as a last resort
        if (audioRef.current) {
          audioRef.current.src = audioSrc;
          audioRef.current.load();
        }
        
        setIsLoading(false);
        
        toast({
          variant: "destructive",
          title: "Audio Processing Error",
          description: "There was an issue processing the audio data."
        });
      }
    };
    
    // Execute the async function
    processAudioData();
    
  }, [audioSrc, toast]);
  
  // Set up audio event listeners
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
    
    const handleError = (e: Event) => {
      console.error("Audio error:", e);
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Playback Error",
        description: "There was an error playing the audio. Please try again."
      });
    };
    
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("loadeddata", handleLoadedData);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("canplaythrough", handleCanPlayThrough);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("error", handleError);
    
    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("loadeddata", handleLoadedData);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("canplaythrough", handleCanPlayThrough);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("error", handleError);
    };
  }, [toast]);
  
  // Toggle play/pause
  const togglePlay = async () => {
    if (!audioRef.current) return;
    
    try {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        const playPromise = audioRef.current.play();
        
        // Modern browsers return a promise from play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("Audio playback started successfully");
            })
            .catch(error => {
              console.error("Error playing audio:", error);
              setIsPlaying(false);
              toast({
                variant: "destructive",
                title: "Playback Error",
                description: "Could not play the audio. Please try again."
              });
            });
        }
      }
    } catch (error) {
      console.error("Toggle play error:", error);
      toast({
        variant: "destructive",
        title: "Playback Error",
        description: "There was an error with the audio playback. Please try again."
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
            })
            .catch(error => {
              console.error("Error restarting audio:", error);
              setIsPlaying(false);
              toast({
                variant: "destructive",
                title: "Playback Error",
                description: "Could not restart the audio. Please try again."
              });
            });
        }
      }
    } catch (error) {
      console.error("Restart error:", error);
      toast({
        variant: "destructive",
        title: "Playback Error",
        description: "There was an error restarting the audio. Please try again."
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
  const downloadAudio = (format: string, fileName?: string) => {
    if (!audioSrc) {
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "No audio data available for download."
      });
      return;
    }
    
    try {
      // Use the existing blob URL if available, otherwise create a new one
      if (blobUrl) {
        // Create a temporary <a> element to trigger download
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = fileName || `voicecraft-audio.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        toast({
          title: "Download Started",
          description: `Your audio is being downloaded in ${format.toUpperCase()} format.`
        });
      } else {
        // Extract the base64 data
        const parts = audioSrc.split(',');
        if (parts.length !== 2) {
          throw new Error("Invalid audio data format");
        }
        
        const base64Data = parts[1];
        
        // Convert base64 to binary
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        
        // Use the correct MIME type for the download
        const mimeType = format === 'mp3' ? 'audio/mpeg' : `audio/${format}`;
        const blob = new Blob([byteArray], { type: mimeType });
        const downloadUrl = URL.createObjectURL(blob);
        
        // Create a temporary <a> element to trigger download
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = fileName || `voicecraft-audio.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Clean up the download URL
        setTimeout(() => {
          URL.revokeObjectURL(downloadUrl);
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
    isLoading
  };
}