"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileSparkles, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/components/ui/useToast";

import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Switch } from "@/components/ui/Switch";

import { ReportCategorySelect } from "./report-category-select";
import {
  ReportFilters,
  type ReportFilters as ReportFiltersType,
} from "./report-filters";
import { reportsApi } from "@/lib/api/reports";

export function ReportWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [reportData, setReportData] = useState({
    reportName: "",
    description: "",
    category: "",
    isPublic: false,
    filters: {
      dateRange: {
        from: undefined,
        to: undefined,
      },
      genre: undefined,
      userType: undefined,
      region: undefined,
    } as ReportFiltersType,
  });

  const createReportMutation = useMutation({
    mutationFn: async (data: typeof reportData) => {
      return await reportsApi.create({
        report_name: data.reportName,
        report_parameters: {
          category: data.category,
          description: data.description,
          filters: data.filters,
        },
        is_public: data.isPublic,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Report created successfully",
      });
      router.push("/reports");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create report",
        variant: "destructive",
      });
    },
  });

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleCreate = async () => {
    await createReportMutation.mutateAsync(reportData);
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileSparkles className="h-6 w-6" />
          <span>Create New Report</span>
        </CardTitle>
        <CardDescription>
          Configure your report settings in {step} of 3 steps
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reportName">Report Name</Label>
              <Input
                id="reportName"
                placeholder="Enter report name"
                value={reportData.reportName}
                onChange={(e) =>
                  setReportData({ ...reportData, reportName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter report description"
                value={reportData.description}
                onChange={(e) =>
                  setReportData({ ...reportData, description: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Report Category</Label>
              <ReportCategorySelect
                value={reportData.category}
                onValueChange={(value) =>
                  setReportData({ ...reportData, category: value })
                }
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="public"
                checked={reportData.isPublic}
                onCheckedChange={(checked) =>
                  setReportData({ ...reportData, isPublic: checked })
                }
              />
              <Label htmlFor="public">Make this report public</Label>
            </div>
          </div>
        )}

        {step === 2 && (
          <ReportFilters
            filters={reportData.filters}
            onFiltersChange={(filters) =>
              setReportData({ ...reportData, filters })
            }
          />
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Review Report Settings</h3>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Report Name:</span>{" "}
                {reportData.reportName}
              </p>
              <p>
                <span className="font-medium">Category:</span>{" "}
                {reportData.category}
              </p>
              <p>
                <span className="font-medium">Description:</span>{" "}
                {reportData.description}
              </p>
              <p>
                <span className="font-medium">Visibility:</span>{" "}
                {reportData.isPublic ? "Public" : "Private"}
              </p>
              <p>
                <span className="font-medium">Date Range:</span>{" "}
                {reportData.filters.dateRange.from
                  ? `${reportData.filters.dateRange.from.toLocaleDateString()} - ${
                      reportData.filters.dateRange.to?.toLocaleDateString() ||
                      "Present"
                    }`
                  : "All Time"}
              </p>
              <p>
                <span className="font-medium">Genre:</span>{" "}
                {reportData.filters.genre || "All Genres"}
              </p>
              <p>
                <span className="font-medium">User Type:</span>{" "}
                {reportData.filters.userType || "All Users"}
              </p>
              <p>
                <span className="font-medium">Region:</span>{" "}
                {reportData.filters.region || "Global"}
              </p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleBack} disabled={step === 1}>
          Back
        </Button>
        <div className="space-x-2">
          {step < 3 ? (
            <Button onClick={handleNext}>Next</Button>
          ) : (
            <Button
              onClick={handleCreate}
              disabled={createReportMutation.isPending}
            >
              {createReportMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Report
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
