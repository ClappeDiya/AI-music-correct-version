"use client";

import { useEffect, useState } from "react";
import {
  userPreferencesService,
  LayoutSettings,
} from "../../../services/user-preferences";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/usetoast";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

export function LayoutSettings() {
  const [layout, setLayout] = useState<LayoutSettings | null>(null);

  useEffect(() => {
    loadLayout();
  }, []);

  const loadLayout = async () => {
    try {
      const response = await userPreferencesService.getLayout();
      setLayout(response.data);
    } catch (error) {
      console.error("Error loading layout:", error);
    }
  };

  const handleLayoutChange = async (layoutType: string) => {
    try {
      await userPreferencesService.updateLayout({ layout_type: layoutType });
      loadLayout();
      toast({
        title: "Success",
        description: "Layout updated successfully",
      });
    } catch (error) {
      console.error("Error updating layout:", error);
      toast({
        title: "Error",
        description: "Failed to update layout",
      });
    }
  };

  const handleDensityChange = async (density: LayoutSettings["density"]) => {
    try {
      await userPreferencesService.updateDensity(density);
      loadLayout();
      toast({
        title: "Success",
        description: "Density updated successfully",
      });
    } catch (error) {
      console.error("Error updating density:", error);
      toast({
        title: "Error",
        description: "Failed to update density",
      });
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Layout Preferences</h3>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Layout Style</Label>
          <Select
            value={layout?.layout_type}
            onValueChange={(value: string) => handleLayoutChange(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select layout" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="compact">Compact</SelectItem>
              <SelectItem value="spacious">Spacious</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Density</Label>
          <Select
            value={layout?.density}
            onValueChange={(value: LayoutSettings["density"]) =>
              handleDensityChange(value)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select density" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="compact">Compact</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="comfortable">Comfortable</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
