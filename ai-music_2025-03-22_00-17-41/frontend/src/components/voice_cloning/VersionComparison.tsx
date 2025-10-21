"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { VoiceVersion } from "@/services/api/voice-editing";
import { CompareIcon, ArrowLeftRight } from "lucide-react";
import { AudioPreview } from "./audio-preview";

interface VersionComparisonProps {
  versions: VoiceVersion[];
  onRevert: (versionId: number) => void;
}

export function VersionComparison({
  versions,
  onRevert,
}: VersionComparisonProps) {
  const [version1Id, setVersion1Id] = useState<string>("");
  const [version2Id, setVersion2Id] = useState<string>("");

  const version1 = versions.find((v) => v.id.toString() === version1Id);
  const version2 = versions.find((v) => v.id.toString() === version2Id);

  const getParameterDiff = (
    category: keyof VoiceVersion["parameters"],
    parameter: string,
  ): { value1: number; value2: number; diff: number } | null => {
    if (!version1 || !version2) return null;

    const value1 = version1.parameters[category][parameter];
    const value2 = version2.parameters[category][parameter];
    return {
      value1,
      value2,
      diff: value2 - value1,
    };
  };

  const formatValue = (value: number): string => {
    return value.toFixed(2);
  };

  const formatDiff = (diff: number): string => {
    const sign = diff > 0 ? "+" : "";
    return `${sign}${diff.toFixed(2)}`;
  };

  const getDiffColor = (diff: number): string => {
    if (diff === 0) return "text-muted-foreground";
    return diff > 0 ? "text-green-500" : "text-red-500";
  };

  const categories = [
    {
      name: "Timbre",
      parameters: [
        "brightness",
        "breathiness",
        "roughness",
        "warmth",
        "resonance",
        "presence",
      ],
    },
    {
      name: "Pitch",
      parameters: ["shift", "range", "stability", "vibrato", "intonation"],
    },
    {
      name: "Articulation",
      parameters: ["speed", "clarity", "attack", "release", "emphasis"],
    },
    {
      name: "Expression",
      parameters: ["emotion", "dynamics", "tension"],
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CompareIcon className="h-5 w-5" />
            Version Comparison
          </div>
          <div className="flex items-center gap-2">
            <Select value={version1Id} onValueChange={setVersion1Id}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select version 1" />
              </SelectTrigger>
              <SelectContent>
                {versions.map((version) => (
                  <SelectItem key={version.id} value={version.id.toString()}>
                    Version {version.id} (
                    {new Date(version.created_at).toLocaleDateString()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ArrowLeftRight className="h-4 w-4" />
            <Select value={version2Id} onValueChange={setVersion2Id}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select version 2" />
              </SelectTrigger>
              <SelectContent>
                {versions.map((version) => (
                  <SelectItem key={version.id} value={version.id.toString()}>
                    Version {version.id} (
                    {new Date(version.created_at).toLocaleDateString()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {version1 && version2 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Version {version1.id}</CardTitle>
                </CardHeader>
                <CardContent>
                  <AudioPreview url={version1.preview_url} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Version {version2.id}</CardTitle>
                </CardHeader>
                <CardContent>
                  <AudioPreview url={version2.preview_url} />
                </CardContent>
              </Card>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Parameter</TableHead>
                  <TableHead>Version {version1.id}</TableHead>
                  <TableHead>Version {version2.id}</TableHead>
                  <TableHead>Difference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) =>
                  category.parameters.map((param) => {
                    const diff = getParameterDiff(
                      category.name.toLowerCase() as keyof VoiceVersion["parameters"],
                      param,
                    );
                    if (!diff) return null;

                    return (
                      <TableRow key={`${category.name}-${param}`}>
                        <TableCell>{category.name}</TableCell>
                        <TableCell className="capitalize">{param}</TableCell>
                        <TableCell>{formatValue(diff.value1)}</TableCell>
                        <TableCell>{formatValue(diff.value2)}</TableCell>
                        <TableCell className={getDiffColor(diff.diff)}>
                          {formatDiff(diff.diff)}
                        </TableCell>
                      </TableRow>
                    );
                  }),
                )}
              </TableBody>
            </Table>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onRevert(version1.id)}>
                Revert to Version {version1.id}
              </Button>
              <Button variant="outline" onClick={() => onRevert(version2.id)}>
                Revert to Version {version2.id}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground">
            Select two versions to compare
          </p>
        )}
      </CardContent>
    </Card>
  );
}
