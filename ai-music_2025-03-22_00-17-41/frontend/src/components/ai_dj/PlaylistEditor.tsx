import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from "@/components/ui/useToast";
import {
  ListMusic,
  Heart,
  GripVertical,
  Save,
  X,
  Plus,
  ArrowUpDown,
} from "lucide-react";
import { Track, SavedSet } from '@/types/AiDj';
import { aiDjApi } from '@/lib/api/services/AiDj';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

interface PlaylistEditorProps {
  initialTracks?: Track[];
  savedSet?: SavedSet;
  onSave?: (savedSet: SavedSet) => void;
  onCancel?: () => void;
}

export function PlaylistEditor({
  initialTracks = [],
  savedSet,
  onSave,
  onCancel,
}: PlaylistEditorProps) {
  const [tracks, setTracks] = useState<Track[]>(initialTracks);
  const [setName, setSetName] = useState(savedSet?.set_name || "");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (savedSet?.track_list?.tracks) {
      loadTracksFromIds(savedSet.track_list.tracks);
    }
  }, [savedSet]);

  const loadTracksFromIds = async (trackIds: number[]) => {
    try {
      const loadedTracks = await Promise.all(
        trackIds.map((id) => aiDjApi.getTrack(id))
      );
      setTracks(loadedTracks);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load tracks",
        variant: "destructive",
      });
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(tracks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setTracks(items);
  };

  const handleRemoveTrack = (index: number) => {
    setTracks(tracks.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!setName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for your set",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const data = {
        set_name: setName,
        track_list: {
          tracks: tracks.map((t) => t.id),
          is_favorite: isFavorite,
        },
      };

      let savedSetResponse;
      if (savedSet?.id) {
        savedSetResponse = await aiDjApi.updateSavedSet(savedSet.id, data);
      } else {
        savedSetResponse = await aiDjApi.createSavedSet(data);
      }

      toast({
        title: "Success",
        description: "Set saved successfully",
      });

      if (onSave) {
        onSave(savedSetResponse);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save set",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <ListMusic className="h-5 w-5 mr-2" />
            <Input
              placeholder="Enter set name..."
              value={setName}
              onChange={(e) => setSetName(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFavorite(!isFavorite)}
          >
            <Heart
              className={`h-5 w-5 ${isFavorite ? "fill-current text-red-500" : ""}`}
            />
          </Button>
        </CardTitle>
        <CardDescription>
          Drag and drop tracks to reorder • {tracks.length} tracks
        </CardDescription>
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
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="flex items-center space-x-2 p-2 bg-muted rounded-lg"
                      >
                        <div {...provided.dragHandleProps}>
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{track.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {track.artist}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveTrack(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <div className="flex justify-end space-x-2 mt-4">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button onClick={handleSave} disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "Saving..." : "Save Set"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 

