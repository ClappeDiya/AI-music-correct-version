import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from "@/components/ui/useToast";
import { Music, Play, ThumbsUp, ThumbsDown } from "lucide-react";
import { Track } from '@/types/AiDj';
import { aiDjApi } from '@/lib/api/services/AiDj';
import { formatDuration } from "@/lib/utils";

interface TrackListProps {
  tracks: Track[];
  onPlay?: (track: Track) => void;
  onFeedback?: (track: Track, type: 'like' | 'dislike') => void;
}

export function TrackList({ tracks, onPlay, onFeedback }: TrackListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const filteredTracks = tracks.filter(track => 
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (track.artist?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (track.album?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handlePlay = async (track: Track) => {
    try {
      if (onPlay) {
        onPlay(track);
      }
      await aiDjApi.createPlayHistory({ track: track.id });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update play history",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Music className="h-5 w-5" />
        <Input
          placeholder="Search tracks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Artist</TableHead>
            <TableHead>Album</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Genre</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTracks.map((track) => (
            <TableRow key={track.id}>
              <TableCell>{track.title}</TableCell>
              <TableCell>{track.artist || '-'}</TableCell>
              <TableCell>{track.album || '-'}</TableCell>
              <TableCell>{track.duration_seconds ? formatDuration(track.duration_seconds) : '-'}</TableCell>
              <TableCell>{track.genre || '-'}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handlePlay(track)}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  {onFeedback && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onFeedback(track, 'like')}
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onFeedback(track, 'dislike')}
                      >
                        <ThumbsDown className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 

