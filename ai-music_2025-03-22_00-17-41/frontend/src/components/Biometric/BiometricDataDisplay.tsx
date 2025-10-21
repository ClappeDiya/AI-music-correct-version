"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  Heart,
  Activity,
  Waves,
  Footprints,
  Brain,
  Gauge,
  Battery,
} from "lucide-react";
import { Progress } from "@/components/ui/Progress";
import { cn } from "@/lib/utils";

interface BiometricData {
  heartRate: number;
  stressLevel: number;
  energyLevel: number;
  movement: number;
  mood: string;
  deviceBattery: number;
  lastUpdated: string;
}

interface BiometricDataDisplayProps {
  data: BiometricData;
  deviceType: "garmin" | "apple" | "fitbit";
  className?: string;
}

export function BiometricDataDisplay({
  data,
  deviceType,
  className,
}: BiometricDataDisplayProps) {
  const getDeviceColor = () => {
    switch (deviceType) {
      case "garmin":
        return "text-blue-500";
      case "apple":
        return "text-gray-700 dark:text-gray-300";
      case "fitbit":
        return "text-teal-500";
      default:
        return "text-muted-foreground";
    }
  };

  const getMoodColor = () => {
    switch (data.mood.toLowerCase()) {
      case "energetic":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "calm":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "stressed":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "focused":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      default:
        return "bg-muted/10 text-muted-foreground border-muted/20";
    }
  };

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className={cn("h-5 w-5", getDeviceColor())} />
            Biometric Data
          </CardTitle>
          <Badge variant="outline" className="gap-1">
            <Battery className="h-3 w-3" />
            {data.deviceBattery}%
          </Badge>
        </div>
        <CardDescription>
          Last updated: {new Date(data.lastUpdated).toLocaleTimeString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Heart Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">Heart Rate</span>
              </div>
              <span className="text-sm">{data.heartRate} BPM</span>
            </div>
            <Progress
              value={Math.min((data.heartRate / 200) * 100, 100)}
              className="h-2"
            />
          </div>

          {/* Stress Level */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Waves className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Stress Level</span>
              </div>
              <span className="text-sm">{data.stressLevel}%</span>
            </div>
            <Progress value={data.stressLevel} className="h-2" />
          </div>

          {/* Energy Level */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">Energy</span>
              </div>
              <span className="text-sm">{data.energyLevel}%</span>
            </div>
            <Progress value={data.energyLevel} className="h-2" />
          </div>

          {/* Movement */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Footprints className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Movement</span>
              </div>
              <span className="text-sm">{data.movement}%</span>
            </div>
            <Progress value={data.movement} className="h-2" />
          </div>

          {/* Mood */}
          <div className="col-span-full flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span className="text-sm font-medium">Current Mood</span>
            </div>
            <Badge
              variant="outline"
              className={cn("capitalize", getMoodColor())}
            >
              {data.mood}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
