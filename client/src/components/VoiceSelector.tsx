import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Voice } from "@shared/schema";

type VoiceSelectorProps = {
  voices: Voice[];
  selectedVoice: string;
  onVoiceSelect: (voiceId: string) => void;
  isLoading: boolean;
};

export default function VoiceSelector({
  voices,
  selectedVoice,
  onVoiceSelect,
  isLoading
}: VoiceSelectorProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-display font-semibold text-lg text-gray-800">Available Voices</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Category:</span>
            <Select defaultValue="all">
              <SelectTrigger className="w-[140px] h-8 text-sm">
                <SelectValue placeholder="All Voices" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Voices</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="free">Free</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <div className="flex gap-2 pt-1">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-12" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ScrollArea className="h-full max-h-80 pr-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {voices.slice(0, 6).map((voice) => (
                <div
                  key={voice.id}
                  onClick={() => onVoiceSelect(voice.id)}
                  className={`border rounded-lg p-3 cursor-pointer transition-all ${
                    selectedVoice === voice.id
                      ? "ring-2 ring-primary-500 bg-primary-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 flex-shrink-0">
                      <i className="ri-user-voice-line"></i>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800 text-sm">{voice.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{voice.description || "Natural sounding voice"}</p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        {voice.premium && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-secondary-100 text-secondary-800">
                            Premium
                          </span>
                        )}
                        <span className="text-xs text-gray-500">{voice.language || "English"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {voices.length > 6 && (
              <div className="mt-4 text-center">
                <button className="text-primary-600 text-sm font-medium hover:text-primary-700 transition-colors">
                  View all voices <i className="ri-arrow-right-line align-middle ml-1"></i>
                </button>
              </div>
            )}
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
