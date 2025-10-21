"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Calendar } from "@/components/ui/Calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { useToast } from "@/components/ui/useToast";
import {
  Download,
  Calendar as CalendarIcon,
  FileJson,
  FileCsv,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { biometricService, BiometricData } from "@/services/biometricService";
import { cn } from "@/lib/utils";

interface DataExportProps {
  sessionId: string;
  className?: string;
}

export function DataExport({ sessionId, className }: DataExportProps) {
  const { toast } = useToast();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isExporting, setIsExporting] = useState(false);
  const [data, setData] = useState<BiometricData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const biometricData = await biometricService.getData(sessionId);
        setData(biometricData);
      } catch (error) {
        console.error("Failed to fetch biometric data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sessionId]);

  const handleExport = async (format: "json" | "csv") => {
    setIsExporting(true);
    try {
      // Use biometricService to get data
      const biometricData = await biometricService.getData(
        sessionId,
        startDate,
        endDate,
      );

      let exportData: Blob;
      if (format === "csv") {
        // Convert JSON to CSV
        const csvContent = convertToCSV(biometricData);
        exportData = new Blob([csvContent], { type: "text/csv" });
      } else {
        exportData = new Blob([JSON.stringify(biometricData)], {
          type: "application/json",
        });
      }

      // Create download link
      const url = URL.createObjectURL(exportData);
      const a = document.createElement("a");
      a.href = url;
      a.download = `biometric-data-${format === "csv" ? "csv" : "json"}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "Your data has been exported successfully",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const convertToCSV = (biometricData: BiometricData[]): string => {
    // Flatten biometric data
    const biometricRows = biometricData.map((item: BiometricData) => ({
      type: "biometric",
      timestamp: new Date(item.timestamp).toISOString(),
      heartRate: item.heartRate,
      stressLevel: item.stressLevel,
      energyLevel: item.energyLevel,
      movement: item.movement,
      mood: item.mood,
    }));

    // Combine all rows
    const allRows = [...biometricRows];

    // Get all unique headers
    const headers = Array.from(
      new Set(allRows.flatMap((row) => Object.keys(row))),
    );

    // Create CSV content
    const csvRows = [
      headers.join(","), // Header row
      ...allRows.map((row) =>
        headers.map((header) => JSON.stringify(row[header] ?? "")).join(","),
      ),
    ];

    return csvRows.join("\n");
  };

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Data
        </CardTitle>
        <CardDescription>
          Export your biometric and diagnostic data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <span className="text-sm font-medium">Start Date</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex-1 space-y-2">
              <span className="text-sm font-medium">End Date</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => handleExport("json")}
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileJson className="h-4 w-4" />
              )}
              Export as JSON
            </Button>
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => handleExport("csv")}
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileCsv className="h-4 w-4" />
              )}
              Export as CSV
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
