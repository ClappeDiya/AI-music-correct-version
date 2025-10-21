import { Metadata } from "next";
import { LyricGenerator } from "@/components/ai-dj/lyrics/lyric-generator";
import { DraftsList } from "@/components/ai-dj/lyrics/drafts-list";
import { FinalLyricsList } from "@/components/ai-dj/lyrics/final-lyrics-list";
import { TimelineView } from "@/components/ai-dj/lyrics/timeline-view";
import { ModelVersionManager } from "@/components/ai-dj/lyrics/model-version-manager";
import { VrArSettings } from "@/components/ai-dj/lyrics/vr-ar-settings";
import { SignatureManager } from "@/components/ai-dj/lyrics/signature-manager";
import { AdaptiveFeedback } from "@/components/ai-dj/lyrics/adaptive-feedback";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";

export const metadata: Metadata = {
  title: "AI DJ - Lyrics Generation",
  description: "Generate and manage lyrics for your tracks using AI",
};

export default function LyricsPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Lyrics Generation</h1>

      <Tabs defaultValue="generate" className="space-y-4">
        <TabsList>
          <TabsTrigger value="generate">Generate</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
          <TabsTrigger value="final">Final Lyrics</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="vr-ar">VR/AR</TabsTrigger>
          <TabsTrigger value="signatures">Signatures</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="generate">
          <LyricGenerator />
        </TabsContent>

        <TabsContent value="drafts">
          <DraftsList />
        </TabsContent>

        <TabsContent value="final">
          <FinalLyricsList />
        </TabsContent>

        <TabsContent value="timeline">
          <TimelineView />
        </TabsContent>

        <TabsContent value="models">
          <ModelVersionManager />
        </TabsContent>

        <TabsContent value="vr-ar">
          <VrArSettings finalLyricsId={0} /> {/* TODO: Get from context */}
        </TabsContent>

        <TabsContent value="signatures">
          <SignatureManager />
        </TabsContent>

        <TabsContent value="feedback">
          <AdaptiveFeedback finalLyricsId={0} /> {/* TODO: Get from context */}
        </TabsContent>
      </Tabs>
    </div>
  );
}
