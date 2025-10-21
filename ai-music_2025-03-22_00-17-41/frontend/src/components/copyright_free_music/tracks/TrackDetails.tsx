import { useApiQuery } from "@/lib/hooks/use-api-query";
import {
  tracksApi,
  trackDownloadsApi,
  trackAnalyticsApi,
} from "@/lib/api/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/Badge";
import { Separator } from "@/components/ui/Separator";
import {
  Music,
  Download,
  FileCheck,
  BarChart,
  Clock,
  Tag,
  User,
  Globe,
} from "lucide-react";
import type { Track } from "@/lib/api/types";

interface TrackDetailsProps {
  trackId: string;
}

export function TrackDetails({ trackId }: TrackDetailsProps) {
  const { data: track, isLoading } = useApiQuery<Track>(
    ["track", trackId],
    tracksApi,
    { id: trackId },
  );

  const { data: downloads } = useApiQuery(
    ["downloads", trackId],
    trackDownloadsApi,
    { track__id: trackId },
  );

  const { data: analytics } = useApiQuery(
    ["analytics", trackId],
    trackAnalyticsApi,
    { track__id: trackId },
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!track) {
    return <div>Track not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Music className="h-6 w-6" />
            {track.title}
          </h1>
          <div className="flex items-center gap-2 mt-2 text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{track.user.username}</span>
            <Separator orientation="vertical" className="h-4" />
            <Clock className="h-4 w-4" />
            <span>{new Date(track.published_at).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline">
            <FileCheck className="h-4 w-4 mr-2" />
            License
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Pricing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {track.pricing?.price} {track.pricing?.currency}
            </div>
            {track.pricing?.royalty_percentage && (
              <p className="text-sm text-muted-foreground">
                {track.pricing.royalty_percentage}% Royalty
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Download className="h-4 w-4" />
              Downloads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {downloads?.results.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              Total Plays
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics?.results[0]?.analytics_data.plays || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="license">License</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="font-semibold mb-2">Metadata</h3>
                  <div className="space-y-2">
                    {Object.entries(track.metadata || {}).map(
                      ([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                          <span className="text-sm font-medium">{key}:</span>
                          <span className="text-sm text-muted-foreground">
                            {String(value)}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Usage Rights</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(track.license.base_conditions || {}).map(
                      ([key, value]) => (
                        <Badge
                          key={key}
                          variant={value ? "default" : "secondary"}
                        >
                          {key.replace("_", " ")}
                        </Badge>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="license">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">License Terms</h3>
                  <p className="text-muted-foreground">
                    {track.license.description}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Conditions</h3>
                  <div className="space-y-2">
                    {Object.entries(track.license.base_conditions || {}).map(
                      ([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                          <FileCheck className="h-4 w-4" />
                          <span>
                            {key.replace("_", " ")}: {String(value)}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardContent className="pt-6">
              {analytics?.results[0] ? (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <h3 className="font-semibold mb-2">Plays</h3>
                      <div className="text-2xl font-bold">
                        {analytics.results[0].analytics_data.plays}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Unique Listeners</h3>
                      <div className="text-2xl font-bold">
                        {analytics.results[0].analytics_data.unique_listeners}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Top Countries</h3>
                      <div className="flex flex-wrap gap-2">
                        {analytics.results[0].analytics_data.top_countries?.map(
                          (country) => (
                            <Badge key={country}>
                              <Globe className="h-3 w-3 mr-1" />
                              {country}
                            </Badge>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No analytics data available
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
