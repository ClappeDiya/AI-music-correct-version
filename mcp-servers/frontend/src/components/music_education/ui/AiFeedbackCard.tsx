"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { cn } from "@/lib/utils";
import {
  Award,
  TrendingDown,
  TrendingUp,
  Minus,
  Waveform,
  Music,
  Mic,
  Settings,
} from "lucide-react";

interface AIFeedbackCardProps {
  title: string;
  score: number;
  previousScore?: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  detailedAnalysis?: {
    pitch: {
      accuracy: number;
      consistency: number;
      range: string;
    };
    rhythm: {
      timing: number;
      steadiness: number;
      complexity: number;
    };
    expression: {
      dynamics: number;
      articulation: number;
      phrasing: number;
    };
    technicalAspects?: {
      intonation: number;
      breathing: number;
      posture: number;
    };
  };
  className?: string;
  onRequestAnalysis?: () => void;
  isAnalyzing?: boolean;
}

export function AIFeedbackCard({
  title,
  score,
  previousScore,
  feedback,
  strengths,
  improvements,
  detailedAnalysis,
  className,
  onRequestAnalysis,
  isAnalyzing = false,
}: AIFeedbackCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getTrendIcon = (current: number, previous?: number) => {
    if (!previous) return { icon: Minus, color: "text-gray-500" };
    const diff = current - previous;
    if (diff > 0) return { icon: TrendingUp, color: "text-green-500" };
    if (diff < 0) return { icon: TrendingDown, color: "text-red-500" };
    return { icon: Minus, color: "text-gray-500" };
  };

  const trend = getTrendIcon(score, previousScore);
  const TrendIcon = trend.icon;

  const renderDetailSection = (
    title: string,
    metrics: Record<string, number | string>,
    icon: React.ReactNode,
  ) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2 font-medium">
        {icon}
        <h4 className="text-base sm:text-lg">{title}</h4>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.entries(metrics).map(([key, value]) => (
          <div key={key} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground capitalize">{key}</span>
              <span className="font-medium">
                {typeof value === "number"
                  ? `${(value * 100).toFixed(0)}%`
                  : value}
              </span>
            </div>
            {typeof value === "number" && (
              <Progress
                value={value * 100}
                className="h-1.5"
                indicatorClassName={cn(
                  value >= 0.8 && "bg-green-500",
                  value >= 0.6 && value < 0.8 && "bg-yellow-500",
                  value < 0.6 && "bg-red-500",
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Card className={cn("transition-all", className)}>
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Award className="h-5 w-5" />
            {title}
          </CardTitle>
          {onRequestAnalysis && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRequestAnalysis}
              disabled={isAnalyzing}
              className="w-full sm:w-auto h-10"
            >
              {isAnalyzing ? (
                <>
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Analyzing...
                </>
              ) : (
                "Request Analysis"
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-bold">
              {score.toFixed(0)}%
            </div>
            {previousScore && (
              <div className="flex items-center gap-1 text-sm">
                <TrendIcon className={cn("h-4 w-4", trend.color)} />
                <span className={trend.color}>
                  {Math.abs(score - previousScore).toFixed(1)}%{" "}
                  {score >= previousScore ? "improvement" : "decrease"}
                </span>
              </div>
            )}
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                View Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-xl sm:text-2xl">
                  Detailed Analysis
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="space-y-2">
                  <h4 className="font-medium text-base sm:text-lg">Feedback</h4>
                  <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                    {feedback}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h4 className="font-medium text-green-600 text-base sm:text-lg">
                      Strengths
                    </h4>
                    <ul className="space-y-2">
                      {strengths.map((strength, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Award className="h-4 w-4 text-green-500 mt-1" />
                          <span className="text-sm sm:text-base">
                            {strength}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-red-600 text-base sm:text-lg">
                      Areas for Improvement
                    </h4>
                    <ul className="space-y-2">
                      {improvements.map((improvement, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <TrendingUp className="h-4 w-4 text-red-500 mt-1" />
                          <span className="text-sm sm:text-base">
                            {improvement}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {detailedAnalysis && (
                  <div className="space-y-8 pt-6 border-t">
                    {renderDetailSection(
                      "Pitch Analysis",
                      detailedAnalysis.pitch,
                      <Music className="h-4 w-4" />,
                    )}
                    {renderDetailSection(
                      "Rhythm Analysis",
                      detailedAnalysis.rhythm,
                      <Waveform className="h-4 w-4" />,
                    )}
                    {renderDetailSection(
                      "Expression Analysis",
                      detailedAnalysis.expression,
                      <Mic className="h-4 w-4" />,
                    )}
                    {detailedAnalysis.technicalAspects &&
                      renderDetailSection(
                        "Technical Aspects",
                        detailedAnalysis.technicalAspects,
                        <Settings className="h-4 w-4" />,
                      )}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {strengths.slice(0, 3).map((strength, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="bg-green-100 text-green-700 text-xs sm:text-sm py-1 px-2 sm:px-3"
              >
                {strength}
              </Badge>
            ))}
          </div>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {feedback}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
