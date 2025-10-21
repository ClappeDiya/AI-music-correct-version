"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  BookOpen,
  Code,
  Headphones,
  Lightbulb,
  Music,
  PlayCircle,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LessonContentProps {
  lesson: {
    id: number;
    title: string;
    content: {
      theory: {
        sections: {
          title: string;
          content: string;
          examples?: string[];
          videoUrl?: string;
          materials?: {
            id: string;
            title: string;
            description: string;
            url: string;
            fileType: string;
          }[];
        }[];
      };
      practical: {
        steps: {
          title: string;
          instructions: string;
          tips?: string[];
          videoUrl?: string;
          materials?: {
            id: string;
            title: string;
            description: string;
            url: string;
            fileType: string;
          }[];
        }[];
      };
      interactive?: {
        exercises: {
          type: "chord-progression" | "arrangement" | "mixing";
          title: string;
          description: string;
          data: any;
          videoUrl?: string;
          materials?: {
            id: string;
            title: string;
            description: string;
            url: string;
            fileType: string;
          }[];
        }[];
      };
    };
    version: string;
    lastUpdated: string;
    watchHistory?: {
      lastWatched: string;
      progress: number;
      notes: {
        id: string;
        timestamp: number;
        text: string;
        createdAt: string;
      }[];
    };
  };
  onComplete: () => void;
  onUpdateWatchHistory?: (sectionId: number, progress: number) => void;
  onAddNote?: (
    sectionId: number,
    note: { timestamp: number; text: string },
  ) => void;
}

const TOPIC_ICONS = {
  theory: BookOpen,
  practical: PlayCircle,
  interactive: Settings,
  "chord-progression": Music,
  arrangement: Code,
  mixing: Headphones,
} as const;

export function LessonContent({
  lesson,
  onComplete,
  onUpdateWatchHistory,
  onAddNote,
}: LessonContentProps) {
  const [activeTab, setActiveTab] = useState("theory");
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const handleStepComplete = (stepIndex: number) => {
    if (!completedSteps.includes(stepIndex)) {
      const newCompleted = [...completedSteps, stepIndex];
      setCompletedSteps(newCompleted);

      // If all steps are completed, trigger onComplete
      const totalSteps =
        lesson.content.theory.sections.length +
        lesson.content.practical.steps.length +
        (lesson.content.interactive?.exercises.length || 0);

      if (newCompleted.length === totalSteps) {
        onComplete();
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">{lesson.title}</h2>
          <p className="text-sm text-muted-foreground">
            Version {lesson.version} • Last updated{" "}
            {new Date(lesson.lastUpdated).toLocaleDateString()}
          </p>
        </div>
        {lesson.watchHistory && (
          <div className="text-sm text-muted-foreground">
            Last watched:{" "}
            {new Date(lesson.watchHistory.lastWatched).toLocaleDateString()}
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="theory" className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4" />
            <span>Theory</span>
          </TabsTrigger>
          <TabsTrigger
            value="practical"
            className="flex items-center space-x-2"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Practical</span>
          </TabsTrigger>
          {lesson.content.interactive && (
            <TabsTrigger
              value="interactive"
              className="flex items-center space-x-2"
            >
              <Settings className="w-4 h-4" />
              <span>Interactive</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="theory" className="space-y-4">
          {lesson.content.theory.sections.map((section, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>{section.title}</span>
                  {completedSteps.includes(index) && (
                    <Lightbulb className="w-4 h-4 text-green-500" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {section.videoUrl && (
                  <VideoPlayer
                    videoUrl={section.videoUrl}
                    title={section.title}
                    materials={section.materials}
                    notes={lesson.watchHistory?.notes.filter(
                      (note) => note.timestamp >= 0 && note.timestamp <= 100,
                    )}
                    onAddNote={
                      onAddNote ? (note) => onAddNote(index, note) : undefined
                    }
                  />
                )}
                <div className="prose dark:prose-invert">{section.content}</div>
                {section.examples && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Examples</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {section.examples.map((example, i) => (
                        <li key={i}>{example}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <Button
                  variant={
                    completedSteps.includes(index) ? "outline" : "default"
                  }
                  onClick={() => handleStepComplete(index)}
                >
                  {completedSteps.includes(index)
                    ? "Completed"
                    : "Mark as Complete"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="practical" className="space-y-4">
          {lesson.content.practical.steps.map((step, index) => (
            <Card
              key={index}
              className={cn(
                "transition-all",
                currentStep === index && "ring-2 ring-primary",
              )}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>
                    Step {index + 1}: {step.title}
                  </span>
                  {completedSteps.includes(
                    index + lesson.content.theory.sections.length,
                  ) && <Lightbulb className="w-4 h-4 text-green-500" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {step.videoUrl && (
                  <VideoPlayer
                    videoUrl={step.videoUrl}
                    title={step.title}
                    materials={step.materials}
                    notes={lesson.watchHistory?.notes.filter(
                      (note) => note.timestamp >= 0 && note.timestamp <= 100,
                    )}
                    onAddNote={
                      onAddNote
                        ? (note) =>
                            onAddNote(
                              index + lesson.content.theory.sections.length,
                              note,
                            )
                        : undefined
                    }
                  />
                )}
                <div className="prose dark:prose-invert">
                  {step.instructions}
                </div>
                {step.tips && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Tips</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {step.tips.map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(index - 1)}
                    disabled={index === 0}
                  >
                    Previous Step
                  </Button>
                  <Button
                    variant={
                      completedSteps.includes(
                        index + lesson.content.theory.sections.length,
                      )
                        ? "outline"
                        : "default"
                    }
                    onClick={() => {
                      handleStepComplete(
                        index + lesson.content.theory.sections.length,
                      );
                      if (index < lesson.content.practical.steps.length - 1) {
                        setCurrentStep(index + 1);
                      }
                    }}
                  >
                    {completedSteps.includes(
                      index + lesson.content.theory.sections.length,
                    )
                      ? "Completed"
                      : index === lesson.content.practical.steps.length - 1
                        ? "Complete Step"
                        : "Complete & Continue"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {lesson.content.interactive && (
          <TabsContent value="interactive" className="space-y-4">
            {lesson.content.interactive.exercises.map((exercise, index) => {
              const Icon = TOPIC_ICONS[exercise.type];
              const stepIndex =
                lesson.content.theory.sections.length +
                lesson.content.practical.steps.length +
                index;

              return (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Icon className="w-5 h-5" />
                      <span>{exercise.title}</span>
                      {completedSteps.includes(stepIndex) && (
                        <Lightbulb className="w-4 h-4 text-green-500" />
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {exercise.videoUrl && (
                      <VideoPlayer
                        videoUrl={exercise.videoUrl}
                        title={exercise.title}
                        materials={exercise.materials}
                        notes={lesson.watchHistory?.notes.filter(
                          (note) =>
                            note.timestamp >= 0 && note.timestamp <= 100,
                        )}
                        onAddNote={
                          onAddNote
                            ? (note) => onAddNote(stepIndex, note)
                            : undefined
                        }
                      />
                    )}
                    <p>{exercise.description}</p>
                    {/* Interactive exercise component would be rendered here based on type */}
                    <Button
                      variant={
                        completedSteps.includes(stepIndex)
                          ? "outline"
                          : "default"
                      }
                      onClick={() => handleStepComplete(stepIndex)}
                    >
                      {completedSteps.includes(stepIndex)
                        ? "Completed"
                        : "Start Exercise"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
