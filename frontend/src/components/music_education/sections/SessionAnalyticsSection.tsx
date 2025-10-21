"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Progress } from "@/components/ui/Progress";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { LineChart } from "@/components/ui/LineChart";

// Recharts Components
import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  Legend, 
  Pie, 
  PieChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from "recharts";

// Icons
import { 
  Calendar, 
  Star, 
  Clock, 
  Users, 
  TrendingUp,
  ChevronRight 
} from "lucide-react";

// Services and Utilities
import { musicEducationApi } from '@/services/music_education/api';
import { cn } from "@/lib/utils";

interface SessionAnalytics {
  overview: {
    totalSessions: number;
    completedSessions: number;
    averageRating: number;
    totalHours: number;
    activeUsers: number;
  };
  mentoring: {
    totalMentors: number;
    averageMentorRating: number;
    popularTopics: Array<{ topic: string; count: number }>;
    sessionsByMonth: Array<{ month: string; sessions: number }>;
    completionRate: number;
  };
  peerTutoring: {
    totalPeers: number;
    averagePeerRating: number;
    matchRate: number;
    activeGroups: number;
    topSkillLevels: Array<{ level: string; count: number }>;
  };
  recentActivity: Array<{
    id: string;
    type: "mentoring" | "peer";
    title: string;
    date: string;
    status: string;
    rating?: number;
  }>;
}

export function SessionAnalyticsSection() {
  const [analytics, setAnalytics] = useState<SessionAnalytics | null>(null);
  const [timeframe, setTimeframe] = useState<"week" | "month" | "year">("month");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await musicEducationApi.getSessionAnalytics(timeframe);
        setAnalytics(response);
      } catch (error) {
        console.error("Failed to fetch session analytics:", error);
        // Handle error appropriately
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timeframe]);

  if (isLoading || !analytics) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/4" />
            </CardHeader>
            <CardContent>
              <div className="h-40 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Session Analytics</h2>
        <Select value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Past Week</SelectItem>
            <SelectItem value="month">Past Month</SelectItem>
            <SelectItem value="year">Past Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm font-medium">
              <Calendar className="w-4 h-4 mr-2 text-primary" />
              Total Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalSessions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.overview.completedSessions} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm font-medium">
              <Star className="w-4 h-4 mr-2 text-yellow-500" />
              Average Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.averageRating.toFixed(1)}</div>
            <Progress
              value={analytics.overview.averageRating * 20}
              className="h-1 mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm font-medium">
              <Clock className="w-4 h-4 mr-2 text-blue-500" />
              Total Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalHours}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Learning time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-sm font-medium">
              <Users className="w-4 h-4 mr-2 text-green-500" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.activeUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              This {timeframe}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="mentoring" className="space-y-4">
        <TabsList>
          <TabsTrigger value="mentoring">Mentoring</TabsTrigger>
          <TabsTrigger value="peer">Peer Tutoring</TabsTrigger>
        </TabsList>

        <TabsContent value="mentoring" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Session Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <LineChart
                    data={analytics.mentoring.sessionsByMonth}
                    title="Sessions per Month"
                    lines={[
                      {
                        name: "Sessions",
                        dataKey: "sessions",
                        stroke: "#2563eb",
                      },
                    ]}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Popular Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {analytics.mentoring.popularTopics.map((topic, index) => (
                      <div
                        key={topic.topic}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">
                            {topic.topic}
                          </span>
                        </div>
                        <Badge variant="outline">{topic.count} sessions</Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mentor Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Average Rating</p>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span>{analytics.mentoring.averageMentorRating.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Completion Rate</p>
                    <div className="flex items-center">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span>{(analytics.mentoring.completionRate * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Total Mentors</p>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 text-blue-500 mr-1" />
                      <span>{analytics.mentoring.totalMentors}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="peer" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Peer Tutoring Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Match Rate</p>
                      <div className="flex items-center">
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        <span>{(analytics.peerTutoring.matchRate * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Active Groups</p>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 text-blue-500 mr-1" />
                        <span>{analytics.peerTutoring.activeGroups}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Skill Level Distribution</h4>
                    {analytics.peerTutoring.topSkillLevels.map((level) => (
                      <div key={level.level} className="mb-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>{level.level}</span>
                          <span>{level.count} users</span>
                        </div>
                        <Progress
                          value={(level.count / analytics.peerTutoring.totalPeers) * 100}
                          className="h-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {analytics.recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start justify-between"
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{activity.title}</p>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant="outline"
                              className={cn(
                                "capitalize",
                                activity.type === "mentoring"
                                  ? "bg-blue-500/10 text-blue-500"
                                  : "bg-green-500/10 text-green-500"
                              )}
                            >
                              {activity.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(activity.date), "MMM d, h:mm a")}
                            </span>
                          </div>
                        </div>
                        {activity.rating && (
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-500 mr-1" />
                            <span className="text-sm">{activity.rating}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
