"use client";

import * as React from "react";
import {
  BarChart3,
  Users,
  Music2,
  Clock,
  Heart,
  Share2,
  TrendingUp,
  Radio,
  Mic2,
  Headphones,
  Globe,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { PermissionGuard } from "../auth/permission-guard";

export const reportCategories = [
  {
    value: "track_performance",
    label: "Track Performance",
    icon: BarChart3,
    description: "Analyze track plays, likes, and engagement metrics",
    permission: "generateReport",
  },
  {
    value: "audience_demographics",
    label: "Audience Demographics",
    icon: Users,
    description: "Understand your listener base demographics",
    permission: "accessDemographics",
  },
  {
    value: "genre_analysis",
    label: "Genre Analysis",
    icon: Music2,
    description: "Deep dive into genre performance and trends",
    permission: "generateReport",
  },
  {
    value: "listening_patterns",
    label: "Listening Patterns",
    icon: Clock,
    description: "Track when and how users engage with content",
    permission: "generateReport",
  },
  {
    value: "engagement_metrics",
    label: "Engagement Metrics",
    icon: Heart,
    description: "Monitor likes, shares, and comments",
    permission: "generateReport",
  },
  {
    value: "social_sharing",
    label: "Social Sharing",
    icon: Share2,
    description: "Track social media shares and engagement",
    permission: "generateReport",
  },
  {
    value: "trend_analysis",
    label: "Trend Analysis",
    icon: TrendingUp,
    description: "Identify emerging music trends",
    permission: "generateReport",
  },
  {
    value: "radio_plays",
    label: "Radio Plays",
    icon: Radio,
    description: "Monitor radio station performance",
    permission: "generateReport",
  },
  {
    value: "artist_performance",
    label: "Artist Performance",
    icon: Mic2,
    description: "Track artist-specific metrics",
    permission: "generateReport",
  },
  {
    value: "listener_behavior",
    label: "Listener Behavior",
    icon: Headphones,
    description: "Analyze listening habits and preferences",
    permission: "generateReport",
  },
  {
    value: "geographic_reach",
    label: "Geographic Reach",
    icon: Globe,
    description: "View geographic distribution of listeners",
    permission: "generateReport",
  },
  {
    value: "target_audience",
    label: "Target Audience",
    icon: Target,
    description: "Analyze target audience engagement",
    permission: "generateReport",
  },
];

interface ReportCategorySelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
}

export function ReportCategorySelect({
  value,
  onValueChange,
}: ReportCategorySelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a report category" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Report Categories</SelectLabel>
          {reportCategories.map((category) => (
            <PermissionGuard
              key={category.value}
              permission={category.permission as any}
            >
              <SelectItem
                value={category.value}
                className="flex items-center space-x-2"
              >
                <div className="flex items-center space-x-2">
                  <category.icon className="h-4 w-4" />
                  <span>{category.label}</span>
                </div>
              </SelectItem>
            </PermissionGuard>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
