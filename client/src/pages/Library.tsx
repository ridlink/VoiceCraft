import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { AudioGeneration, Voice } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import AudioPlayer from "@/components/AudioPlayer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { TbPlayerPlay, TbPlayerStop, TbDownload, TbTrash, TbDotsVertical } from "react-icons/tb";

export default function Library() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentAudio, setCurrentAudio] = useState<AudioGeneration | null>(null);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>("");
  const [voices, setVoices] = useState<Voice[]>([]);
  
  const { data: voicesData, isLoading: isLoadingVoices } = useQuery<Voice[]>({
    queryKey: ["/api/voices"],
  });
  
  const { data: userGenerations, isLoading: isLoadingGenerations } = useQuery<AudioGeneration[]>({
    queryKey: ["/api/user/generations"],
    enabled: !!user,
  });
  
  useEffect(() => {
    if (voicesData) {
      setVoices(voicesData);
    }
  }, [voicesData]);
  
  const deleteGenerationMutation = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/generations/${id}`, { method: "DELETE" });
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/generations"] });
      toast({
        title: "Generation deleted",
        description: "The audio has been deleted successfully.",
      });
      setSelectedRows([]);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to delete the generation: ${error.message}`,
      });
    },
  });
  
  const deleteMultipleGenerationsMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      // Delete multiple generations sequentially
      for (const id of ids) {
        await fetch(`/api/generations/${id}`, { method: "DELETE" });
      }
      return ids;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/generations"] });
      toast({
        title: "Generations deleted",
        description: `${selectedRows.length} audio files have been deleted.`,
      });
      setSelectedRows([]);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to delete generations: ${error.message}`,
      });
    },
  });
  
  const downloadGeneration = (generation: AudioGeneration) => {
    if (!generation.audioUrl) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No audio data available to download.",
      });
      return;
    }
    
    try {
      // If we have a direct URL to the audio file, use it
      if (generation.audioUrl.startsWith('http')) {
        const a = document.createElement("a");
        a.href = generation.audioUrl;
        a.download = `voicecraft-${generation.id}.${generation.format || 'mp3'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        // Fetch from server if needed
        fetch(`/api/generations/${generation.id}/download`)
          .then(response => response.blob())
          .then(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `voicecraft-${generation.id}.${generation.format || 'mp3'}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          })
          .catch(error => {
            throw error;
          });
      }
      
      toast({
        title: "Download Started",
        description: `Your audio file is being downloaded.`,
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "There was an error downloading the audio.",
      });
    }
  };
  
  const playAudio = (generation: AudioGeneration) => {
    setCurrentAudio(generation);
    setSelectedVoiceId(generation.voiceId);
  };
  
  const handleSelectAll = (checked: boolean) => {
    if (checked && userGenerations) {
      setSelectedRows(userGenerations.map(gen => gen.id));
    } else {
      setSelectedRows([]);
    }
  };
  
  const handleSelectRow = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedRows([...selectedRows, id]);
    } else {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    }
  };
  
  const filteredGenerations = userGenerations?.filter(generation => {
    return generation.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
           generation.voiceName?.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between gap-6">
        <div className="flex-1">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>My Audio Library</CardTitle>
                  <CardDescription>Browse and manage your generated audio files</CardDescription>
                </div>
                
                {selectedRows.length > 0 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <TbTrash className="mr-2" />
                        Delete Selected
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete {selectedRows.length} selected audio files.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteMultipleGenerationsMutation.mutate(selectedRows)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
              
              <div className="mt-4">
                <Input
                  placeholder="Search by text or voice name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-md"
                />
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingGenerations ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  {!filteredGenerations?.length ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-md">
                      <h3 className="text-lg font-medium text-gray-700">No audio files found</h3>
                      <p className="text-gray-500 mt-2">
                        {searchTerm 
                          ? "Try a different search term or clear your search" 
                          : "Generate your first audio on the home page"}
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">
                              <Checkbox 
                                checked={selectedRows.length === filteredGenerations.length && filteredGenerations.length > 0}
                                onCheckedChange={handleSelectAll}
                                aria-label="Select all"
                              />
                            </TableHead>
                            <TableHead>Text</TableHead>
                            <TableHead>Voice</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredGenerations.map((generation) => (
                            <TableRow key={generation.id}>
                              <TableCell>
                                <Checkbox 
                                  checked={selectedRows.includes(generation.id)}
                                  onCheckedChange={(checked) => handleSelectRow(generation.id, !!checked)}
                                  aria-label={`Select row ${generation.id}`}
                                />
                              </TableCell>
                              <TableCell className="max-w-xs truncate" title={generation.text}>
                                {generation.text.substring(0, 50)}
                                {generation.text.length > 50 ? "..." : ""}
                              </TableCell>
                              <TableCell>{generation.voiceName || "Unknown"}</TableCell>
                              <TableCell>
                                {generation.createdAt ? new Date(generation.createdAt).toLocaleDateString() : "Unknown date"}
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button size="icon" variant="ghost" onClick={() => playAudio(generation)} title="Play">
                                    <TbPlayerPlay size={18} />
                                  </Button>
                                  <Button size="icon" variant="ghost" onClick={() => downloadGeneration(generation)} title="Download">
                                    <TbDownload size={18} />
                                  </Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button size="icon" variant="ghost">
                                        <TbDotsVertical size={18} />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => downloadGeneration(generation)}>
                                        Download MP3
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        onClick={() => deleteGenerationMutation.mutate(generation.id)}
                                        className="text-red-600"
                                      >
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="w-full md:w-1/3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>Listen to your selected audio</CardDescription>
            </CardHeader>
            <CardContent>
              {currentAudio ? (
                <AudioPlayer 
                  audioData={currentAudio} 
                  selectedVoice={selectedVoiceId}
                  voices={voices}
                />
              ) : (
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                  <p className="text-gray-500">
                    Select an audio file to preview
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}