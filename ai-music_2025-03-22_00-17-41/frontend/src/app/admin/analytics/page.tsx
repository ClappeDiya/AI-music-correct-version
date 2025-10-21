"use client";

import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { Download, Users, Music, RefreshCw, TrendingUp } from "lucide-react";
import { useAnalyticsData, useGenreTrends, useGeographicInsights } from "@/services/DataAnalyticsService";

// In a real app, we would import a charting library like Chart.js or Recharts
// For this example, we'll just create placeholder components

function BarChart() {
  return (
    <div className="w-full h-64 bg-muted/30 rounded-lg flex items-center justify-center">
      <div className="text-muted-foreground">
        Bar Chart Visualization
        <div className="flex space-x-4 mt-4">
          <div className="w-8 h-32 bg-primary rounded-t-md"></div>
          <div className="w-8 h-20 bg-primary rounded-t-md"></div>
          <div className="w-8 h-40 bg-primary rounded-t-md"></div>
          <div className="w-8 h-24 bg-primary rounded-t-md"></div>
          <div className="w-8 h-36 bg-primary rounded-t-md"></div>
          <div className="w-8 h-16 bg-primary rounded-t-md"></div>
          <div className="w-8 h-28 bg-primary rounded-t-md"></div>
        </div>
      </div>
    </div>
  );
}

function LineChart() {
  return (
    <div className="w-full h-64 bg-muted/30 rounded-lg flex items-center justify-center">
      <div className="text-muted-foreground">
        Line Chart Visualization
        <div className="relative h-32 w-full mt-4">
          <svg className="w-full h-full">
            <path 
              d="M0,50 Q50,10 100,40 T200,30 T300,60" 
              stroke="hsl(var(--primary))" 
              fill="none" 
              strokeWidth="3"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

function PieChart() {
  return (
    <div className="w-full h-64 bg-muted/30 rounded-lg flex items-center justify-center">
      <div className="text-muted-foreground">
        Pie Chart Visualization
        <div className="mt-4 relative h-32 w-32">
          <div className="absolute inset-0 rounded-full bg-primary/20 overflow-hidden">
            <div className="absolute h-full w-1/2 bg-primary origin-right"></div>
            <div className="absolute h-full w-1/3 bg-blue-500 origin-bottom-left" style={{ transform: 'rotate(180deg)' }}></div>
            <div className="absolute h-full w-1/6 bg-green-500 origin-bottom-right" style={{ transform: 'rotate(300deg)' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DataAnalytics() {
  const [timeRange, setTimeRange] = useState("30d");
  const [isLoading, setIsLoading] = useState(false);
  const [analyticsFilters, setAnalyticsFilters] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  
  // Use real data services where available
  const { data: analyticsData, isLoading: isAnalyticsLoading } = useAnalyticsData(analyticsFilters);
  const { data: genreTrends, isLoading: isGenreTrendsLoading } = useGenreTrends();
  const { data: geoInsights, isLoading: isGeoInsightsLoading } = useGeographicInsights();
  
  // Stats would come from an API in a real application
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalTracks: 0,
    activeTracks: 0,
    totalListens: 0,
    averageSession: 0,
    retention: 0,
    conversion: 0,
  });
  
  // Update time range filter
  useEffect(() => {
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    setAnalyticsFilters({
      startDate: startDate.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0]
    });
  }, [timeRange]);
  
  // Set mock data when real data is not available
  useEffect(() => {
    // In real app, this would fetch from the API
    setStats({
      totalUsers: 12500,
      activeUsers: 8750,
      totalTracks: 45200,
      activeTracks: 32100,
      totalListens: 1250000,
      averageSession: 28.5,
      retention: 72.4,
      conversion: 8.2,
    });
  }, []);
  
  const refreshData = () => {
    setIsLoading(true);
    // In a real application, this would refresh the queries
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Data Analytics</h2>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={refreshData} 
            variant="ghost" 
            size="icon" 
            disabled={isLoading || isAnalyticsLoading || isGenreTrendsLoading || isGeoInsightsLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              +12% from previous period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              +8% from previous period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tracks</CardTitle>
            <Music className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTracks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              +15% from previous period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversion}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              +2.1% from previous period
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="m-0 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Activity</CardTitle>
              <CardDescription>Track user activity and engagement over time</CardDescription>
            </CardHeader>
            <CardContent>
              <LineChart />
            </CardContent>
          </Card>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
                <CardDescription>User types breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <PieChart />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Content Creation</CardTitle>
                <CardDescription>Tracks created per month</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="users" className="m-0 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>New user registrations over time</CardDescription>
            </CardHeader>
            <CardContent>
              <LineChart />
            </CardContent>
          </Card>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Retention Rate</CardTitle>
                <CardDescription>User retention by cohort</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">30-day retention</span>
                    <span className="text-sm font-medium">{stats.retention}%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary" 
                      style={{ width: `${stats.retention}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>User Demographics</CardTitle>
                <CardDescription>User age and location breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <PieChart />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="content" className="m-0">
          {/* Content analytics would go here */}
        </TabsContent>
        
        <TabsContent value="engagement" className="m-0">
          {/* Engagement analytics would go here */}
        </TabsContent>
      </Tabs>
    </div>
  );
} 