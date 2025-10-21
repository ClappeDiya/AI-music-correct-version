import React, { useState, useCallback } from "react";
import { TraditionSelector } from "./TraditionSelector";
import { BlendVisualizer } from "./BlendVisualizer";
import { CulturalContextViewer } from "./CulturalContextViewer";
import { useBlend } from "@/hooks/useBlend";
import { useLyrics } from "@/hooks/useLyrics";
import { useToast } from "@/components/ui/useToast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";

export const CrossCulturalComposer: React.FC = () => {
  const {
    createBlend,
    addTradition,
    generateParameters,
    loading: blendLoading,
  } = useBlend();
  const { createLyrics, loading: lyricsLoading } = useLyrics();
  const { toast } = useToast();
  const [blendName, setBlendName] = useState("");
  const [blendDescription, setBlendDescription] = useState("");
  const [selectedTraditions, setSelectedTraditions] = useState<
    Array<{ id: string; weight: number }>
  >([]);

  const handleTraditionSelect = useCallback(
    (traditions: Array<{ id: string; weight: number }>) => {
      setSelectedTraditions(traditions);
    },
    [],
  );

  const handleCreateBlend = async () => {
    if (!blendName) {
      toast({
        title: "Error",
        description: "Please provide a name for your blend",
        variant: "destructive",
      });
      return;
    }

    try {
      const blend = await createBlend(blendName, blendDescription);

      // Add each selected tradition to the blend
      for (const tradition of selectedTraditions) {
        await addTradition(tradition.id, tradition.weight);
      }

      // Generate initial parameters
      await generateParameters();

      toast({
        title: "Success",
        description: "Cultural blend created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create blend",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="grid gap-6">
        <div>
          <Label htmlFor="blend-name">Blend Name</Label>
          <Input
            id="blend-name"
            value={blendName}
            onChange={(e) => setBlendName(e.target.value)}
            placeholder="Enter a name for your cultural blend"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="blend-description">Description</Label>
          <Input
            id="blend-description"
            value={blendDescription}
            onChange={(e) => setBlendDescription(e.target.value)}
            placeholder="Describe your cultural blend"
            className="mt-1"
          />
        </div>
      </div>

      <Tabs defaultValue="traditions" className="w-full">
        <TabsList>
          <TabsTrigger value="traditions">Select Traditions</TabsTrigger>
          <TabsTrigger value="visualization">Blend Visualization</TabsTrigger>
          <TabsTrigger value="context">Cultural Context</TabsTrigger>
        </TabsList>

        <TabsContent value="traditions" className="mt-6">
          <TraditionSelector onTraditionSelect={handleTraditionSelect} />
        </TabsContent>

        <TabsContent value="visualization" className="mt-6">
          <BlendVisualizer
            blendData={{
              traditions: selectedTraditions.map((t, i) => ({
                id: t.id,
                name: `Tradition ${i + 1}`,
                weight: t.weight,
              })),
            }}
          />
        </TabsContent>

        <TabsContent value="context" className="mt-6">
          <CulturalContextViewer
            context={{
              elements: [],
              general_notes: {
                overview: "",
                key_concepts: [],
                etiquette: [],
              },
              recommendations: [],
            }}
          />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button
          onClick={handleCreateBlend}
          disabled={
            blendLoading ||
            lyricsLoading ||
            !blendName ||
            selectedTraditions.length === 0
          }
        >
          {blendLoading ? "Creating..." : "Create Blend"}
        </Button>
      </div>
    </div>
  );
};
