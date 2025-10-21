"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/componen../ui/card";
import { Trophy, Calendar, Users, Music } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ChallengeCardProps {
  challenge: {
    id: string;
    title: string;
    description: string;
    category: string;
    startDate: string;
    endDate: string;
    participantCount: number;
    submissionCount: number;
    isActive: boolean;
    isRegistered: boolean;
  };
  onRegister: (challengeId: string) => void;
  onViewDetails: (challengeId: string) => void;
}

export function ChallengeCard({
  challenge,
  onRegister,
  onViewDetails,
}: ChallengeCardProps) {
  const isOngoing = new Date(challenge.endDate) > new Date();

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl">{challenge.title}</CardTitle>
            <CardDescription>{challenge.description}</CardDescription>
          </div>
          <Badge variant={isOngoing ? "default" : "secondary"}>
            {isOngoing ? "Active" : "Ended"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 opacity-70" />
            <span className="text-sm text-muted-foreground">
              Ends{" "}
              {formatDistanceToNow(new Date(challenge.endDate), {
                addSuffix: true,
              })}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Music className="h-4 w-4 opacity-70" />
            <span className="text-sm text-muted-foreground">
              {challenge.submissionCount} submissions
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 opacity-70" />
            <span className="text-sm text-muted-foreground">
              {challenge.participantCount} participants
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Trophy className="h-4 w-4 opacity-70" />
            <span className="text-sm text-muted-foreground">
              {challenge.category}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => onViewDetails(challenge.id)}>
          View Details
        </Button>
        {isOngoing && (
          <Button
            variant={challenge.isRegistered ? "secondary" : "default"}
            onClick={() => onRegister(challenge.id)}
            disabled={challenge.isRegistered}
          >
            {challenge.isRegistered ? "Registered" : "Register Now"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
