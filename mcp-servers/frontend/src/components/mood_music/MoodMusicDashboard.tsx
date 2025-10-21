import { BarChart, Library, Music, Share2, Sliders } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { MoodMusicGenerator } from "./MoodMusicGenerator";
import { AdvancedControls } from "./tabs/AdvancedControls";
import { LibraryAndProfiles } from "./tabs/LibraryProfiles";
import { MoodAnalytics } from "./tabs/MoodAnalytics";
import { ShareAndExport } from "./tabs/ShareExport";

export const DASHBOARD_TABS = {
  CREATE: {
    id: "create",
    label: "Create Music",
    icon: Music,
  },
  ADVANCED: {
    id: "advanced",
    label: "Advanced Controls",
    icon: Sliders,
  },
  LIBRARY: {
    id: "library",
    label: "Library & Profiles",
    icon: Library,
  },
  ANALYTICS: {
    id: "analytics",
    label: "Analytics",
    icon: BarChart,
  },
  SHARE: {
    id: "share",
    label: "Share & Export",
    icon: Share2,
  },
} as const;

export function MoodMusicDashboard() {
  return (
    <div className="container py-6 space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Mood-Based Music</h1>
          <p className="mt-2 text-muted-foreground">
            Generate music that matches your mood and emotional state.
          </p>
        </div>
      </div>

      <Card className="p-6">
        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            {Object.values(DASHBOARD_TABS).map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <MoodMusicGenerator />
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <AdvancedControls />
          </TabsContent>

          <TabsContent value="library" className="space-y-6">
            <LibraryAndProfiles />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <MoodAnalytics />
          </TabsContent>

          <TabsContent value="share" className="space-y-6">
            <ShareAndExport />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
