"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Trophy, Star, ThumbsUp } from "lucide-react";

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

interface LeaderboardTableProps {
  submissions: Submission[];
  onVote: (submissionId: string) => void;
  userVotes: Set<string>;
}

export function LeaderboardTable({
  submissions,
  onVote,
  userVotes,
}: LeaderboardTableProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Trophy className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Trophy className="h-5 w-5 text-amber-700" />;
      default:
        return rank;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Rank</TableHead>
            <TableHead>Participant</TableHead>
            <TableHead>Submission</TableHead>
            <TableHead className="text-right">Score</TableHead>
            <TableHead className="text-right">Votes</TableHead>
            <TableHead className="w-24"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.map((submission) => (
            <TableRow key={submission.id}>
              <TableCell className="font-medium">
                <div className="flex items-center justify-center">
                  {getRankIcon(submission.rank)}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage
                      src={submission.user.avatar}
                      alt={submission.user.name}
                    />
                    <AvatarFallback>{submission.user.name[0]}</AvatarFallback>
                  </Avatar>
                  <span>{submission.user.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <span>{submission.title}</span>
                  {submission.isWinner && (
                    <Badge variant="secondary">
                      <Star className="h-3 w-3 mr-1" />
                      Winner
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">{submission.score}</TableCell>
              <TableCell className="text-right">{submission.votes}</TableCell>
              <TableCell>
                <button
                  onClick={() => onVote(submission.id)}
                  disabled={userVotes.has(submission.id)}
                  className={`flex items-center justify-center p-2 rounded-full transition-colors ${
                    userVotes.has(submission.id)
                      ? "bg-muted cursor-not-allowed"
                      : "hover:bg-muted cursor-pointer"
                  }`}
                >
                  <ThumbsUp
                    className={`h-4 w-4 ${
                      userVotes.has(submission.id)
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
