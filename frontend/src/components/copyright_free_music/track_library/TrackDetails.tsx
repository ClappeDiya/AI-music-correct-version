import { useState } from "react";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import { Track, TrackDetails } from "@/lib/api/types";
import { WaveformPlayer } from "./waveform-player";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import {
  Music,
  User,
  Clock,
  Tag,
  Heart,
  BarChart,
  License,
  FileText,
  Share2,
  Download,
  Globe,
  Info,
  AlertTriangle,
  Mic2,
  Settings,
  Link,
  ExternalLink,
  Hash,
  Calendar,
  MapPin,
  Radio,
  Waveform,
  FileAudio,
  Languages,
  AlertOctagon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface TrackDetailsProps {
  track: Track;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TrackDetails({ track, open, onOpenChange }: TrackDetailsProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isPlaying, setIsPlaying] = useState(false);

  const { data: trackDetails } = useApiQuery(["track-details", track.id], () =>
    tracksApi.getDetails(track.id),
  );

  const formatFileSize = (bytes: number) => {
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            {track.title}
          </SheetTitle>
          <SheetDescription>
            Track details and licensing information
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <WaveformPlayer
            track={track}
            onPlayStateChange={setIsPlaying}
            className="mb-6"
          />

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="technical">Technical</TabsTrigger>
              <TabsTrigger value="legal">Legal</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Track Information</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Composer</span>
                      </div>
                      <p className="text-sm">
                        {trackDetails?.composer_details.name}
                      </p>
                      {trackDetails?.composer_details.website && (
                        <a
                          href={trackDetails.composer_details.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          <Globe className="h-3 w-3" />
                          Website
                        </a>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          Genre & Mood
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="secondary">
                          {track.metadata.genre}
                        </Badge>
                        <Badge variant="secondary">{track.metadata.mood}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Duration</span>
                      </div>
                      <p className="text-sm font-medium">
                        {Math.floor(track.metadata.duration / 60)}:
                        {(track.metadata.duration % 60)
                          .toString()
                          .padStart(2, "0")}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <BarChart className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">BPM</span>
                      </div>
                      <p className="text-sm font-medium">
                        {track.metadata.bpm}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Waveform className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Key</span>
                      </div>
                      <p className="text-sm font-medium">
                        {track.metadata.key}
                      </p>
                    </div>
                  </div>

                  {track.metadata.instruments?.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Radio className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Instruments</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {track.metadata.instruments.map((instrument) => (
                          <Badge key={instrument} variant="outline">
                            {instrument}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {track.metadata.tags?.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Tags</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {track.metadata.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Credits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {track.metadata.recording_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Recorded:{" "}
                        {new Date(
                          track.metadata.recording_date,
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {track.metadata.recording_location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Location: {track.metadata.recording_location}
                      </span>
                    </div>
                  )}
                  {track.metadata.studio_credits && (
                    <div className="flex items-center gap-2">
                      <Mic2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Studio: {track.metadata.studio_credits}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="technical" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Technical Specifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FileAudio className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          Audio Format
                        </span>
                      </div>
                      <p className="text-sm">
                        {trackDetails?.technical_requirements?.file_format}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Quality</span>
                      </div>
                      <p className="text-sm">
                        {trackDetails?.technical_requirements?.sample_rate}Hz /
                        {trackDetails?.technical_requirements?.bit_depth}-bit
                      </p>
                    </div>
                  </div>

                  {trackDetails?.technical_requirements?.compatible_daws && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          Compatible DAWs
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {trackDetails.technical_requirements.compatible_daws.map(
                          (daw) => (
                            <Badge key={daw} variant="outline">
                              {daw}
                            </Badge>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">File Details</span>
                    </div>
                    <p className="text-sm">
                      Size:{" "}
                      {formatFileSize(
                        trackDetails?.technical_requirements?.file_size || 0,
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="legal" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Legal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <License className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Copyright</span>
                    </div>
                    <p className="text-sm">
                      {trackDetails?.legal_info.copyright_year}{" "}
                      {trackDetails?.legal_info.copyright_holder}
                    </p>
                  </div>

                  {trackDetails?.legal_info.usage_restrictions.length > 0 && (
                    <Accordion type="single" collapsible>
                      <AccordionItem value="restrictions">
                        <AccordionTrigger className="text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                            Usage Restrictions
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul className="list-disc list-inside space-y-2">
                            {trackDetails.legal_info.usage_restrictions.map(
                              (restriction, index) => (
                                <li key={index} className="text-sm">
                                  {restriction}
                                </li>
                              ),
                            )}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}

                  {trackDetails?.legal_info.disclaimers.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <AlertOctagon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Disclaimers</span>
                      </div>
                      <ul className="list-disc list-inside space-y-2">
                        {trackDetails.legal_info.disclaimers.map(
                          (disclaimer, index) => (
                            <li
                              key={index}
                              className="text-sm text-muted-foreground"
                            >
                              {disclaimer}
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
