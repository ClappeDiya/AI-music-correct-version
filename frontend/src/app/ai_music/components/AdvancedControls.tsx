"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { InstrumentalLayerControls } from "./InstrumentalLayerControls";
import { StyleParameterControls } from "./StyleParameterControls";

interface InstrumentalLayer {
  id: string;
  name: string;
  volume: number;
  pan: number;
  muted: boolean;
}

interface StyleParameters {
  tempo: number;
  complexity: number;
  emotionalIntensity: number;
  emotionalTone: string;
  style: string;
}

interface AdvancedControlsProps {
  trackId: string;
  layers: InstrumentalLayer[];
  styleParameters: StyleParameters;
  onLayerUpdate: (layers: InstrumentalLayer[]) => void;
  onStyleUpdate: (parameters: StyleParameters) => void;
}

export function AdvancedControls({
  trackId,
  layers,
  styleParameters,
  onLayerUpdate,
  onStyleUpdate,
}: AdvancedControlsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Advanced Controls</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="layers" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="layers">Instrumental Layers</TabsTrigger>
            <TabsTrigger value="style">Style & Emotion</TabsTrigger>
          </TabsList>
          <TabsContent value="layers" className="mt-4">
            <InstrumentalLayerControls
              trackId={trackId}
              layers={layers}
              onLayerUpdate={onLayerUpdate}
            />
          </TabsContent>
          <TabsContent value="style" className="mt-4">
            <StyleParameterControls
              trackId={trackId}
              initialParameters={styleParameters}
              onParametersUpdate={onStyleUpdate}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
