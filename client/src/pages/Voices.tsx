import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Voice } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { TbMicrophone, TbLanguage, TbFilter, TbArrowRight } from "react-icons/tb";

interface VoiceFilter {
  language: string;
  gender: string;
  accent: string;
  category: string;
  searchTerm: string;
}

export default function Voices() {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [filters, setFilters] = useState<VoiceFilter>({
    language: "",
    gender: "",
    accent: "",
    category: "",
    searchTerm: "",
  });
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [availableFilters, setAvailableFilters] = useState({
    languages: new Set<string>(),
    genders: new Set<string>(),
    accents: new Set<string>(),
    categories: new Set<string>(),
  });
  
  const { data: voices, isLoading } = useQuery<Voice[]>({
    queryKey: ["/api/voices"],
  });
  
  useEffect(() => {
    if (voices && voices.length > 0) {
      // Extract all possible filter values from voices
      const languages = new Set<string>();
      const genders = new Set<string>();
      const accents = new Set<string>();
      const categories = new Set<string>();
      
      voices.forEach(voice => {
        if (voice.language) languages.add(voice.language);
        if (voice.gender) genders.add(voice.gender);
        if (voice.accent) accents.add(voice.accent);
        if (voice.category) categories.add(voice.category);
      });
      
      setAvailableFilters({
        languages,
        genders,
        accents,
        categories,
      });
    }
  }, [voices]);
  
  const filteredVoices = voices?.filter(voice => {
    // Apply all active filters
    return (!filters.language || voice.language === filters.language) &&
           (!filters.gender || voice.gender === filters.gender) &&
           (!filters.accent || voice.accent === filters.accent) &&
           (!filters.category || voice.category === filters.category) &&
           (!filters.searchTerm || 
            voice.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) || 
            (voice.description && voice.description.toLowerCase().includes(filters.searchTerm.toLowerCase())));
  });
  
  const playVoiceSample = (voice: Voice) => {
    setSelectedVoice(voice);
    
    // Generate a sample using text-to-speech since we don't have preview URLs yet
    toast({
      title: "Generating Sample",
      description: "Creating a voice sample for " + voice.name + "...",
    });
    
    fetch("/api/text-to-speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: "This is a sample of my voice. I hope you like how I sound.",
        voiceId: voice.id,
        stability: 50,
        clarity: 70
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error("Failed to generate sample");
      }
      return response.json();
    })
    .then(data => {
      if (!data.audio) {
        throw new Error("No audio data received");
      }
      
      // Create and play audio from base64
      const audioSrc = `data:audio/mp3;base64,${data.audio}`;
      const audio = new Audio(audioSrc);
      
      audio.play().catch(error => {
        console.error("Error playing audio:", error);
        throw new Error("Could not play the voice sample");
      });
      
      toast({
        title: "Playing Sample",
        description: "Now playing a sample of " + voice.name,
      });
    })
    .catch(error => {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Playback Error",
        description: error.message || "Could not play the voice sample.",
      });
    });
  };
  
  const handleFilterChange = (key: keyof VoiceFilter, value: string) => {
    setFilters({
      ...filters,
      [key]: value,
    });
  };
  
  const clearFilters = () => {
    setFilters({
      language: "",
      gender: "",
      accent: "",
      category: "",
      searchTerm: "",
    });
  };
  
  return (
    <div className="container mx-auto p-6 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Voice Library</CardTitle>
          <CardDescription>Browse and select from our collection of high-quality voices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search voices by name or description..."
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Select value={filters.language} onValueChange={(value) => handleFilterChange("language", value)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Languages</SelectItem>
                  {Array.from(availableFilters.languages).sort().map(language => (
                    <SelectItem key={language} value={language}>{language}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filters.gender} onValueChange={(value) => handleFilterChange("gender", value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Genders</SelectItem>
                  {Array.from(availableFilters.genders).map(gender => (
                    <SelectItem key={gender} value={gender}>{gender}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filters.accent} onValueChange={(value) => handleFilterChange("accent", value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Accent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Accents</SelectItem>
                  {Array.from(availableFilters.accents).map(accent => (
                    <SelectItem key={accent} value={accent}>{accent}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="icon" onClick={clearFilters} title="Clear filters">
                <TbFilter size={18} />
              </Button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {filteredVoices && filteredVoices.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredVoices.map((voice) => (
                    <Card 
                      key={voice.id} 
                      className={`overflow-hidden transition-all cursor-pointer hover:shadow-md ${selectedVoice?.id === voice.id ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => playVoiceSample(voice)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{voice.name}</h3>
                            {voice.premium && (
                              <Badge variant="secondary" className="mt-1">Premium</Badge>
                            )}
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={(e) => {
                              e.stopPropagation();
                              playVoiceSample(voice);
                            }}
                          >
                            <TbMicrophone size={18} />
                          </Button>
                        </div>
                        
                        <div className="mt-3 text-sm text-muted-foreground line-clamp-2">
                          {voice.description || "No description available"}
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mt-3">
                          {voice.language && (
                            <Badge variant="outline" className="text-xs">
                              <TbLanguage size={12} className="mr-1" />
                              {voice.language}
                            </Badge>
                          )}
                          {voice.accent && (
                            <Badge variant="outline" className="text-xs">
                              {voice.accent}
                            </Badge>
                          )}
                          {voice.gender && (
                            <Badge variant="outline" className="text-xs">
                              {voice.gender}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-md">
                  <h3 className="text-lg font-medium text-gray-700">No voices found</h3>
                  <p className="text-gray-500 mt-2">
                    Try adjusting your filters or search term
                  </p>
                  <Button className="mt-4" onClick={clearFilters}>Clear Filters</Button>
                </div>
              )}
            </>
          )}
        </CardContent>
        <CardFooter>
          <div className="text-sm text-muted-foreground">
            Showing {filteredVoices?.length || 0} of {voices?.length || 0} voices
          </div>
        </CardFooter>
      </Card>
      
      {selectedVoice && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedVoice.name}</CardTitle>
            <CardDescription>Voice Details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-muted-foreground">
                  {selectedVoice.description || "No description available"}
                </p>
                
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Language:</span>
                    <span className="text-sm">{selectedVoice.language || "Not specified"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Gender:</span>
                    <span className="text-sm">{selectedVoice.gender || "Not specified"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Accent:</span>
                    <span className="text-sm">{selectedVoice.accent || "Not specified"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Use Case:</span>
                    <span className="text-sm">{selectedVoice.useCase || "General"}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Voice Sample</h3>
                <div className="bg-gray-50 rounded-lg p-6 flex flex-col items-center">
                  <Button onClick={() => playVoiceSample(selectedVoice)}>
                    <TbMicrophone className="mr-2" />
                    Generate Sample
                  </Button>
                </div>
                
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Voice Characteristics</h3>
                  <ScrollArea className="h-[100px]">
                    <div className="space-y-2">
                      {selectedVoice.labels && (
                        <div className="flex flex-wrap gap-1">
                          {(() => {
                            try {
                              const labels = JSON.parse(selectedVoice.labels);
                              return Object.entries(labels).map(([key, value]) => (
                                <Badge key={key} variant="secondary" className="text-xs">
                                  {key}: {String(value)}
                                </Badge>
                              ));
                            } catch (error) {
                              console.error("Error parsing labels:", error);
                              return <span className="text-xs text-muted-foreground">No parsed labels available</span>;
                            }
                          })()}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">
              Create with This Voice
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}