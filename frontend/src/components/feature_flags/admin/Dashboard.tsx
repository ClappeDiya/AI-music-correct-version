import { useState } from "react";
import { useFeatureFlagAdmin } from "@/lib/hooks/UseFeatureFlags";
import { FlagList } from "./flag-list";
import { MetricsOverview } from "./metrics-overview";
import { AuditLogViewer } from "./audit-log-viewer";
import { EnvironmentSelector } from "./environment-selector";
import { SearchAndFilters } from "./search-filters";
import { UserSegments } from "./user-segments";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/useToast";
import {
  BarChart,
  GitBranch,
  Users,
  History,
  Settings,
  Shield,
} from "lucide-react";
import { CreateFlagDialog } from "./create-flag-dialog";
import { ImportExportDialog } from "./import-export-dialog";
import { SettingsDialog } from "./settings-dialog";

export function FeatureFlagAdminDashboard() {
  const [selectedEnvironment, setSelectedEnvironment] = useState("development");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    segment: "",
    region: "",
  });
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const { flags, isLoading, createFlag, updateFlag, deleteFlag } =
    useFeatureFlagAdmin();
  const { toast } = useToast();

  const handleEnvironmentChange = (env: string) => {
    setSelectedEnvironment(env);
    // Reload flags for the selected environment
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Filter flags based on search query
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    // Apply filters to flag list
  };

  const handleCreateFlag = async (data: any) => {
    try {
      await createFlag.mutateAsync({
        ...data,
        environment: selectedEnvironment,
      });
      toast({
        title: "Success",
        description: "Feature flag created successfully",
      });
      setShowCreateDialog(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create feature flag",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Feature Flags</h1>
          <p className="text-muted-foreground">
            Manage and monitor your feature flags across environments
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowImportExport(true)}>
            <GitBranch className="h-4 w-4 mr-2" />
            Import/Export
          </Button>
          <Button variant="outline" onClick={() => setShowSettings(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>Create Flag</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Flags</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {flags?.filter((f) => f.status === "active").length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Segments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {/* Add user segments count */}5
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Changes Today</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {/* Add changes count */}
              12
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 items-center">
        <EnvironmentSelector
          value={selectedEnvironment}
          onChange={handleEnvironmentChange}
        />
        <SearchAndFilters
          query={searchQuery}
          filters={filters}
          onQueryChange={handleSearch}
          onFiltersChange={handleFilterChange}
        />
      </div>

      <Tabs defaultValue="flags" className="space-y-4">
        <TabsList>
          <TabsTrigger value="flags">Flags</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="flags" className="space-y-4">
          <FlagList
            flags={flags || []}
            isLoading={isLoading}
            onUpdate={updateFlag.mutate}
            onDelete={deleteFlag.mutate}
            environment={selectedEnvironment}
            searchQuery={searchQuery}
            filters={filters}
          />
        </TabsContent>

        <TabsContent value="metrics">
          <MetricsOverview environment={selectedEnvironment} />
        </TabsContent>

        <TabsContent value="segments">
          <UserSegments environment={selectedEnvironment} />
        </TabsContent>

        <TabsContent value="audit">
          <AuditLogViewer environment={selectedEnvironment} />
        </TabsContent>
      </Tabs>

      <CreateFlagDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreate={handleCreateFlag}
      />

      <ImportExportDialog
        open={showImportExport}
        onOpenChange={setShowImportExport}
      />

      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />
    </div>
  );
}
