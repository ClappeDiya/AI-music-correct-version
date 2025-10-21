"use client";

import { useEffect, useState } from "react";
import {
  userPreferencesService,
  ThemeSettings,
} from "../../../services/user-preferences";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/usetoast";

export default function ThemeSelector() {
  const [theme, setTheme] = useState<ThemeSettings | null>(null);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const response = await userPreferencesService.getTheme();
      setTheme(response.data);
    } catch (error) {
      console.error("Error loading theme:", error);
    }
  };

  const handleThemeChange = async (newTheme: string) => {
    try {
      await userPreferencesService.updateTheme({ theme: newTheme });
      loadTheme();
      toast({
        title: "Success",
        description: "Theme updated successfully",
      });
    } catch (error) {
      console.error("Error updating theme:", error);
      toast({
        title: "Error",
        description: "Failed to update theme",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Theme Selection</h3>
      <div className="flex gap-2">
        <Button
          variant={theme === "light" ? "default" : "outline"}
          onClick={() => handleThemeChange("light")}
        >
          Light
        </Button>
        <Button
          variant={theme === "dark" ? "default" : "outline"}
          onClick={() => handleThemeChange("dark")}
        >
          Dark
        </Button>
        <Button
          variant={theme === "system" ? "default" : "outline"}
          onClick={() => handleThemeChange("system")}
        >
          System
        </Button>
      </div>
    </div>
  );
}
