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
      
      audioRef.current.src = audioSrc;
      audioRef.current.load();
    }
  }, [audioSrc]);

  // Set up event listeners when the component mounts
  useEffect(() => {
    const audio = audioRef.current;
    
    if (!audio) return;
    
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
    
    const handleCanPlayThrough = () => {
      setIsLoading(false);
    };
    
    const handleError = () => {
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Playback Error",
        description: "There was an error playing the audio. Please try again.",
      });
    };
    
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("canplaythrough", handleCanPlayThrough);
    audio.addEventListener("error", handleError);
    
    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("canplaythrough", handleCanPlayThrough);
      audio.removeEventListener("error", handleError);
    };
  }, [toast]);

  // Toggle play/pause
  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Restart audio
  const restart = () => {
    if (!audioRef.current) return;
    
    audioRef.current.currentTime = 0;
    
    if (!isPlaying) {
      audioRef.current.play();
      setIsPlaying(true);
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
    
    // Create a temporary <a> element to trigger download
    const a = document.createElement("a");
    a.href = audioSrc;
    a.download = `voicecraft-audio.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast({
      title: "Download Started",
      description: `Your audio is being downloaded in ${format.toUpperCase()} format.`,
    });
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
