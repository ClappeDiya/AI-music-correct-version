"use client";

import { useEffect, useState } from "react";
import { SubmissionForm } from "@/components/challenges/SubmissionForm";
import { LeaderboardTable } from "@/components/challenges/LeaderboardTable";
import { useToast } from "@/components/ui/usetoast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, Users, Music } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  participantCount: number;
  submissionCount: number;
  rules: string;
  prizes: string;
  isActive: boolean;
  isRegistered: boolean;
}

interface Submission {
  id: string;
  rank: number;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  title: string;
  votes: number;
  score: number;
  isWinner: boolean;
}

export default function ChallengePage({
  params,
}: {
  params: { challengeId: string };
}) {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    fetchChallenge();
    fetchSubmissions();
  }, [params.challengeId]);

  const fetchChallenge = async () => {
    try {
      const response = await fetch(`/api/challenges/${params.challengeId}`);
      if (!response.ok) throw new Error("Failed to fetch challenge");
      const data = await response.json();
      setChallenge(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load challenge details. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchSubmissions = async () => {
    try {
      const response = await fetch(
        `/api/challenges/${params.challengeId}/submissions`,
      );
      if (!response.ok) throw new Error("Failed to fetch submissions");
      const data = await response.json();
      setSubmissions(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load submissions. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleVote = async (submissionId: string) => {
    try {
      const response = await fetch(
        `/api/challenges/${params.challengeId}/submissions/${submissionId}/vote`,
        { method: "POST" },
      );

      if (!response.ok) throw new Error("Failed to vote");

      setUserVotes((prev) => new Set([...prev, submissionId]));
      setSubmissions((prev) =>
        prev.map((submission) =>
          submission.id === submissionId
            ? { ...submission, votes: submission.votes + 1 }
            : submission,
        ),
      );

      toast({
        title: "Success",
        description: "Your vote has been recorded.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to vote. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!challenge) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl">{challenge.title}</CardTitle>
              <CardDescription className="mt-2">
                {challenge.description}
              </CardDescription>
            </div>
            <Badge variant={challenge.isActive ? "default" : "secondary"}>
              {challenge.isActive ? "Active" : "Ended"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
              <Users className="h-4 w-4 opacity-70" />
              <span className="text-sm text-muted-foreground">
                {challenge.participantCount} participants
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Music className="h-4 w-4 opacity-70" />
              <span className="text-sm text-muted-foreground">
                {challenge.submissionCount} submissions
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
      </Card>

      <Tabs defaultValue="leaderboard" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger
            value="submit"
            disabled={!challenge.isActive || !challenge.isRegistered}
          >
            Submit
          </TabsTrigger>
          <TabsTrigger value="info">Info</TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard" className="space-y-6">
          <LeaderboardTable
            submissions={submissions}
            onVote={handleVote}
            userVotes={userVotes}
          />
        </TabsContent>

        <TabsContent value="submit">
          <SubmissionForm
            challengeId={params.challengeId}
            onSubmissionComplete={fetchSubmissions}
          />
        </TabsContent>

        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>Challenge Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert">
                <div dangerouslySetInnerHTML={{ __html: challenge.rules }} />
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Prizes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert">
                <div dangerouslySetInnerHTML={{ __html: challenge.prizes }} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
