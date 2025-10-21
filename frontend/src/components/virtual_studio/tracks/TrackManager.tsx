"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Layers,
  Plus,
  GripVertical,
  Settings2,
  Trash2,
  Music2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { TrackForm } from "./track-form";
import { Badge } from "@/components/ui/Badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Track } from "@/types/virtual_studio";
import { virtualStudioApi } from "@/services/virtual_studio/api";

interface TrackManagerProps {
  sessionId: number;
  onTrackSelect?: (track: Track) => void;
}

export function TrackManager({ sessionId, onTrackSelect }: TrackManagerProps) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [isReordering, setIsReordering] = useState(false);

  useEffect(() => {
    loadTracks();
  }, [sessionId]);

  const loadTracks = async () => {
    try {
      const data = await virtualStudioApi.getTracks({ session: sessionId });
      setTracks(data.sort((a, b) => (a.position || 0) - (b.position || 0)));
    } catch (error) {
      console.error("Error loading tracks:", error);
    }
  };

  const handleCreateTrack = () => {
    setSelectedTrack(null);
    setIsDialogOpen(true);
  };

  const handleEditTrack = (track: Track) => {
    setSelectedTrack(track);
    setIsDialogOpen(true);
  };

  const handleDeleteTrack = async (track: Track) => {
    try {
      await virtualStudioApi.deleteTrack(track.id);
      loadTracks();
    } catch (error) {
      console.error("Error deleting track:", error);
    }
  };

  const handleTrackSubmit = async (data: Partial<Track>) => {
    try {
      if (selectedTrack) {
        await virtualStudioApi.updateTrack(selectedTrack.id, data);
      } else {
        await virtualStudioApi.createTrack({
          ...data,
          session: sessionId,
          position: tracks.length,
        });
      }
      setIsDialogOpen(false);
      loadTracks();
    } catch (error) {
      console.error("Error saving track:", error);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(tracks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setTracks(items);
    setIsReordering(true);

    try {
      // Update positions for all affected tracks
      await Promise.all(
        items.map((track, index) =>
          virtualStudioApi.updateTrack(track.id, { position: index }),
        ),
      );
    } catch (error) {
      console.error("Error updating track positions:", error);
    } finally {
      setIsReordering(false);
    }
  };

  const getTrackTypeColor = (type: string) => {
    switch (type) {
      case "audio":
        return "bg-blue-500";
      case "midi":
        return "bg-green-500";
      case "instrument":
        return "bg-purple-500";
      case "aux":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Tracks
          </CardTitle>
          <Button onClick={handleCreateTrack}>
            <Plus className="h-4 w-4 mr-2" />
            Add Track
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="tracks">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2"
              >
                {tracks.map((track, index) => (
                  <Draggable
                    key={track.id}
                    draggableId={track.id.toString()}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`
                          flex items-center gap-2 p-3 rounded-lg border
                          ${snapshot.isDragging ? "bg-muted border-primary" : "bg-card"}
                          ${onTrackSelect ? "cursor-pointer" : ""}
                          hover:bg-accent hover:text-accent-foreground
                          transition-colors
                        `}
                        onClick={() => onTrackSelect?.(track)}
                      >
                        <div
                          {...provided.dragHandleProps}
                          className="cursor-grab active:cursor-grabbing"
                        >
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                        </div>

                        <div className="flex-1 flex items-center gap-3">
                          <Music2 className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{track.track_name}</p>
                            <p className="text-sm text-muted-foreground">
                              Position: {track.position || index}
                            </p>
                          </div>
                        </div>

                        <Badge
                          className={`${getTrackTypeColor(track.track_type)} text-white`}
                        >
                          {track.track_type}
                        </Badge>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Settings2 className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEditTrack(track)}
                            >
                              Edit Track
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteTrack(track)}
                            >
                              Delete Track
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {tracks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No tracks yet. Click "Add Track" to create one.
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedTrack ? "Edit Track" : "Create Track"}
              </DialogTitle>
            </DialogHeader>
            <TrackForm
              sessionId={sessionId}
              initialData={selectedTrack || undefined}
              onSubmit={handleTrackSubmit}
              onCancel={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
