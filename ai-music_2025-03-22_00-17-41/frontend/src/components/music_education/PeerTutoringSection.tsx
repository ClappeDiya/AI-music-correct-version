"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { musicEducationApi } from '@/services/music_education_api";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { PeerTutoringCard } from "./ui/peer-tutoring-card";

interface PeerTutoringMatch {
  id: string;
  peer: {
    id: string;
    name: string;
    skill_level: string;
    instruments: string[];
  };
  topic: string;
  description: string;
  preferred_time: string;
  status: "pending" | "accepted" | "completed";
  created_at: string;
}

interface PeerTutoringRequest {
  topic: string;
  description: string;
  preferred_time: string;
  skill_level: string;
}

const SKILL_LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export function PeerTutoringSection() {
  const [matches, setMatches] = useState<PeerTutoringMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<PeerTutoringRequest>({
    topic: "",
    description: "",
    preferred_time: "",
    skill_level: "",
  });

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      setIsLoading(true);
      const data = await musicEducationApi.getPeerTutoringMatches();
      setMatches(data);
    } catch (error) {
      toast.error("Failed to load peer tutoring matches");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await musicEducationApi.createPeerTutoringRequest(formData);
      toast.success("Tutoring request submitted successfully");
      setShowRequestDialog(false);
      setFormData({
        topic: "",
        description: "",
        preferred_time: "",
        skill_level: "",
      });
      loadMatches();
    } catch (error) {
      toast.error("Failed to submit tutoring request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptMatch = async (matchId: string) => {
    try {
      await musicEducationApi.acceptPeerTutoringMatch(matchId);
      toast.success("Match accepted successfully");
      loadMatches();
    } catch (error) {
      toast.error("Failed to accept match");
    }
  };

  const handleMessage = (peerId: string) => {
    // TODO: Implement messaging functionality
    toast.info("Messaging feature coming soon!");
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-32" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Peer Tutoring</h2>
        <Button onClick={() => setShowRequestDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Request Tutoring
        </Button>
      </div>

      {matches.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No tutoring matches available. Create a request to get started!
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matches.map((match) => (
            <PeerTutoringCard
              key={match.id}
              match={match}
              onAccept={handleAcceptMatch}
              onMessage={handleMessage}
            />
          ))}
        </div>
      )}

      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Peer Tutoring</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Topic</Label>
              <Input
                placeholder="What would you like to learn?"
                value={formData.topic}
                onChange={(e) =>
                  setFormData({ ...formData, topic: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Provide more details about what you'd like to learn..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Preferred Time</Label>
              <Input
                type="datetime-local"
                value={formData.preferred_time}
                onChange={(e) =>
                  setFormData({ ...formData, preferred_time: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Your Skill Level</Label>
              <Select
                value={formData.skill_level}
                onValueChange={(value) =>
                  setFormData({ ...formData, skill_level: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your skill level" />
                </SelectTrigger>
                <SelectContent>
                  {SKILL_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 

