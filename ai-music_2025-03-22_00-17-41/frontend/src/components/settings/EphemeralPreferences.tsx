import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/useToast";
import { Button } from "@/components/ui/Button";
import { Calendar } from "@/components/ui/Calendar";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Clock, Music, Users } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { userPreferencesService } from "../../services/user-preferences";

interface EphemeralEvent {
  id: string;
  event_type: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  priority: string;
  active: boolean;
  ephemeral_prefs: any;
}

export const EphemeralPreferences: React.FC = () => {
  const [activeEvents, setActiveEvents] = useState<EphemeralEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [duration, setDuration] = useState(120);
  const { toast } = useToast();

  useEffect(() => {
    fetchActiveEvents();
  }, []);

  const fetchActiveEvents = async () => {
    try {
      const response = await userPreferencesService.getEventPreferences();
      setActiveEvents(response.data);
    } catch (error) {
      console.error("Error fetching active events:", error);
    }
  };

  const applyConcertMode = async (data: any) => {
    try {
      const response = await userPreferencesService.createEventPreference({
        event_type: "concert_mode",
        ...data,
      });
      setActiveEvents((prev) => [...prev, response.data]);
      toast({
        title: "Concert Mode Activated",
        description: `Settings will revert after ${duration} minutes`,
      });
    } catch (error) {
      console.error("Error applying concert mode:", error);
    }
  };

  const applyJamSession = async (data: any) => {
    try {
      const response = await userPreferencesService.createEventPreference({
        event_type: "jam_session",
        ...data,
      });
      setActiveEvents((prev) => [...prev, response.data]);
      toast({
        title: "Jam Session Mode Activated",
        description: `Settings will revert after ${duration} minutes`,
      });
    } catch (error) {
      console.error("Error applying jam session:", error);
    }
  };

  const scheduleEvent = async (data: any) => {
    try {
      const response = await userPreferencesService.createEventPreference(data);
      setActiveEvents((prev) => [...prev, response.data]);
      toast({
        title: "Event Scheduled",
        description: `${data.event_type === "concert_mode" ? "Concert" : "Jam Session"} scheduled for ${format(new Date(data.start_time), "PPP")}`,
      });
    } catch (error) {
      console.error("Error scheduling event:", error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Event-Driven Preferences</CardTitle>
          <CardDescription>
            Temporarily adjust your settings for specific events or durations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="quick" className="w-full">
            <TabsList>
              <TabsTrigger value="quick">Quick Apply</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="active">Active Events</TabsTrigger>
            </TabsList>

            <TabsContent value="quick">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    min={1}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      applyConcertMode({ duration_minutes: duration })
                    }
                  >
                    <Music className="mr-2 h-4 w-4" />
                    Concert Mode
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      applyJamSession({ duration_minutes: duration })
                    }
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Jam Session
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="schedule">
              <div className="grid gap-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />

                <div className="space-y-2">
                  <Label>Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    min={1}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      scheduleEvent({
                        event_type: "concert_mode",
                        start_time: selectedDate?.toISOString(),
                        end_time: new Date(
                          selectedDate?.getTime() + duration * 60000,
                        ).toISOString(),
                        duration_minutes: duration,
                      })
                    }
                  >
                    Schedule Concert
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      scheduleEvent({
                        event_type: "jam_session",
                        start_time: selectedDate?.toISOString(),
                        end_time: new Date(
                          selectedDate?.getTime() + duration * 60000,
                        ).toISOString(),
                        duration_minutes: duration,
                      })
                    }
                  >
                    Schedule Jam Session
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="active">
              <div className="space-y-4">
                {activeEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No active events
                  </p>
                ) : (
                  activeEvents.map((event) => (
                    <Card key={event.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {event.event_type === "concert_mode"
                            ? "Concert Mode"
                            : "Jam Session"}
                        </CardTitle>
                        <CardDescription>
                          Ends at {format(new Date(event.end_time), "pp")}
                        </CardDescription>
                      </CardHeader>
                      <CardFooter>
                        <Button
                          variant="outline"
                          size="sm"
                          className="ml-auto"
                          onClick={async () => {
                            await userPreferencesService.deleteEventPreference(
                              event.id,
                            );
                            fetchActiveEvents();
                          }}
                        >
                          End Early
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
