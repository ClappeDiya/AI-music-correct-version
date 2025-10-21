"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Pencil,
  Trash2,
  GraduationCap,
  Star,
  Users,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Educator } from '@/services/music_education/api";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { useState } from "react";

interface EducatorCardProps {
  educator: Educator;
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}

export function EducatorCard({
  educator,
  onEdit,
  onDelete,
  className,
}: EducatorCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
      <Card className={cn("transition-all hover:shadow-md", className)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <span>{educator.name}</span>
              {educator.isVerified && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Verified
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={onEdit}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <GraduationCap className="h-4 w-4" />
            <span>{educator.specialization}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Star className="h-4 w-4" />
              <span>{educator.rating.toFixed(1)} Rating</span>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{educator.studentCount} Students</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Joined {new Date(educator.joinedDate).toLocaleDateString()}</span>
          </div>

          {educator.bio && (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {educator.bio}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {educator.expertise.map((skill, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
              >
                {skill}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <DeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Educator"
        description="Are you sure you want to delete this educator? This action cannot be undone."
        onConfirm={onDelete}
      />
    </>
  );
} 

