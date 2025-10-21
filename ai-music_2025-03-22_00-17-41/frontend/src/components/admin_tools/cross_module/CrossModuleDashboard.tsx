import { useState, useEffect } from "react";
import {
  crossModuleApi,
  ModuleType,
  ModuleStats,
} from "@/services/admin_tools/CrossModule";
import { ContentReferenceCard } from "./content-reference-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Music, MessageSquare, User, Filter } from "lucide-react";
import { useDebounce } from "@/hooks/usedebounce";

export function CrossModuleDashboard() {
  const [selectedModule, setSelectedModule] = useState<ModuleType | "all">(
    "all",
  );
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [moduleStats, setModuleStats] = useState<ModuleStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<any[]>([]);

  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await crossModuleApi.getModuleStats();
        setModuleStats(stats);
      } catch (error) {
        console.error("Error fetching module stats:", error);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        const params: any = {};
        if (selectedModule !== "all") params.module = selectedModule;
        if (selectedSeverity !== "all") params.severity = selectedSeverity;
        if (debouncedSearch) params.search = debouncedSearch;

        const response = await crossModuleApi.getFlaggedContent(params);
        setContent(response.results);
      } catch (error) {
        console.error("Error fetching content:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [selectedModule, selectedSeverity, debouncedSearch]);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {moduleStats.map((stat) => (
          <Card key={stat.module}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                {stat.module === "ai_dj" && <Music className="h-4 w-4" />}
                {stat.module === "social" && (
                  <MessageSquare className="h-4 w-4" />
                )}
                {stat.module === "user_profile" && <User className="h-4 w-4" />}
                {stat.module.replace("_", " ").toUpperCase()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.flagged_items}</div>
              <p className="text-xs text-muted-foreground">
                {stat.pending_review} pending review
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={selectedModule}
            onValueChange={(value) =>
              setSelectedModule(value as ModuleType | "all")
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select module" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modules</SelectItem>
              <SelectItem value="ai_dj">AI DJ</SelectItem>
              <SelectItem value="social">Social</SelectItem>
              <SelectItem value="music_sharing">Music Sharing</SelectItem>
              <SelectItem value="user_profile">User Profile</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content Grid */}
      <Tabs defaultValue="grid" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {content.map((item) => (
              <ContentReferenceCard
                key={item.id}
                reference={item}
                onStatusUpdate={async (referenceId, status) => {
                  try {
                    await crossModuleApi.updateContentStatus(referenceId, {
                      status: status as any,
                    });
                    // Refresh content after update
                    const params: any = {};
                    if (selectedModule !== "all")
                      params.module = selectedModule;
                    if (selectedSeverity !== "all")
                      params.severity = selectedSeverity;
                    if (debouncedSearch) params.search = debouncedSearch;
                    const response =
                      await crossModuleApi.getFlaggedContent(params);
                    setContent(response.results);
                  } catch (error) {
                    console.error("Error updating content status:", error);
                  }
                }}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-0">
          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className="space-y-2">
              {content.map((item) => (
                <ContentReferenceCard
                  key={item.id}
                  reference={item}
                  onStatusUpdate={async (referenceId, status) => {
                    try {
                      await crossModuleApi.updateContentStatus(referenceId, {
                        status: status as any,
                      });
                      // Refresh content after update
                      const params: any = {};
                      if (selectedModule !== "all")
                        params.module = selectedModule;
                      if (selectedSeverity !== "all")
                        params.severity = selectedSeverity;
                      if (debouncedSearch) params.search = debouncedSearch;
                      const response =
                        await crossModuleApi.getFlaggedContent(params);
                      setContent(response.results);
                    } catch (error) {
                      console.error("Error updating content status:", error);
                    }
                  }}
                />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
