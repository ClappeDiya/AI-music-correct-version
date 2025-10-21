// Replace missing imports
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Calendar, Plus, Video, Clock } from "lucide-react";
import { MentoringSession, Educator, musicEducationApi } from "@/services/music_education/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/Dialog";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { format } from "date-fns";
import { toast } from "sonner";
import { useMusicEducationAuth } from "@/contexts/MusicEducationAuthContext";
import { useEducatorsList, useMentoringSessionsList } from "@/hooks/useMusicEducationApi";

// Temporary MentoringSessionCard component
const MentoringSessionCard = ({ session, educators }: { session: MentoringSession; educators: Educator[] }) => {
  const educator = educators.find(e => e.id === session.educator);
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{educator?.name?.charAt(0) || 'E'}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-medium">{session.session_data?.topics?.[0] || 'Untitled Session'}</h3>
            <p className="text-sm text-muted-foreground">{educator?.name || 'Unknown Educator'}</p>
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(session.session_data?.scheduled_time || ''), 'PPP')}</span>
              <Clock className="ml-2 h-4 w-4" />
              <span>{format(new Date(session.session_data?.scheduled_time || ''), 'p')}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Define type-safe session_data to ensure required fields
type SessionData = {
  scheduled_time: string;
  topics: string[];
  notes?: string;
};

// Ensure MentoringSession partial with correct session_data type
type PartialMentoringSession = Partial<Omit<MentoringSession, 'session_data'>> & {
  session_data?: Partial<SessionData>;
};

// Temporary CreateMentoringSessionDialog component
const CreateMentoringSessionDialog = ({
  open,
  onOpenChange,
  onSuccess,
  educators
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  educators: Educator[];
}) => {
  const { syncAuthWithCookies } = useMusicEducationAuth();
  const [formData, setFormData] = useState<PartialMentoringSession>({
    educator: 0,
    session_data: {
      scheduled_time: '',
      topics: [],
      notes: ''
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Ensure all required fields are present before submission
      if (!formData.educator || !formData.session_data?.scheduled_time || !formData.session_data?.topics?.length) {
        toast.error("Please fill all required fields");
        return;
      }
      
      // Ensure authentication is synced before API call
      syncAuthWithCookies();
      
      // Create a complete session object for submission
      const sessionToSubmit: Partial<MentoringSession> = {
        ...formData,
        session_data: {
          scheduled_time: formData.session_data.scheduled_time,
          topics: formData.session_data.topics,
          notes: formData.session_data.notes
        }
      };
      
      await musicEducationApi.createMentoringSession(sessionToSubmit);
      onSuccess();
      setFormData({
        educator: 0,
        session_data: {
          scheduled_time: '',
          topics: [],
          notes: ''
        }
      });
      toast.success("Session scheduled successfully");
    } catch (error) {
      console.error("Failed to schedule session:", error);
      toast.error("Failed to schedule session");
    }
  };

  const handleTopicChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      session_data: {
        ...prev.session_data,
        topics: [value]
      }
    }));
  };

  const handleTimeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      session_data: {
        ...prev.session_data,
        scheduled_time: value
      }
    }));
  };

  const handleNotesChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      session_data: {
        ...prev.session_data,
        notes: value
      }
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Schedule Mentoring Session</DialogTitle>
          <DialogDescription>
            Create a new mentoring session with one of our educators.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic">Session Topic</Label>
            <Input
              id="topic"
              value={formData.session_data?.topics?.[0] || ''}
              onChange={(e) => handleTopicChange(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="educator">Educator</Label>
            <Select 
              value={formData.educator?.toString()} 
              onValueChange={(value) => setFormData({ ...formData, educator: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an educator" />
              </SelectTrigger>
              <SelectContent>
                {educators.map((educator) => (
                  <SelectItem key={educator.id} value={educator.id.toString()}>
                    {educator.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="scheduled_time">Date and Time</Label>
            <Input
              id="scheduled_time"
              type="datetime-local"
              value={formData.session_data?.scheduled_time || ''}
              onChange={(e) => handleTimeChange(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.session_data?.notes || ''}
              onChange={(e) => handleNotesChange(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="submit">Schedule Session</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export function MentoringSection() {
  const [showDialog, setShowDialog] = useState(false);
  
  // Use our specialized hooks for authentication-aware API calls
  const { 
    data: sessions, 
    isLoading: sessionsLoading, 
    refresh: refreshSessions, 
    isError: sessionsError 
  } = useMentoringSessionsList();
  
  const { 
    data: educators, 
    isLoading: educatorsLoading, 
    isError: educatorsError 
  } = useEducatorsList();
  
  // Handle dialog success
  const handleSuccess = () => {
    setShowDialog(false);
    refreshSessions();
  };

  if (sessionsLoading || educatorsLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Mentoring Sessions</h2>
        </div>
        <div className="flex items-center justify-center p-8">
          <p className="text-muted-foreground">Loading sessions...</p>
        </div>
      </div>
    );
  }

  if (sessionsError || educatorsError) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Mentoring Sessions</h2>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <p>Error loading sessions. Please try again later.</p>
              <Button onClick={refreshSessions} variant="outline" className="mt-4">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Mentoring Sessions</h2>
        <Button onClick={() => setShowDialog(true)} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Schedule Session
        </Button>
      </div>

      {sessions && sessions.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => (
            <MentoringSessionCard
              key={session.id}
              session={session}
              educators={educators || []}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <p>No mentoring sessions scheduled yet.</p>
              <Button onClick={() => setShowDialog(true)} variant="outline" className="mt-4">
                Schedule Your First Session
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <CreateMentoringSessionDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onSuccess={handleSuccess}
        educators={educators || []}
      />
    </div>
  );
}
