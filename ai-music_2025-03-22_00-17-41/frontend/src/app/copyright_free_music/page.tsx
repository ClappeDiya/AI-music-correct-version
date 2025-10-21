import { Metadata } from "next";
import { TrackList } from "@/components/copyright_free_music/TrackList";
import { TrackUpload } from "@/components/copyright_free_music/TrackUpload";
import { LicenseList } from "@/components/copyright_free_music/licenses/LicenseList";
import { AnalyticsDashboard } from "@/components/copyright_free_music/analytics/AnalyticsDashboard";
import { PurchaseHistory } from "@/components/copyright_free_music/purchases/PurchaseHistory";
import { SettingsPanel } from "@/components/copyright_free_music/settings/SettingsPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  Music,
  Upload,
  FileCheck,
  BarChart,
  ShoppingCart,
  Settings,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Copyright-Free Music | AI Music Platform",
  description: "Browse and download copyright-free music tracks",
};

export default function CopyrightFreeMusicPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Copyright-Free Music
          </h1>
          <p className="text-muted-foreground">
            Browse, upload, and manage copyright-free music tracks
          </p>
        </div>
      </div>

      <Tabs defaultValue="browse" className="space-y-4">
        <TabsList className="grid grid-cols-3 lg:grid-cols-6 w-full">
          <TabsTrigger value="browse" className="flex items-center gap-2">
            <Music className="h-4 w-4" />
            Browse
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="licenses" className="flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            Licenses
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="purchases" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Purchases
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          <TrackList />
        </TabsContent>

        <TabsContent value="upload">
          <div className="max-w-2xl mx-auto">
            <TrackUpload />
          </div>
        </TabsContent>

        <TabsContent value="licenses">
          <LicenseList />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="purchases">
          <PurchaseHistory />
        </TabsContent>

        <TabsContent value="settings">
          <div className="max-w-4xl mx-auto">
            <SettingsPanel />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
