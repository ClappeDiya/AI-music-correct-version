"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { LearningPath } from '@/types/music_education';
import { musicEducationApi } from '@/services/music_education/api';
import { Book, CheckCircle, Clock, FileText } from "lucide-react";
import { Input } from '@/components/ui/Input';
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { LearningPathCard } from "../cards/learning-path-card";
import { CreateLearningPathDialog } from "../dialogs/create-learning-path-dialog";
import { EditLearningPathDialog } from "../dialogs/edit-learning-path-dialog";

export function LearningPathSection({ id }: { id: number }) {
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);

  const loadLearningPaths = async () => {
    try {
      setIsLoading(true);
      const paths = await musicEducationApi.getLearningPaths();
      setLearningPaths(paths);
    } catch (error) {
      toast.error("Failed to load learning paths");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLearningPaths();
  }, []);

  const handleCreateSuccess = () => {
    setShowCreateDialog(false);
    loadLearningPaths();
    toast.success("Learning path created successfully");
  };

  const handleEditSuccess = () => {
    setSelectedPath(null);
    loadLearningPaths();
    toast.success("Learning path updated successfully");
  };

  const handleDelete = async (pathId: string) => {
    try {
      await musicEducationApi.deleteLearningPath(pathId);
      loadLearningPaths();
      toast.success("Learning path deleted successfully");
    } catch (error) {
      toast.error("Failed to delete learning path");
    }
  };

  const filteredPaths = learningPaths.filter((path) =>
    path.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="w-64 h-10 bg-muted rounded animate-pulse" />
          <div className="w-32 h-10 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search learning paths..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Learning Path
        </Button>
      </div>

      {filteredPaths.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            {searchQuery
              ? "No learning paths found matching your search"
              : "No learning paths available. Create one to get started!"}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPaths.map((path) => (
            <LearningPathCard
              key={path.id}
              learningPath={path}
              onEdit={() => setSelectedPath(path)}
              onDelete={() => handleDelete(path.id)}
            />
          ))}
        </div>
      )}

      <CreateLearningPathDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handleCreateSuccess}
      />

      {selectedPath && (
        <EditLearningPathDialog
          open={true}
          onOpenChange={() => setSelectedPath(null)}
          learningPath={selectedPath}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
} 
