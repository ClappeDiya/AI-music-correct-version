import { useState } from "react";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import { tracksApi } from "@/lib/api/services";
import { Track, TrackFilters } from "@/lib/api/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import {
  Music,
  Search,
  Download,
  Info,
  Play,
  MoreVertical,
  Filter,
  Tag,
  Clock,
  User,
  Heart,
  Share2,
  Headphones,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { AudioPlayer } from "./audio-player";
import { TrackDetails } from "./track-details";
import { TrackAnalytics } from "./track-analytics";
import { Checkbox } from "@/components/ui/Checkbox";

const GENRE_OPTIONS = [
  "All Genres",
  "Rock",
  "Pop",
  "Jazz",
  "Classical",
  "Electronic",
  "Hip Hop",
  "Folk",
  "Ambient",
];

const MOOD_OPTIONS = [
  "All Moods",
  "Happy",
  "Sad",
  "Energetic",
  "Calm",
  "Epic",
  "Mysterious",
  "Romantic",
  "Dark",
];

const LICENSE_OPTIONS = [
  { value: "all", label: "All Licenses" },
  { value: "cc_by", label: "Creative Commons Attribution" },
  { value: "cc_by_sa", label: "CC Attribution-ShareAlike" },
  { value: "cc_by_nd", label: "CC Attribution-NoDerivs" },
  { value: "cc_by_nc", label: "CC Attribution-NonCommercial" },
  { value: "cc_by_nc_sa", label: "CC Attribution-NonCommercial-ShareAlike" },
  { value: "cc_by_nc_nd", label: "CC Attribution-NonCommercial-NoDerivs" },
  { value: "commercial", label: "Commercial License" },
];

interface SelectedTracks {
  [key: string]: boolean;
}

function TrackRow({
  track,
  selected,
  onSelect,
  onViewDetails,
  currentlyPlaying,
  onPlayStateChange,
}: {
  track: Track;
  selected: boolean;
  onSelect: (trackId: string, selected: boolean) => void;
  onViewDetails: (track: Track) => void;
  currentlyPlaying: boolean;
  onPlayStateChange: (trackId: string, isPlaying: boolean) => void;
}) {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <TableRow>
      <TableCell>
        <Checkbox
          checked={selected}
          onCheckedChange={(checked) => onSelect(track.id, checked as boolean)}
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          {currentlyPlaying ? (
            <AudioPlayer
              track={track}
              onPlayStateChange={(isPlaying) =>
                onPlayStateChange(track.id, isPlaying)
              }
            />
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPlayStateChange(track.id, true)}
            >
              <Play className="h-4 w-4" />
            </Button>
          )}
          <div>
            <div className="font-medium">{track.title}</div>
            <div className="text-sm text-muted-foreground">
              {track.composer_credits}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="flex items-center gap-1 w-fit">
          <Tag className="h-3 w-3" />
          {track.metadata.genre}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="flex items-center gap-1 w-fit">
          <Heart className="h-3 w-3" />
          {track.metadata.mood}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4 text-muted-foreground" />
          {formatDuration(track.metadata.duration)}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Headphones className="h-4 w-4 text-muted-foreground" />
          {track.play_count}
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(track.created_at), { addSuffix: true })}
        </div>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Download className="h-4 w-4 mr-2" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Info className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

export function TrackLibrary() {
  const [filters, setFilters] = useState<TrackFilters>({
    license_type: "all",
    genre: "All Genres",
    mood: "All Moods",
    search: "",
    is_public: true,
  });

  const [selectedTracks, setSelectedTracks] = useState<SelectedTracks>({});
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [selectedTrackDetails, setSelectedTrackDetails] =
    useState<Track | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const { data: tracksData, isLoading } = useApiQuery(["tracks", filters], () =>
    tracksApi.list({ params: filters }),
  );

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
  };

  const handleFilterChange = (key: keyof TrackFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleTrackSelection = (trackId: string, selected: boolean) => {
    setSelectedTracks((prev) => ({
      ...prev,
      [trackId]: selected,
    }));
  };

  const handlePlayStateChange = (trackId: string, isPlaying: boolean) => {
    if (isPlaying) {
      setCurrentlyPlaying(trackId);
    } else if (currentlyPlaying === trackId) {
      setCurrentlyPlaying(null);
    }
  };

  const handleBatchDownload = async () => {
    const selectedTrackIds = Object.entries(selectedTracks)
      .filter(([_, selected]) => selected)
      .map(([id]) => id);

    if (selectedTrackIds.length === 0) {
      // toast({
      //   title: 'No tracks selected',
      //   description: 'Please select at least one track to download.',
      //   variant: 'destructive',
      // });
      return;
    }

    try {
      // Create a zip file containing all selected tracks
      const response = await tracksApi.batchDownload(selectedTrackIds);

      // Create a download link and trigger the download
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "tracks.zip");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      // toast({
      //   title: 'Download started',
      //   description: `${selectedTrackIds.length} tracks will be downloaded as a zip file.`,
      // });
    } catch (error) {
      // toast({
      //   title: 'Download failed',
      //   description: 'Failed to download selected tracks. Please try again.',
      //   variant: 'destructive',
      // });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Track Library
          </CardTitle>
          <CardDescription>
            Discover and license music tracks from our library
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tracks..."
                    value={filters.search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:w-2/3">
                <div>
                  <Label htmlFor="license" className="sr-only">
                    License Type
                  </Label>
                  <Select
                    value={filters.license_type}
                    onValueChange={(value) =>
                      handleFilterChange("license_type", value)
                    }
                  >
                    <SelectTrigger id="license">
                      <SelectValue placeholder="Select License" />
                    </SelectTrigger>
                    <SelectContent>
                      {LICENSE_OPTIONS.map((license) => (
                        <SelectItem key={license.value} value={license.value}>
                          {license.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="genre" className="sr-only">
                    Genre
                  </Label>
                  <Select
                    value={filters.genre}
                    onValueChange={(value) =>
                      handleFilterChange("genre", value)
                    }
                  >
                    <SelectTrigger id="genre">
                      <SelectValue placeholder="Select Genre" />
                    </SelectTrigger>
                    <SelectContent>
                      {GENRE_OPTIONS.map((genre) => (
                        <SelectItem key={genre} value={genre}>
                          {genre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="mood" className="sr-only">
                    Mood
                  </Label>
                  <Select
                    value={filters.mood}
                    onValueChange={(value) => handleFilterChange("mood", value)}
                  >
                    <SelectTrigger id="mood">
                      <SelectValue placeholder="Select Mood" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOOD_OPTIONS.map((mood) => (
                        <SelectItem key={mood} value={mood}>
                          {mood}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {Object.values(selectedTracks).some(Boolean) && (
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="text-sm">
                  {Object.values(selectedTracks).filter(Boolean).length} tracks
                  selected
                </div>
                <Button onClick={handleBatchDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Selected
                </Button>
              </div>
            )}

            <ScrollArea className="h-[calc(100vh-20rem)] rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox
                        checked={
                          tracksData?.results.length > 0 &&
                          tracksData?.results.every(
                            (track) => selectedTracks[track.id],
                          )
                        }
                        onCheckedChange={(checked) => {
                          const newSelected: SelectedTracks = {};
                          tracksData?.results.forEach((track) => {
                            newSelected[track.id] = checked as boolean;
                          });
                          setSelectedTracks(newSelected);
                        }}
                      />
                    </TableHead>
                    <TableHead>Track</TableHead>
                    <TableHead>Genre</TableHead>
                    <TableHead>Mood</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Plays</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 7 }).map((_, j) => (
                          <TableCell key={j}>
                            <Skeleton className="h-6 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : tracksData?.results.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No tracks found
                      </TableCell>
                    </TableRow>
                  ) : (
                    tracksData?.results.map((track) => (
                      <TrackRow
                        key={track.id}
                        track={track}
                        selected={selectedTracks[track.id] || false}
                        onSelect={handleTrackSelection}
                        onViewDetails={() => setSelectedTrackDetails(track)}
                        currentlyPlaying={currentlyPlaying === track.id}
                        onPlayStateChange={handlePlayStateChange}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {selectedTrackDetails && (
        <TrackDetails
          track={selectedTrackDetails}
          open={!!selectedTrackDetails}
          onOpenChange={(open) => {
            if (!open) setSelectedTrackDetails(null);
          }}
        />
      )}

      {showAnalytics && selectedTrackDetails && (
        // <Dialog
        //   open={showAnalytics}
        //   onOpenChange={setShowAnalytics}
        // >
        //   <DialogContent className="max-w-4xl">
        //     <DialogHeader>
        //       <DialogTitle>Track Analytics</DialogTitle>
        //     </DialogHeader>
        //     <TrackAnalytics track={selectedTrackDetails} />
        //   </DialogContent>
        // </Dialog>
        <div></div>
      )}
    </div>
  );
}
