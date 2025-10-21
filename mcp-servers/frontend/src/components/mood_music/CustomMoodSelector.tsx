"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Slider } from "@/components/ui/Slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { Plus, Palette } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface CustomMood {
  name: string;
  description: string;
  color: string;
  base_intensity: number;
}

export function CustomMoodSelector() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#6366f1"); // Default indigo color
  const [baseIntensity, setBaseIntensity] = useState(0.5);

  const queryClient = useQueryClient();

  const { mutate: createCustomMood, isLoading } = useMutation({
    mutationFn: async (mood: CustomMood) => {
      const response = await api.post("/api/custom-moods", mood);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moods"] });
      setOpen(false);
      resetForm();
    },
  });

  const resetForm = () => {
    setName("");
    setDescription("");
    setColor("#6366f1");
    setBaseIntensity(0.5);
  };

  const handleSubmit = () => {
    if (!name) return;

    createCustomMood({
      name,
      description,
      color,
      base_intensity: baseIntensity,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full h-9 sm:h-10 text-sm sm:text-base"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Custom Mood
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Custom Mood</DialogTitle>
          <DialogDescription>
            Define a new mood with your preferred color and intensity.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter mood name..."
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this mood..."
            />
          </div>
          <div className="grid gap-2">
            <Label className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Color
            </Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-16 h-9 p-1 cursor-pointer"
              />
              <Input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#000000"
                className="flex-1"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Base Intensity</Label>
            <Slider
              value={[baseIntensity]}
              onValueChange={([value]) => setBaseIntensity(value)}
              min={0}
              max={1}
              step={0.01}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Subtle</span>
              <span>Intense</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name || isLoading}>
            {isLoading ? "Creating..." : "Create Mood"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
