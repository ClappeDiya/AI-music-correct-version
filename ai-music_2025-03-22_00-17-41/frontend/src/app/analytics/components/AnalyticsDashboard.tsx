import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/componen../ui/card";
import { Progress } from "@/components/ui/Progress";
import { Calendar } from "@/components/ui/Calendar";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { AnalyticsData } from "@/app/api/analytics/route";
import { Play, Heart, User } from "lucide-react";
import { DateRange } from "react-day-picker";
import { useToast } from "@/components/ui/usetoast";

interface Genre {
  id: string;
  genre_name: string;
}

interface Region {
  id: string;
  region_name: string;
}

interface AnalyticsDashboardProps {
  initialData: AnalyticsData;
}

export function AnalyticsDashboard({ initialData }: AnalyticsDashboardProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [genres, setGenres] = useState<Genre[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(initialData);
  const { toast } = useToast();

  // Websocket connection
  useEffect(() => {
    const ws = new WebSocket(`ws://${window.location.host}/ws/analytics/`);

    ws.onopen = () => {
      console.log("WebSocket connection established");
    };

    ws.onmessage = (event) => {
      const newData = JSON.parse(event.data);
      setData(newData);
      toast({
        title: "Data Updated",
        description: "New analytics data received",
      });
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to real-time updates",
        variant: "destructive",
      });
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      ws.close();
    };
  }, [toast]);

  useEffect(() => {
    // Fetch genres and regions
    const fetchFilters = async () => {
      try {
        setLoading(true);
        const [genresRes, regionsRes] = await Promise.all([
          fetch("/api/v1/genres/"),
          fetch("/api/v1/regions/"),
        ]);
        const genresData = await genresRes.json();
        const regionsData = await regionsRes.json();
        setGenres(genresData);
        setRegions(regionsData);
      } catch (error) {
        console.error("Error fetching filters:", error);
        toast({
          title: "Error",
          description: "Failed to load filters",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFilters();
  }, [toast]);

  const engagementStats = [
    {
      name: "Plays",
      value: data.total_plays,
      icon: Play,
    },
    {
      name: "Likes",
      value: data.total_likes,
      icon: Heart,
    },
    {
      name: "Follows",
      value: data.total_follows,
      icon: User,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="col-span-2">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={setDateRange}
            numberOfMonths={2}
          />
        </div>
        <div>
          <Select value={selectedGenre} onValueChange={setSelectedGenre}>
            <SelectTrigger>
              <SelectValue placeholder="Select genre" />
            </SelectTrigger>
            <SelectContent>
              {genres.map((genre) => (
                <SelectItem key={genre.id} value={genre.id}>
                  {genre.genre_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger>
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              {regions.map((region) => (
                <SelectItem key={region.id} value={region.id}>
                  {region.region_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {engagementStats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listening Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total Listening Time</span>
              <span className="font-medium">
                {Math.floor(data.total_listening_time / 60)} minutes
              </span>
            </div>
            <Progress
              value={(data.total_listening_time / (24 * 60)) * 100}
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session Completion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Completion Rate</span>
              <span className="font-medium">
                {(
                  (data.sessions.filter((s) => s.status === "completed")
                    .length /
                    data.sessions.length) *
                  100
                ).toFixed(1)}
                %
              </span>
            </div>
            <Progress
              value={
                (data.sessions.filter((s) => s.status === "completed").length /
                  data.sessions.length) *
                100
              }
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Genres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.genres.slice(0, 5).map((genre, index) => (
              <div key={genre.name} className="flex justify-between">
                <span>{genre.name}</span>
                <span className="font-medium">
                  {(
                    (genre.count /
                      data.genres.reduce((sum, g) => sum + g.count, 0)) *
                    100
                  ).toFixed(1)}
                  %
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
