import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import type { AudioGeneration } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { Trash2 } from "lucide-react";

type RecentGenerationsProps = {
  generations: AudioGeneration[];
  onPlay: (generation: AudioGeneration) => void;
  onDownload?: (generation: AudioGeneration, format: string) => void;
  onDelete?: (generation: AudioGeneration) => void;
};

export default function RecentGenerations({ 
  generations, 
  onPlay,
  onDownload,
  onDelete
}: RecentGenerationsProps) {
  const formatDate = (date: Date | null) => {
    if (!date) return "Unknown time";
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-lg text-gray-800">Recent Generations</h2>
          <Button variant="link" className="text-sm p-0 h-auto">View All</Button>
        </div>
        
        {generations.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <p>No recent generations</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {generations.map((item) => (
              <div key={item.id} className="py-3 flex items-center gap-3">
                <Button
                  onClick={() => onPlay(item)}
                  variant="outline"
                  className="w-8 h-8 rounded-full p-0 flex-shrink-0"
                >
                  <i className="ri-play-line"></i>
                </Button>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-800 text-sm truncate">
                    {item.text.substring(0, 40) + (item.text.length > 40 ? "..." : "")}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-500">{item.voiceName}</span>
                    <span className="text-xs text-gray-400">{formatDate(item.createdAt)}</span>
                  </div>
                </div>
                
                {onDownload ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="text-gray-400 hover:text-gray-600 p-0 w-8 h-8"
                      >
                        <i className="ri-download-2-line"></i>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onDownload(item, "mp3")}>
                        <i className="ri-file-music-line mr-2"></i>
                        Download MP3
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDownload(item, "wav")}>
                        <i className="ri-file-music-line mr-2"></i>
                        Download WAV
                      </DropdownMenuItem>
                      
                      {onDelete && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => onDelete(item)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button 
                    variant="ghost" 
                    className="text-gray-400 hover:text-gray-600 p-0 w-8 h-8"
                    onClick={() => onPlay(item)}
                    title="Play first to enable download"
                  >
                    <i className="ri-download-2-line"></i>
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
