"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { TransitionEditor } from "./TransitionEditor";
import { RecommendationPanel } from "./RecommendationPanel";
import { SessionAnalytics } from "./SessionAnalytics";
import { HybridDJProvider } from "./HybridDJProvider";
import { cn } from "@/lib/utils";
import { Users2, Wand2, BarChart3 } from "lucide-react";

interface HybridDJProps {
  sessionId: string;
  className?: string;
}

export function HybridDJ({ sessionId, className }: HybridDJProps) {
  return (
    <HybridDJProvider sessionId={sessionId}>
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users2 className="h-6 w-6" />
            Hybrid DJ Experience
          </CardTitle>
          <CardDescription>
            Seamlessly blend human expertise with AI assistance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="recommendations" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger
                value="recommendations"
                className="flex items-center gap-2"
              >
                <Wand2 className="h-4 w-4" />
                AI Recommendations
              </TabsTrigger>
              <TabsTrigger
                value="transitions"
                className="flex items-center gap-2"
              >
                <Users2 className="h-4 w-4" />
                Transition Editor
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="recommendations">
              <RecommendationPanel
                sessionId={sessionId}
                className="border-none shadow-none"
              />
            </TabsContent>

            <TabsContent value="transitions">
              <TransitionEditor
                sessionId={sessionId}
                className="border-none shadow-none"
              />
            </TabsContent>

            <TabsContent value="analytics">
              <SessionAnalytics
                sessionId={sessionId}
                className="border-none shadow-none"
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </HybridDJProvider>
  );
}
