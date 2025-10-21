"use client";

import { useState } from "react";
import { Card } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { MoodSelector } from "./MoodSelector";
import { MoodPreview } from "./MoodPreview";
import { MoodHistory } from "./MoodHistory";
import { MoodProfiles } from "./MoodProfiles";
import { AdvancedMoodControls, type MoodParameters } from "./AdvancedMoodControls";
import { EmotionalCurve } from "./EmotionalCurve";
import { useMoodMusic } from '@/hooks/UseMoodMusic';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/Collapsible";
import { Button } from '@/components/ui/Button';
import { ChevronDown } from "lucide-react";

export function MoodMusicGenerator() {
  const [activeTab, setActiveTab] = useState("create");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { 
    selectedMood,
    setSelectedMood,
    intensity,
    setIntensity,
    generateTrack,
    isGenerating,
    currentTrack,
    submitFeedback,
    advancedParameters,
    setAdvancedParameters
  } = useMoodMusic();

  const handleAdvancedParametersChange = (params: MoodParameters) => {
    setAdvancedParameters(params);
  };

  return (
    <Card className="p-4 sm:p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6">
          <TabsTrigger value="create" className="text-sm sm:text-base">Create Music</TabsTrigger>
          <TabsTrigger value="profiles" className="text-sm sm:text-base">Profiles</TabsTrigger>
          <TabsTrigger value="history" className="text-sm sm:text-base">History</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4 sm:space-y-6">
          <MoodSelector
            selectedMood={selectedMood}
            intensity={intensity}
            onMoodSelect={setSelectedMood}
            onIntensityChange={setIntensity}
            onGenerate={generateTrack}
            isGenerating={isGenerating}
          />

          <MoodPreview 
            mode="generative"
            moodDescription={selectedMood || "Happy"} 
            onGenerateClick={generateTrack}
            isGenerating={isGenerating}
          />

          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full flex items-center justify-between">
                Advanced Controls
                <ChevronDown className={`h-4 w-4 transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <AdvancedMoodControls
                onParametersChange={handleAdvancedParametersChange}
                defaultParameters={advancedParameters}
              />
            </CollapsibleContent>
          </Collapsible>

          {currentTrack && (
            <>
              <EmotionalCurve metadata={currentTrack.metadata} />
            </>
          )}
        </TabsContent>

        <TabsContent value="profiles" className="mt-0">
          <MoodProfiles />
        </TabsContent>

        <TabsContent value="history" className="mt-0">
          <MoodHistory />
        </TabsContent>
      </Tabs>
    </Card>
  );
} 
