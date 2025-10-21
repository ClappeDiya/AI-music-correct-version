"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MentoringSession, Educator, musicEducationApi } from '@/services/music_education/api";
import { Edit2, Trash2, Calendar, User, MessageCircle } from "lucide-react";
import { EditMentoringSessionDialog } from "../dialogs/edit-mentoring-session-dialog";
import { DeleteDialog } from "@/components/common/delete-dialog";
import { SessionChat } from "./session-chat";
import { toast } from "sonner";
import { format } from "date-fns";

interface MentoringSessionCardProps {
  session: MentoringSession;
  educator?: Educator;
  onUpdate: () => void;
}

export function MentoringSessionCard({ session, educator, onUpdate }: MentoringSessionCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const handleDelete = async () => {
    try {
      await musicEducationApi.deleteMentoringSession(session.id);
      toast.success("Session deleted successfully");
      onUpdate();
    } catch (error) {
      console.error("Failed to delete session:", error);
      toast.error("Failed to delete session");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-xl">Session with {educator?.name}</CardTitle>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 mr-1" />
              {format(new Date(session.session_data.scheduled_time), "PPp")}
            </div>
          </div>
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
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Topics</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground">
              {session.session_data.topics.map((topic, index) => (
                <li key={index}>{topic}</li>
              ))}
            </ul>
          </div>
          {session.session_data.notes && (
            <div>
              <h4 className="font-medium mb-2">Notes</h4>
              <p className="text-sm text-muted-foreground">{session.session_data.notes}</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="secondary"
          onClick={() => setShowChat(!showChat)}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          {showChat ? "Hide Chat" : "Show Chat"}
        </Button>
        <Button
          variant="default"
          onClick={() => window.open(session.session_data.meeting_url, "_blank")}
        >
          Join Session
        </Button>
      </CardFooter>

      {showChat && (
        <CardContent className="pt-0">
          <SessionChat
            sessionId={session.id}
            sessionType="mentoring"
            participants={[
              {
                id: session.user_id,
                name: "You",
              },
              {
                id: educator?.id || "",
                name: educator?.name || "Educator",
                avatar: educator?.avatar,
              },
            ]}
          />
        </CardContent>
      )}

      <EditMentoringSessionDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        session={session}
        educator={educator}
        onSuccess={() => {
          setShowEditDialog(false);
          onUpdate();
        }}
      />

      <DeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        title="Delete Session"
        description="Are you sure you want to delete this mentoring session? This action cannot be undone."
      />
    </Card>
  );
} 

