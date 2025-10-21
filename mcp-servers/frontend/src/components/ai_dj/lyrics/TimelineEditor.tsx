import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Music,
  Mic,
  GripVertical,
  Edit2,
  Trash2,
  Repeat,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/Badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useToast } from "@/components/ui/useToast";
import { lyricTimelineApi } from "@/services/LyricsGenerationApi";
import type { LyricTimeline } from "@/types/LyricsGeneration";

interface TimelineEditorProps {
  timeline: LyricTimeline[];
  trackDuration?: number;
  onTimelineUpdate: () => void;
}

const SEGMENT_TYPES = {
  verse: { label: "Verse", color: "bg-blue-500", icon: Mic },
  chorus: { label: "Chorus", color: "bg-purple-500", icon: Repeat },
  bridge: { label: "Bridge", color: "bg-orange-500", icon: BookOpen },
};

export function TimelineEditor({
  timeline,
  trackDuration,
  onTimelineUpdate,
}: TimelineEditorProps) {
  const [segments, setSegments] = useState<LyricTimeline[]>([]);
  const [editingSegment, setEditingSegment] = useState<LyricTimeline | null>(
    null,
  );
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setSegments(
      timeline.sort((a, b) => a.start_time_seconds - b.start_time_seconds),
    );
  }, [timeline]);

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(segments);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Calculate new timings based on position
    const updatedItems = items.map((item, index) => {
      const prevEnd = index > 0 ? items[index - 1].end_time_seconds : 0;
      const duration = item.end_time_seconds - item.start_time_seconds;
      return {
        ...item,
        start_time_seconds: prevEnd,
        end_time_seconds: prevEnd + duration,
      };
    });

    setSegments(updatedItems);

    try {
      // Update all affected segments
      await Promise.all(
        updatedItems.map((segment) =>
          lyricTimelineApi.update(segment.id, {
            start_time_seconds: segment.start_time_seconds,
            end_time_seconds: segment.end_time_seconds,
          }),
        ),
      );
      onTimelineUpdate();
      toast({
        title: "Success",
        description: "Timeline updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update timeline",
        variant: "destructive",
      });
    }
  };

  const handleEditSegment = async (formData: FormData) => {
    if (!editingSegment) return;

    const startTime = parseFloat(formData.get("startTime") as string);
    const endTime = parseFloat(formData.get("endTime") as string);
    const segmentType = formData.get(
      "segmentType",
    ) as keyof typeof SEGMENT_TYPES;
    const lyricSegment = formData.get("lyricSegment") as string;

    try {
      await lyricTimelineApi.update(editingSegment.id, {
        start_time_seconds: startTime,
        end_time_seconds: endTime,
        segment_type: segmentType,
        lyric_segment: lyricSegment,
      });
      onTimelineUpdate();
      setShowEditDialog(false);
      toast({
        title: "Success",
        description: "Segment updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update segment",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSegment = async (segmentId: number) => {
    try {
      await lyricTimelineApi.delete(segmentId);
      onTimelineUpdate();
      toast({
        title: "Success",
        description: "Segment deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete segment",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            <h3 className="font-medium">Timeline Editor</h3>
          </div>
          {trackDuration && (
            <Badge variant="secondary">
              Track Duration: {trackDuration.toFixed(1)}s
            </Badge>
          )}
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="timeline">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2"
              >
                {segments.map((segment, index) => {
                  const segmentType =
                    SEGMENT_TYPES[
                      segment.segment_type as keyof typeof SEGMENT_TYPES
                    ];
                  const Icon = segmentType?.icon || Mic;

                  return (
                    <Draggable
                      key={segment.id}
                      draggableId={segment.id.toString()}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`
                            flex items-center gap-2 p-3 rounded-lg border
                            ${snapshot.isDragging ? "bg-muted border-primary" : "bg-card"}
                            transition-colors
                          `}
                        >
                          <div
                            {...provided.dragHandleProps}
                            className="cursor-grab active:cursor-grabbing"
                          >
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                          </div>

                          <Badge
                            className={`${segmentType?.color || "bg-gray-500"} text-white`}
                          >
                            <Icon className="h-3 w-3 mr-1" />
                            {segmentType?.label || "Segment"}
                          </Badge>

                          <div className="flex-1">
                            <p className="font-medium">
                              {segment.lyric_segment}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {segment.start_time_seconds}s -{" "}
                              {segment.end_time_seconds}s
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingSegment(segment);
                                setShowEditDialog(true);
                              }}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteSegment(segment.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {segments.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No timeline segments found. Add segments to start organizing your
            lyrics.
          </div>
        )}
      </Card>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Segment</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleEditSegment(new FormData(e.currentTarget));
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="lyricSegment">Lyric Segment</Label>
              <Input
                id="lyricSegment"
                name="lyricSegment"
                defaultValue={editingSegment?.lyric_segment}
                required
              />
            </div>

            <div>
              <Label htmlFor="segmentType">Segment Type</Label>
              <Select
                name="segmentType"
                defaultValue={editingSegment?.segment_type || "verse"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select segment type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SEGMENT_TYPES).map(([value, { label }]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Start Time (s)</Label>
                <Input
                  id="startTime"
                  name="startTime"
                  type="number"
                  step="0.1"
                  min="0"
                  defaultValue={editingSegment?.start_time_seconds}
                  required
                />
              </div>
              <div>
                <Label htmlFor="endTime">End Time (s)</Label>
                <Input
                  id="endTime"
                  name="endTime"
                  type="number"
                  step="0.1"
                  min="0"
                  defaultValue={editingSegment?.end_time_seconds}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
