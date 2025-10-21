"use client";

import { useEffect, useState } from "react";
import { Users, Save, Plus, Settings2 } from "lucide-react";
import { userPreferencesService } from "@/services/user-preferences";
import { useSettingsOperation } from "@/hooks/Usesettings";
import { SettingsCard } from "@/components/ui/SettingsCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/Skeleton";
import { Separator } from "@/components/ui/Separator";
import { Badge } from "@/components/ui/Badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";

interface CompositePreference {
  id: string;
  name: string;
  users: string[];
  preferences: Record<string, any>;
  is_active: boolean;
  created_at: string;
}

interface PreferenceCategory {
  id: string;
  name: string;
  description: string;
  settings: Array<{
    key: string;
    label: string;
    type: "boolean" | "number" | "string" | "select";
    options?: Array<{ value: string; label: string }>;
  }>;
}

export function MultiUserComposite() {
  const [composites, setComposites] = useState<CompositePreference[]>([]);
  const [categories, setCategories] = useState<PreferenceCategory[]>([]);
  const [selectedComposite, setSelectedComposite] =
    useState<CompositePreference | null>(null);
  const [newCompositeName, setNewCompositeName] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { execute: createComposite, loading: creating } = useSettingsOperation(
    userPreferencesService.createComposite,
    "Composite created successfully",
    "Failed to create composite",
  );

  const { execute: updateComposite, loading: updating } = useSettingsOperation(
    userPreferencesService.updateCompositePreferences,
    "Preferences updated successfully",
    "Failed to update preferences",
  );

  const { execute: saveAsPreset, loading: saving } = useSettingsOperation(
    userPreferencesService.saveAsPreset,
    "Saved as preset successfully",
    "Failed to save as preset",
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [compositesResponse, categoriesResponse] = await Promise.all([
        userPreferencesService.getActiveComposites(),
        userPreferencesService.getPreferenceCategories(),
      ]);
      setComposites(compositesResponse.data);
      setCategories(categoriesResponse.data);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleCreateComposite = async () => {
    if (!newCompositeName.trim()) return;

    const success = await createComposite({
      name: newCompositeName,
      preferences: {},
    });

    if (success) {
      setNewCompositeName("");
      setCreateDialogOpen(false);
      loadData();
    }
  };

  const handleUpdatePreferences = async (
    composite: CompositePreference,
    categoryId: string,
    key: string,
    value: any,
  ) => {
    const updatedPreferences = {
      ...composite.preferences,
      [categoryId]: {
        ...composite.preferences[categoryId],
        [key]: value,
      },
    };

    const success = await updateComposite(composite.id, {
      preferences: updatedPreferences,
    });

    if (success) {
      setComposites((prev) =>
        prev.map((c) =>
          c.id === composite.id ? { ...c, preferences: updatedPreferences } : c,
        ),
      );
    }
  };

  const handleSaveAsPreset = async (composite: CompositePreference) => {
    const success = await saveAsPreset(composite.id);
    if (success) {
      loadData();
    }
  };

  if (!categories.length || !composites.length) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-[500px]" />
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-4rem)] px-4 py-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Multi-User Preferences</h2>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Composite
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Composite</DialogTitle>
                <DialogDescription>
                  Create a new preference composite for multiple users
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Composite Name</Label>
                  <Input
                    id="name"
                    value={newCompositeName}
                    onChange={(e) => setNewCompositeName(e.target.value)}
                    placeholder="Enter composite name"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateComposite}
                  disabled={creating || !newCompositeName.trim()}
                >
                  {creating ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {composites.map((composite) => (
            <Card key={composite.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{composite.name}</CardTitle>
                  <Badge
                    variant={composite.is_active ? "default" : "secondary"}
                  >
                    {composite.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <CardDescription>
                  {composite.users.length} users affected
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {categories.map((category) => (
                    <div key={category.id} className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Settings2 className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-medium">{category.name}</h3>
                      </div>
                      <div className="space-y-4">
                        {category.settings.map((setting) => (
                          <div key={setting.key} className="space-y-2">
                            <Label htmlFor={`${composite.id}-${setting.key}`}>
                              {setting.label}
                            </Label>
                            {setting.type === "select" ? (
                              <Select
                                value={
                                  composite.preferences[category.id]?.[
                                    setting.key
                                  ]
                                }
                                onValueChange={(value) =>
                                  handleUpdatePreferences(
                                    composite,
                                    category.id,
                                    setting.key,
                                    value,
                                  )
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select option" />
                                </SelectTrigger>
                                <SelectContent>
                                  {setting.options?.map((option) => (
                                    <SelectItem
                                      key={option.value}
                                      value={option.value}
                                    >
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input
                                id={`${composite.id}-${setting.key}`}
                                type={
                                  setting.type === "number" ? "number" : "text"
                                }
                                value={
                                  composite.preferences[category.id]?.[
                                    setting.key
                                  ] || ""
                                }
                                onChange={(e) =>
                                  handleUpdatePreferences(
                                    composite,
                                    category.id,
                                    setting.key,
                                    setting.type === "number"
                                      ? Number(e.target.value)
                                      : e.target.value,
                                  )
                                }
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-6" />

                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => handleSaveAsPreset(composite)}
                    disabled={saving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save as Preset
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}
