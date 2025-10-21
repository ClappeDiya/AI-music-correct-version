"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import { LearningPath, musicEducationApi } from "@/services/music_education/api";
import { LearningPathCard } from "../ui/learning-path-card";
import { CreateLearningPathDialog } from "../dialogs/create-learning-path-dialog";

export function LearningPathsSection() {
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    loadLearningPaths();
  }, []);

  const loadLearningPaths = async () => {
    try {
      const response = await musicEducationApi.getLearningPaths();
      setLearningPaths(response);
    } catch (error) {
      console.error("Failed to load learning paths:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Learning Paths</h2>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Learning Path
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-full mb-4"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {learningPaths.length > 0 ? (
            learningPaths.map((path) => (
              <LearningPathCard
                key={path.id}
                learningPath={path}
                onEdit={(learningPath: LearningPath) => {
                  // Handle edit
                  console.log("Edit path:", learningPath);
                }}
                onDelete={async (id: number) => {
                  try {
                    await musicEducationApi.deleteLearningPath(id);
                    loadLearningPaths();
                  } catch (error) {
                    console.error("Failed to delete learning path:", error);
                  }
                }}
                onView={(learningPath: LearningPath) => {
                  // Handle view
                  console.log("View path:", learningPath);
                }}
              />
            ))
          ) : (
            <div className="col-span-3 text-center p-6">
              <p className="text-muted-foreground">No learning paths available. Create your first learning path to get started.</p>
            </div>
          )}
        </div>
      )}

      <CreateLearningPathDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => {
          setShowCreateDialog(false);
          loadLearningPaths();
        }}
      />
    </div>
  );
}
