import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  // Extract available languages from voices
  const languages = useMemo(() => {
    const langSet = new Set<string>();
    voices.forEach(voice => {
      // Handle null values safely
      if (voice.language) {
        langSet.add(voice.language);
      }
    });
    return Array.from(langSet).sort();
  }, [voices]);
  
  // Filter voices based on search, language, and category
  const filteredVoices = useMemo(() => {
    return voices.filter(voice => {
      // Search filter - safely handle missing fields
      const matchesSearch = searchQuery === "" || 
        (voice.name && voice.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (voice.description && voice.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Language filter - default to "all" if language is missing
      const matchesLanguage = languageFilter === "all" || 
        (voice.language && voice.language === languageFilter);
      
      // Category filter - safely handle missing premium field
      const matchesCategory = categoryFilter === "all" || 
        (categoryFilter === "premium" && voice.premium === true) ||
        (categoryFilter === "free" && (voice.premium === false || voice.premium === null));
      
      return matchesSearch && matchesLanguage && matchesCategory;
    });
  }, [voices, searchQuery, languageFilter, categoryFilter]);
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-display font-semibold text-lg text-gray-800">Available Voices</h2>
            <div className="relative">
              <Input
                placeholder="Search voices..."
                className="h-8 w-full pl-8 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[130px] h-8 text-sm">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="free">Free</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={languageFilter} onValueChange={setLanguageFilter}>
              <SelectTrigger className="w-[150px] h-8 text-sm">
                <SelectValue placeholder="All Languages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                {languages.map(lang => (
                  <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
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
          <>
            <div className="mt-2 text-sm text-gray-500 mb-1">
              {filteredVoices.length} voice{filteredVoices.length !== 1 ? 's' : ''} found
            </div>
            
            <ScrollArea className="h-full max-h-[400px] pr-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredVoices.map((voice) => (
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
                        {/* Use a microphone icon as default */}
                        <span className="text-xs">🎤</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800 text-sm">{voice.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{voice.description || "Natural sounding voice"}</p>
                        
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {voice.premium && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-secondary-100 text-secondary-800">
                              Premium
                            </span>
                          )}
                          {voice.language && (
                            <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                              {voice.language}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {filteredVoices.length === 0 && (
                <div className="py-8 text-center text-gray-500">
                  No voices found matching your criteria.
                  <div className="mt-2">
                    <button 
                      onClick={() => {
                        setSearchQuery("");
                        setLanguageFilter("all");
                        setCategoryFilter("all");
                      }}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Clear filters
                    </button>
                  </div>
                </div>
              )}
            </ScrollArea>
          </>
        )}
      </CardContent>
    </Card>
  );
}
