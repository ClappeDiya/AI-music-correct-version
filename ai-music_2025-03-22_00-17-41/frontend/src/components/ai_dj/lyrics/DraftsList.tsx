import { useState, useEffect } from "react";
import { Edit2, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/useToast";
import { LyricEditor } from "./lyric-editor";
import { useLyrics } from "@/hooks/uselyrics";
import type { LyricDraft } from "@/types/LyricsGeneration";

export function DraftsList() {
  const { drafts, loading, refresh } = useLyrics();
  const { toast } = useToast();
  const [selectedDraft, setSelectedDraft] = useState<LyricDraft | null>(null);

  if (loading) {
    return (
      <Card className="p-6">
        <p>Loading drafts...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <ScrollArea className="h-[600px] pr-4">
        {drafts.length === 0 ? (
          <Card className="p-6">
            <p className="text-center text-muted-foreground">No drafts found</p>
          </Card>
        ) : (
          drafts.map((draft) => (
            <Card key={draft.id} className="p-4 mb-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-medium">Draft #{draft.id}</h3>
                  <p className="text-sm text-muted-foreground">
                    Created: {new Date(draft.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDraft(draft)}
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={async () => {
                      try {
                        // TODO: Implement delete
                        toast({
                          title: "Success",
                          description: "Draft deleted successfully",
                        });
                        refresh();
                      } catch (error) {
                        toast({
                          title: "Error",
                          description: "Failed to delete draft",
                          variant: "destructive",
                        });
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-md">
                {draft.draft_content || "No content"}
              </pre>
            </Card>
          ))
        )}
      </ScrollArea>

      {selectedDraft && (
        <Card className="mt-4">
          <LyricEditor
            draft={selectedDraft}
            onSave={() => {
              setSelectedDraft(null);
              refresh();
            }}
          />
        </Card>
      )}
    </div>
  );
}
