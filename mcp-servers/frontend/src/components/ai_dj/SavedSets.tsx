import { useState } from 'react';
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
import { ListMusic, Play, Edit, Trash2, Heart, Plus } from "lucide-react";
import { SavedSet, Track } from '@/types/AiDj';
import { aiDjApi } from '@/lib/api/services/AiDj';
import { PlaylistEditor } from "./PlaylistEditor";

interface SavedSetsProps {
  savedSets: SavedSet[];
  onPlay?: (set: SavedSet) => void;
  onEdit?: (set: SavedSet) => void;
  onDelete?: (set: SavedSet) => void;
  onUpdate?: () => void;
}

export function SavedSets({ savedSets, onPlay, onEdit, onDelete, onUpdate }: SavedSetsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [editingSet, setEditingSet] = useState<SavedSet | null>(null);
  const { toast } = useToast();

  const filteredSets = savedSets.filter(set => 
    set.set_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (set: SavedSet) => {
    try {
      await aiDjApi.deleteSavedSet(set.id);
      if (onDelete) {
        onDelete(set);
      }
      toast({
        title: "Success",
        description: "Set deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete set",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (set: SavedSet) => {
    setEditingSet(set);
    setShowEditor(true);
  };

  const handleEditorSave = async (savedSet: SavedSet) => {
    setShowEditor(false);
    setEditingSet(null);
    if (onUpdate) {
      onUpdate();
    }
  };

  const handleEditorCancel = () => {
    setShowEditor(false);
    setEditingSet(null);
  };

  if (showEditor) {
    return (
      <PlaylistEditor
        savedSet={editingSet}
        onSave={handleEditorSave}
        onCancel={handleEditorCancel}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ListMusic className="h-5 w-5" />
          <Input
            placeholder="Search saved sets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Button onClick={() => setShowEditor(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Set
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSets.map((set) => (
          <Card key={set.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{set.set_name || 'Untitled Set'}</span>
                {set.track_list?.is_favorite && (
                  <Heart className="h-4 w-4 fill-current text-red-500" />
                )}
              </CardTitle>
              <CardDescription>
                Created on {new Date(set.created_at).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {set.track_list?.tracks?.length || 0} tracks
                </p>
                <div className="flex justify-end space-x-2">
                  {onPlay && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onPlay(set)}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditClick(set)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(set)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 

