"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Calendar } from "@/components/ui/Calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/usetoast";
import { Switch } from "@/components/ui/Switch";

interface EphemeralPreference {
  eventKey: string;
  preferences: {
    theme?: string;
    notifications?: boolean;
    layout?: string;
  };
  startTime: Date;
  endTime: Date;
}

export default function EphemeralPreferencesForm({
  initialData,
  onSave,
  onCancel,
}: {
  initialData?: EphemeralPreference;
  onSave: (data: EphemeralPreference) => void;
  onCancel: () => void;
}) {
  const [eventKey, setEventKey] = useState(initialData?.eventKey || "");
  const [preferences, setPreferences] = useState(
    initialData?.preferences || {
      theme: "system",
      notifications: true,
      layout: "default",
    },
  );
  const [startTime, setStartTime] = useState<Date | undefined>(
    initialData?.startTime,
  );
  const [endTime, setEndTime] = useState<Date | undefined>(
    initialData?.endTime,
  );

  const handleSave = () => {
    if (!eventKey || !startTime || !endTime) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    if (startTime >= endTime) {
      toast({
        title: "Error",
        description: "End time must be after start time",
        variant: "destructive",
      });
      return;
    }

    onSave({
      eventKey,
      preferences,
      startTime,
      endTime,
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Event Name</Label>
        <Input
          value={eventKey}
          onChange={(e) => setEventKey(e.target.value)}
          placeholder="e.g. Concert Mode, Vacation Mode"
        />
      </div>

      <div className="space-y-2">
        <Label>Preferences</Label>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="notifications"
              checked={preferences.notifications}
              onCheckedChange={(checked: boolean) =>
                setPreferences((prev) => ({ ...prev, notifications: checked }))
              }
            />
            <Label htmlFor="notifications">Enable Notifications</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Label>Theme</Label>
            <select
              value={preferences.theme}
              onChange={(e) =>
                setPreferences((prev) => ({ ...prev, theme: e.target.value }))
              }
              className="border rounded p-2"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Label>Layout</Label>
            <select
              value={preferences.layout}
              onChange={(e) =>
                setPreferences((prev) => ({ ...prev, layout: e.target.value }))
              }
              className="border rounded p-2"
            >
              <option value="default">Default</option>
              <option value="compact">Compact</option>
              <option value="spacious">Spacious</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="space-y-2">
          <Label>Start Time</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !startTime && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startTime ? (
                  format(startTime, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startTime}
                onSelect={setStartTime}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>End Time</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !endTime && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endTime ? format(endTime, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endTime}
                onSelect={setEndTime}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>Save</Button>
      </div>
    </div>
  );
}
