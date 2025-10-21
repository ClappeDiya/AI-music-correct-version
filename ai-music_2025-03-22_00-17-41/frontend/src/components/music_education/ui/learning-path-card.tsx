"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LearningPath } from "@/services/music_education/api";
import { Edit, Trash2, BookOpen } from "lucide-react";

interface LearningPathCardProps {
  learningPath: LearningPath;
  onEdit?: (learningPath: LearningPath) => void;
  onDelete?: (id: number) => void;
  onView?: (learningPath: LearningPath) => void;
}

export function LearningPathCard({
  learningPath,
  onEdit,
  onDelete,
  onView
}: LearningPathCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle>{learningPath.path_name}</CardTitle>
      </CardHeader>
      <CardContent>
        {learningPath.description && (
          <p className="text-sm text-muted-foreground mb-4">{learningPath.description}</p>
        )}
        
        <div className="flex justify-end space-x-2 mt-4">
          {onView && (
            <Button variant="ghost" size="sm" onClick={() => onView(learningPath)}>
              <BookOpen className="h-4 w-4 mr-1" />
              View
            </Button>
          )}
          {onEdit && (
            <Button variant="ghost" size="sm" onClick={() => onEdit(learningPath)}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
          {onDelete && (
            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => onDelete(learningPath.id)}>
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
