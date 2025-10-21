"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/Select";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/Dialog";
import { 
  PeerTutoringMatch, 
  PeerTutoringRequest, 
  musicEducationApi 
} from '@/services/music_education/api';
import { toast } from "sonner";
import { 
  Users, 
  Plus, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  XCircle 
} from "lucide-react";

export function PeerTutoringSection() {
  const [matches, setMatches] = useState<PeerTutoringMatch[]>([]);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<PeerTutoringRequest>>({
    topic: "",
    description: "",
    preferredTime: "",
    skillLevel: "beginner",
    instrument: "",
    skill_level: "beginner",
    topics: [],
    availability: []
  });

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const response = await musicEducationApi.getPeerTutoringMatches();
      setMatches(response);
    } catch (error) {
      console.error("Failed to load peer tutoring matches:", error);
      toast.error("Failed to load peer tutoring matches");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await musicEducationApi.createPeerTutoringRequest(formData as PeerTutoringRequest);
      toast.success("Tutoring request submitted successfully");
      setShowRequestDialog(false);
      loadMatches();
      setFormData({
        topic: "",
        description: "",
        preferredTime: "",
        skillLevel: "beginner",
        instrument: "",
        skill_level: "beginner",
        topics: [],
        availability: []
      });
    } catch (error) {
      console.error("Failed to submit tutoring request:", error);
      toast.error("Failed to submit tutoring request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptMatch = async (matchId: number) => {
    try {
      await musicEducationApi.acceptPeerTutoringMatch(matchId);
      toast.success("Match accepted successfully");
      loadMatches();
    } catch (error) {
      console.error("Failed to accept match:", error);
      toast.error("Failed to accept match");
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-40 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Peer Tutoring</h2>
        </div>
        <Button onClick={() => setShowRequestDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Request Tutoring
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {matches.map((match) => (
          <Card key={match.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{match.topic}</span>
                {match.status === "pending" ? (
                  <Clock className="w-5 h-5 text-yellow-500" />
                ) : match.status === "accepted" ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {match.description}
              </p>
              <div className="flex justify-between text-sm">
                <span>Skill Level: {match.skillLevel}</span>
                <span>Preferred Time: {match.preferredTime}</span>
              </div>
              {match.status === "pending" && (
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAcceptMatch(match.id)}
                  >
                    Accept Match
                  </Button>
                  <Button size="sm">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                </div>
              )}
              {match.status === "accepted" && (
                <Button className="w-full">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Open Chat
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Peer Tutoring</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                value={formData.topic}
                onChange={(e) =>
                  setFormData({ ...formData, topic: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="skillLevel">Skill Level</Label>
                <Select
                  value={formData.skillLevel}
                  onValueChange={(value) =>
                    setFormData({ ...formData, skillLevel: value })
                  }
                >
                  <SelectTrigger id="skillLevel">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferredTime">Preferred Time</Label>
                <Input
                  id="preferredTime"
                  type="time"
                  value={formData.preferredTime}
                  onChange={(e) =>
                    setFormData({ ...formData, preferredTime: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowRequestDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
