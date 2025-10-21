import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useToast } from "@/components/ui/useToast";
import { History, Play, Calendar, Clock } from "lucide-react";
import { PlayHistory, Track } from '@/types/AiDj';
import { aiDjApi } from '@/lib/api/services/AiDj';

interface PlayHistoryProps {
  onPlay?: (track: Track) => void;
}

export function PlayHistoryView({ onPlay }: PlayHistoryProps) {
  const [history, setHistory] = useState<(PlayHistory & { track: Track })[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [timeFilter, setTimeFilter] = useState("all"); // all, today, week, month
  const { toast } = useToast();

  useEffect(() => {
    loadHistory();
  }, [timeFilter]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = {};
      
      // Add date filtering
      const now = new Date();
      if (timeFilter === "today") {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        params.played_at_after = today.toISOString();
      } else if (timeFilter === "week") {
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        params.played_at_after = weekAgo.toISOString();
      } else if (timeFilter === "month") {
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        params.played_at_after = monthAgo.toISOString();
      }

      const response = await aiDjApi.getPlayHistory(params);
      
      // Fetch track details for each history item
      const historyWithTracks = await Promise.all(
        response.results.map(async (item: PlayHistory) => {
          const track = await aiDjApi.getTrack(item.track);
          return { ...item, track };
        })
      );

      setHistory(historyWithTracks);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load play history",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <History className="h-5 w-5" />
          <h2 className="text-2xl font-bold">Play History</h2>
        </div>

        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">Past Week</SelectItem>
            <SelectItem value="month">Past Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Track</TableHead>
            <TableHead>Artist</TableHead>
            <TableHead>Album</TableHead>
            <TableHead>Played At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.track.title}</TableCell>
              <TableCell>{item.track.artist || '-'}</TableCell>
              <TableCell>{item.track.album || '-'}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(item.played_at)}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                {onPlay && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onPlay(item.track)}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
          {history.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                No play history found for the selected time range
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
} 

