import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { TbPlayerPlay, TbPlayerPause, TbRefresh, TbVolume, TbDownload, TbAlertTriangle } from "react-icons/tb";
import AudioWaveform from "./AudioWaveform";
import useAudioPlayer from "@/hooks/useAudioPlayer";
import type { Voice, AudioGeneration } from "@shared/schema";

type AudioPlayerProps = {
  audioData: AudioGeneration | null;
  selectedVoice: string;
  voices: Voice[];
};

export default function AudioPlayer({ audioData, selectedVoice, voices }: AudioPlayerProps) {
  // Prepare audio source in the optimal format for faster loading
  const prepareAudioSource = (data: AudioGeneration | null) => {
    if (!data) return null;
    
    // If we have a direct URL to the audio, use it
    if (data.audioUrl) {
      return data.audioUrl;
    }
    
    // For backward compatibility - if we have audio in the request/response
    if ('audio' in data && typeof data.audio === 'string') {
      // Check if it's already a blob URL (for cached audio)
      if (data.audio.startsWith('blob:')) {
        return data.audio;
      }
      
      // Otherwise, create a data URL from base64
      const format = data.format || 'mp3';
      const contentType = (data as any).contentType || `audio/${format}`;
      return `data:${contentType};base64,${data.audio}`;
    }
    
    // Last resort - create URL for audio fetching
    return `/api/generations/${data.id}/audio`;
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
    isLoading,
    error
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
          <div className="border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center py-6 px-4">
            <h3 className="font-medium text-gray-700 mb-1">Preparing Audio</h3>
            <div className="w-full max-w-md my-2">
              <Progress value={75} className="h-2 mb-3 animate-pulse" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Loading audio data</span>
                <span>75%</span>
              </div>
            </div>
            <div className="my-3">
              <AudioWaveform isActive={true} barCount={16} variant="gradient" animationSpeed="fast" />
            </div>
            <p className="text-sm text-gray-500">Optimizing audio for playback</p>
          </div>
        )}
        
        {error && !isLoading && audioData && (
          <Alert variant="destructive" className="mb-4">
            <div className="flex items-center gap-2">
              <TbAlertTriangle className="h-5 w-5" />
              <AlertTitle>Playback Error</AlertTitle>
            </div>
            <AlertDescription className="mt-2">
              Could not play the audio. Please try again.
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 w-full"
                onClick={() => togglePlay()}
              >
                Retry Playback
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        {audioData && !isLoading && !error && (
          <div className="space-y-5">
            <audio ref={audioRef} className="hidden" />
            
            {/* Waveform Visualization */}
            <div 
              className={`rounded-lg p-4 aspect-[3/1] flex items-center justify-center transition-colors duration-500 ${
                isPlaying 
                  ? "bg-gradient-to-r from-primary-50 via-primary-100 to-primary-50" 
                  : "bg-gray-50"
              }`}
            >
              <AudioWaveform 
                isActive={isPlaying} 
                barCount={48} 
                variant={isPlaying ? "gradient" : "solid"} 
                animationSpeed={isPlaying ? "normal" : "slow"} 
              />
            </div>
            
            {/* Audio Controls - Always Visible */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between text-xs text-gray-500">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              
              <div 
                className="relative w-full h-3 bg-gray-200 rounded-full cursor-pointer overflow-hidden" 
                onClick={seek}
              >
                <div 
                  className={`absolute top-0 left-0 h-full rounded-full transition-all duration-300 ${
                    isPlaying 
                      ? "bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 shadow-sm shadow-primary-300/50" 
                      : "bg-primary-500"
                  }`}
                  style={{ width: `${(currentTime / Math.max(duration, 1)) * 100}%` }}
                ></div>
                {isPlaying && (
                  <div 
                    className="absolute top-0 left-0 w-full h-full opacity-20"
                    style={{
                      background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 2s infinite",
                    }}
                  ></div>
                )}
                <style>
                  {`
                  @keyframes shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                  }
                  `}
                </style>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={togglePlay}
                    className="w-10 h-10 rounded-full p-0"
                  >
                    {isPlaying ? <TbPlayerPause size={20} /> : <TbPlayerPlay size={20} />}
                  </Button>
                  
                  <Button
                    onClick={restart}
                    variant="outline"
                    className="w-8 h-8 rounded-full p-0"
                  >
                    <TbRefresh size={16} />
                  </Button>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    className="w-8 h-8 rounded-full p-0"
                  >
                    <TbVolume size={16} />
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-8 h-8 rounded-full p-0"
                      >
                        <TbDownload size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => downloadAudio("mp3")}>
                        <TbDownload className="mr-2" size={16} />
                        Download MP3
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => downloadAudio("wav")}>
                        <TbDownload className="mr-2" size={16} />
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
