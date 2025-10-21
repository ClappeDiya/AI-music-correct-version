import { useState, useEffect } from "react";
import {
  Edit2,
  Save,
  Clock,
  Trash2,
  History,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/useToast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Editor } from "@/components/ui/editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { lyricEditApi, lyricTimelineApi } from "@/services/LyricsGenerationApi";
import type {
  LyricDraft,
  LyricEdit,
  LyricTimeline,
} from "@/types/LyricsGeneration";
import { diffWords } from "diff";

interface LyricEditorProps {
  draft: LyricDraft;
  onSave?: () => void;
}

export function LyricEditor({ draft, onSave }: LyricEditorProps) {
  const [content, setContent] = useState(draft.draft_content || "");
  const [isEditing, setIsEditing] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [timeline, setTimeline] = useState<LyricTimeline[]>([]);
  const [edits, setEdits] = useState<LyricEdit[]>([]);
  const [selectedEdit, setSelectedEdit] = useState<LyricEdit | null>(null);
  const [thematicWarning, setThematicWarning] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load edit history when component mounts
    const loadEdits = async () => {
      try {
        const response = await lyricEditApi.getByDraft(draft.id);
        setEdits(response);
      } catch (error) {
        console.error("Failed to load edit history:", error);
      }
    };
    loadEdits();
  }, [draft.id]);

  const checkThematicChanges = (newContent: string) => {
    // Simple thematic analysis - can be enhanced with more sophisticated checks
    const originalWords = new Set(
      draft.draft_content?.toLowerCase().split(/\s+/) || [],
    );
    const newWords = new Set(newContent.toLowerCase().split(/\s+/));
    const commonWords = new Set(
      [...originalWords].filter((x) => newWords.has(x)),
    );
    const similarity =
      commonWords.size / Math.max(originalWords.size, newWords.size);

    if (similarity < 0.7) {
      setThematicWarning(
        "Significant changes detected from the original AI-generated lyrics. Consider if these changes maintain the intended theme and style.",
      );
    } else {
      setThematicWarning(null);
    }
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    checkThematicChanges(newContent);
  };

  const handleSave = async () => {
    try {
      const newEdit = await lyricEditApi.create({
        draft: draft.id,
        edited_content: content,
        edit_notes: thematicWarning
          ? "Major thematic changes made"
          : "Minor edits",
      });

      setEdits([...edits, newEdit]);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Lyrics saved successfully",
      });
      onSave?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save lyrics",
        variant: "destructive",
      });
    }
  };

  const handleRevert = (edit: LyricEdit) => {
    setContent(edit.edited_content);
    setSelectedEdit(null);
    setIsEditing(true);
    toast({
      title: "Info",
      description:
        "Reverted to previous version. Click Save to keep these changes.",
    });
  };

  const handleTimelineAdd = async (
    segment: string,
    startTime: number,
    endTime?: number,
  ) => {
    try {
      const newTimelineItem = await lyricTimelineApi.create({
        final_lyrics: draft.id,
        lyric_segment: segment,
        start_time_seconds: startTime,
        end_time_seconds: endTime,
      });
      setTimeline([...timeline, newTimelineItem]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add timeline entry",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between mb-4">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit2 className="w-4 h-4 mr-2" />
            {isEditing ? "Cancel" : "Edit"}
          </Button>
          {isEditing && (
            <Button size="sm" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHistory(true)}
          >
            <History className="w-4 h-4 mr-2" />
            History
          </Button>
        </div>
        <Dialog open={showTimeline} onOpenChange={setShowTimeline}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Clock className="w-4 h-4 mr-2" />
              Timeline
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Lyric Timeline</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {timeline.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.lyric_segment}</p>
                    <p className="text-sm text-gray-500">
                      {item.start_time_seconds}s - {item.end_time_seconds}s
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // TODO: Implement delete
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const segment = (
                    form.elements.namedItem("segment") as HTMLInputElement
                  ).value;
                  const startTime = parseFloat(
                    (form.elements.namedItem("startTime") as HTMLInputElement)
                      .value,
                  );
                  const endTime = parseFloat(
                    (form.elements.namedItem("endTime") as HTMLInputElement)
                      .value,
                  );
                  handleTimelineAdd(segment, startTime, endTime);
                  form.reset();
                }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="segment">Lyric Segment</Label>
                  <Input id="segment" name="segment" required />
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
                    />
                  </div>
                </div>
                <Button type="submit">Add Timeline Entry</Button>
              </form>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showHistory} onOpenChange={setShowHistory}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Edit History</DialogTitle>
              <DialogDescription>
                View and compare previous versions of your lyrics
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="list">
              <TabsList>
                <TabsTrigger value="list">List View</TabsTrigger>
                <TabsTrigger value="compare">Compare View</TabsTrigger>
              </TabsList>
              <TabsContent value="list">
                <ScrollArea className="h-[400px]">
                  {edits.map((edit, index) => (
                    <Card key={edit.id} className="p-4 mb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Version {index + 1}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(edit.created_at).toLocaleString()}
                          </p>
                          {edit.edit_notes && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Note: {edit.edit_notes}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRevert(edit)}
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Revert to This
                        </Button>
                      </div>
                    </Card>
                  ))}
                </ScrollArea>
              </TabsContent>
              <TabsContent value="compare">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Select
                      value={selectedEdit?.id.toString()}
                      onValueChange={(value) =>
                        setSelectedEdit(
                          edits.find((e) => e.id.toString() === value) || null,
                        )
                      }
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select version" />
                      </SelectTrigger>
                      <SelectContent>
                        {edits.map((edit, index) => (
                          <SelectItem key={edit.id} value={edit.id.toString()}>
                            Version {index + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedEdit && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">
                          Selected Version
                        </h4>
                        <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-md">
                          {selectedEdit.edited_content}
                        </pre>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-2">
                          Current Version
                        </h4>
                        <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-md">
                          {content}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {thematicWarning && (
        <Alert className="mb-4" variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{thematicWarning}</AlertDescription>
        </Alert>
      )}

      {isEditing ? (
        <Editor
          content={content}
          onChange={handleContentChange}
          className="min-h-[200px] prose prose-sm max-w-none"
        />
      ) : (
        <div className="prose prose-sm max-w-none">
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      )}
    </Card>
  );
}
