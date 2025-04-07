import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AudioWaveform from "./AudioWaveform";
import useAudioPlayer from "@/hooks/useAudioPlayer";
import type { Voice } from "@shared/schema";

type AudioPlayerProps = {
  audioData: {
    audio: string;
    format: string;
    text: string;
    voiceId: string;
    contentType?: string;
  } | null;
  selectedVoice: string;
  voices: Voice[];
};

export default function AudioPlayer({ audioData, selectedVoice, voices }: AudioPlayerProps) {
  // Prepare audio source in the optimal format for faster loading
  const prepareAudioSource = (data: {
    audio: string;
    format: string;
    text: string;
    voiceId: string;
    contentType?: string;
  } | null) => {
    if (!data || !data.audio) return null;
    
    // Check if it's already a blob URL (for cached audio)
    if (data.audio.startsWith('blob:')) {
      return data.audio;
    }
    
    // Otherwise, create a data URL from base64
    return `data:${data.contentType || `audio/${data.format}`};base64,${data.audio}`;
  };
  
  const {
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
  } = useAudioPlayer(prepareAudioSource(audioData));

  // Find the selected voice name with caching for better performance
  const getVoiceName = (voiceId: string) => {
    const voice = voices.find(v => v.id === voiceId);
    return voice ? voice.name : "Unknown";
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="font-display font-semibold text-lg text-gray-800 mb-4">Audio Player</h2>
        
        {!audioData && !isLoading && (
          <div className="border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center py-10 px-4 text-center">
            <div className="bg-primary-50 h-16 w-16 rounded-full flex items-center justify-center text-primary-500 mb-3">
              <i className="ri-sound-module-line text-2xl"></i>
            </div>
            <h3 className="font-medium text-gray-700 mb-1">No audio generated yet</h3>
            <p className="text-sm text-gray-500 max-w-xs">Enter your text and click the Generate button to create audio</p>
          </div>
        )}
        
        {isLoading && (
          <div className="border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center py-10 px-4">
            <div className="mb-4">
              <AudioWaveform isActive={true} />
            </div>
            <h3 className="font-medium text-gray-700 mb-1">Processing audio...</h3>
            <div className="w-full max-w-xs bg-gray-200 rounded-full h-2.5 my-2">
              <div className="bg-primary-600 h-2.5 rounded-full animate-pulse" style={{ width: "60%" }}></div>
            </div>
            <p className="text-sm text-gray-500">Preparing your audio for playback</p>
          </div>
        )}
        
        {audioData && !isLoading && (
          <div className="space-y-5">
            <audio ref={audioRef} className="hidden" />
            
            {/* Waveform Visualization */}
            <div className="bg-gray-50 rounded-lg p-4 aspect-[3/1] flex items-center justify-center">
              <AudioWaveform isActive={isPlaying} />
            </div>
            
            {/* Audio Controls */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between text-xs text-gray-500">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              
              <div 
                className="relative w-full h-2 bg-gray-200 rounded-full cursor-pointer" 
                onClick={seek}
              >
                <div 
                  className="absolute top-0 left-0 h-full bg-primary-500 rounded-full" 
                  style={{ width: `${(currentTime / Math.max(duration, 1)) * 100}%` }}
                ></div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={togglePlay}
                    className="w-10 h-10 rounded-full p-0"
                  >
                    <i className={`${isPlaying ? "ri-pause-line" : "ri-play-line"}`}></i>
                  </Button>
                  
                  <Button
                    onClick={restart}
                    variant="outline"
                    className="w-8 h-8 rounded-full p-0"
                  >
                    <i className="ri-restart-line"></i>
                  </Button>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    className="w-8 h-8 rounded-full p-0"
                  >
                    <i className="ri-volume-up-line"></i>
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-8 h-8 rounded-full p-0"
                      >
                        <i className="ri-download-2-line"></i>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => downloadAudio("mp3")}>
                        <i className="ri-file-music-line mr-2"></i>
                        Download MP3
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => downloadAudio("wav")}>
                        <i className="ri-file-music-line mr-2"></i>
                        Download WAV
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
            
            {audioData.text && (
              <div className="text-sm">
                <div className="flex items-center justify-between text-gray-500 mb-2">
                  <span>Voice</span>
                  <span>{getVoiceName(audioData.voiceId)}</span>
                </div>
                <div className="text-gray-700 bg-gray-50 p-3 rounded-lg max-h-24 overflow-y-auto text-sm">
                  <p>{audioData.text}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
