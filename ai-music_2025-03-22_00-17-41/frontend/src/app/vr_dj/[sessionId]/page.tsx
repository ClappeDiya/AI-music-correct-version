"use client";

import React from "react";
import { VRDJProvider } from "@/components/vr-dj/VRDJProvider";
import { VRScene } from "@/components/vr-dj/VRScene";
import { EnvironmentEditor } from "@/components/vr-dj/EnvironmentEditor";
import { DeckController } from "@/components/vr-dj/DeckController";
import { AIAssistant } from "@/components/vr-dj/AIAssistant";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMediaQuery } from "@/hooks/usemedia-query";
import { cn } from "@/lib/utils";

interface VRDJPageProps {
  params: {
    sessionId: string;
  };
}

export default function VRDJPage({ params }: VRDJPageProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <VRDJProvider sessionId={params.sessionId}>
      <div className="min-h-screen bg-background">
        {isDesktop ? (
          <div className="container mx-auto p-6 grid grid-cols-[1fr_400px] gap-6">
            <div className="space-y-6">
              <VRScene />
              <div className="grid grid-cols-2 gap-6">
                <DeckController side="left" />
                <DeckController side="right" />
              </div>
            </div>
            <div className="space-y-6">
              <EnvironmentEditor />
              <AIAssistant />
            </div>
          </div>
        ) : (
          <Tabs defaultValue="scene" className="w-full">
            <TabsList className="fixed bottom-0 left-0 right-0 h-16 grid grid-cols-4 gap-4 bg-background border-t p-2 z-50">
              <TabsTrigger value="scene">Scene</TabsTrigger>
              <TabsTrigger value="decks">Decks</TabsTrigger>
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="ai">AI</TabsTrigger>
            </TabsList>
            <TabsContent value="scene" className="mt-0 pb-20">
              <VRScene />
            </TabsContent>
            <TabsContent value="decks" className="mt-0 p-4 pb-20 space-y-4">
              <DeckController side="left" />
              <DeckController side="right" />
            </TabsContent>
            <TabsContent value="editor" className="mt-0 p-4 pb-20">
              <EnvironmentEditor />
            </TabsContent>
            <TabsContent value="ai" className="mt-0 p-4 pb-20">
              <AIAssistant />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </VRDJProvider>
  );
}
