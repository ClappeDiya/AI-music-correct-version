"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
  BookOpen,
  Calendar,
  Clock,
  Filter,
  GraduationCap,
  RotateCcw,
  Search,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LearningHistoryEntry {
  id: number;
  type: "lesson" | "quiz" | "practice" | "achievement";
  title: string;
  date: string;
  duration?: number;
  score?: number;
  status: "completed" | "in_progress" | "reviewed";
  version?: string;
}

interface LearningHistoryProps {
  history: LearningHistoryEntry[];
  onRevisit: (entryId: number) => void;
}

export function LearningHistorySection({
  history,
  onRevisit,
}: LearningHistoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "lesson":
        return <BookOpen className="w-4 h-4" />;
      case "quiz":
        return <GraduationCap className="w-4 h-4" />;
      case "practice":
        return <Clock className="w-4 h-4" />;
      case "achievement":
        return <Star className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "reviewed":
        return "bg-blue-100 text-blue-800";
      default:
        return "";
    }
  };

  const filteredHistory = history.filter((entry) => {
    const matchesSearch = entry.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || entry.type === typeFilter;
    const matchesStatus =
      statusFilter === "all" || entry.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Learning History</h2>
        <Button variant="outline" size="sm">
          <Calendar className="w-4 h-4 mr-2" />
          Export History
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="lesson">Lessons</SelectItem>
                  <SelectItem value="quiz">Quizzes</SelectItem>
                  <SelectItem value="practice">Practice</SelectItem>
                  <SelectItem value="achievement">Achievements</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(entry.type)}
                      <span className="capitalize">{entry.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>{entry.title}</TableCell>
                  <TableCell>{formatDate(entry.date)}</TableCell>
                  <TableCell>
                    <Badge
                      className={cn("capitalize", getStatusColor(entry.status))}
                    >
                      {entry.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {entry.duration && (
                      <span>{formatDuration(entry.duration)}</span>
                    )}
                    {entry.score && <span>{entry.score}%</span>}
                    {entry.version && (
                      <span className="text-xs text-muted-foreground">
                        Version {entry.version}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRevisit(entry.id)}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
