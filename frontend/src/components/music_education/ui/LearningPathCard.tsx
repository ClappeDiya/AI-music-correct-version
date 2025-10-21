"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LearningPath, musicEducationApi } from '@/services/music_education/api";
import { Edit2, Trash2 } from "lucide-react";
import { EditLearningPathDialog } from "../dialogs/edit-learning-path-dialog";
import { DeleteDialog } from "@/components/common/delete-dialog";
import { toast } from "sonner";

interface LearningPathCardProps {
  path: LearningPath;
  onUpdate: () => void;
}

export function LearningPathCard({ path, onUpdate }: LearningPathCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    try {
      await musicEducationApi.deleteLearningPath(path.id);
      toast.success("Learning path deleted successfully");
      onUpdate();
    } catch (error) {
      console.error("Failed to delete learning path:", error);
      toast.error("Failed to delete learning path");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{path.path_name}</CardTitle>
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" onClick={() => setShowEditDialog(true)}>
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{path.description}</p>
      </CardContent>
      <CardFooter>
        <Button className="w-full" variant="secondary">
          View Path
        </Button>
      </CardFooter>

      <EditLearningPathDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        path={path}
        onSuccess={() => {
          setShowEditDialog(false);
          onUpdate();
        }}
      />

      <DeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        title="Delete Learning Path"
        description="Are you sure you want to delete this learning path? This action cannot be undone."
      />
    </Card>
  );
} 

