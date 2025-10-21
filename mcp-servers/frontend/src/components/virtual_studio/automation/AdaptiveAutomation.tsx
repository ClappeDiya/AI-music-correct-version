import { useState, useEffect } from "react";
import { Activity, Plus, Settings2, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Switch } from "@/components/ui/Switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { AdaptiveAutomationEvent } from "@/types/virtual_studio";
import { virtualStudioApi } from "@/services/virtual_studio/api";

interface AdaptiveAutomationProps {
  sessionId: number;
  onEventTrigger: (event: AdaptiveAutomationEvent) => void;
}

const eventTypes = [
  { value: "volume", label: "Volume Automation" },
  { value: "pan", label: "Pan Automation" },
  { value: "filter", label: "Filter Automation" },
  { value: "modulation", label: "Modulation" },
  { value: "dynamics", label: "Dynamics Processing" },
];

export function AdaptiveAutomation({
  sessionId,
  onEventTrigger,
}: AdaptiveAutomationProps) {
  const [events, setEvents] = useState<AdaptiveAutomationEvent[]>([]);
  const [activeEvents, setActiveEvents] = useState<Set<number>>(new Set());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newEventType, setNewEventType] = useState("");
  const [newEventParams, setNewEventParams] = useState({
    intensity: "50",
    rate: "1.0",
    sync: true,
  });

  useEffect(() => {
    loadEvents();
  }, [sessionId]);

  const loadEvents = async () => {
    try {
      const data = await virtualStudioApi.getAdaptiveAutomationEvents({
        session: sessionId,
      });
      setEvents(data);
    } catch (error) {
      console.error("Error loading automation events:", error);
    }
  };

  const handleCreateEvent = async () => {
    try {
      const eventData = {
        session: sessionId,
        event_type: newEventType,
        event_details: {
          ...newEventParams,
          intensity: parseFloat(newEventParams.intensity),
          rate: parseFloat(newEventParams.rate),
          created_at: new Date().toISOString(),
        },
      };

      const result =
        await virtualStudioApi.createAdaptiveAutomationEvent(eventData);
      setEvents((prev) => [...prev, result]);
      setIsDialogOpen(false);
      resetNewEventForm();
    } catch (error) {
      console.error("Error creating automation event:", error);
    }
  };

  const resetNewEventForm = () => {
    setNewEventType("");
    setNewEventParams({
      intensity: "50",
      rate: "1.0",
      sync: true,
    });
  };

  const toggleEvent = (eventId: number) => {
    setActiveEvents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });

    const event = events.find((e) => e.id === eventId);
    if (event) {
      onEventTrigger(event);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Adaptive Automation
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Automation Event</DialogTitle>
                <DialogDescription>
                  Configure a new adaptive automation event
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Event Type</Label>
                  <Select value={newEventType} onValueChange={setNewEventType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Intensity (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={newEventParams.intensity}
                    onChange={(e) =>
                      setNewEventParams((prev) => ({
                        ...prev,
                        intensity: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Rate (Hz)</Label>
                  <Input
                    type="number"
                    min="0.1"
                    max="10"
                    step="0.1"
                    value={newEventParams.rate}
                    onChange={(e) =>
                      setNewEventParams((prev) => ({
                        ...prev,
                        rate: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Sync to Tempo</Label>
                  <Switch
                    checked={newEventParams.sync}
                    onCheckedChange={(checked) =>
                      setNewEventParams((prev) => ({
                        ...prev,
                        sync: checked,
                      }))
                    }
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateEvent}>Create Event</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-2">
            {events.map((event) => (
              <Card key={event.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Settings2 className="h-4 w-4" />
                      <div>
                        <h4 className="text-sm font-medium">
                          {eventTypes.find((t) => t.value === event.event_type)
                            ?.label || event.event_type}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Rate: {event.event_details?.rate}Hz
                          {event.event_details?.sync ? " (Synced)" : ""}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant={
                        activeEvents.has(event.id) ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => toggleEvent(event.id)}
                    >
                      {activeEvents.has(event.id) ? (
                        <>
                          <Pause className="h-4 w-4 mr-2" />
                          Active
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Inactive
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {events.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No automation events configured
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
