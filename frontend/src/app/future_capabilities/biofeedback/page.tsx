"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/useToast";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Activity,
  Heart,
  Watch,
  Glasses,
  Settings2,
  AlertCircle,
  Waves,
  Music,
  Brain,
} from "lucide-react";
import { api } from "@/lib/api";

interface WearableDevice {
  id: string;
  device_type: string;
  device_name: string;
  connection_status: string;
  last_sync: string;
}

interface BiofeedbackData {
  id: string;
  device_name: string;
  data_type: string;
  value: number;
  unit: string;
  timestamp: string;
}

interface BiofeedbackEvent {
  id: string;
  event_type: string;
  trigger_data_info: {
    data_type: string;
    value: number;
    unit: string;
  };
  confidence_score: number;
  applied: boolean;
}

export default function BiofeedbackPage() {
  const { toast } = useToast();
  const [devices, setDevices] = useState<WearableDevice[]>([]);
  const [biofeedbackData, setBiofeedbackData] = useState<BiofeedbackData[]>([]);
  const [events, setEvents] = useState<BiofeedbackEvent[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    fetchDevices();
    fetchBiofeedbackData();
    fetchEvents();
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await api.get("/api/wearable-devices/");
      setDevices(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch wearable devices",
        variant: "destructive",
      });
    }
  };

  const fetchBiofeedbackData = async () => {
    try {
      const response = await api.get("/api/biofeedback-data/");
      setBiofeedbackData(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch biofeedback data",
        variant: "destructive",
      });
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await api.get("/api/biofeedback-events/");
      setEvents(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch biofeedback events",
        variant: "destructive",
      });
    }
  };

  const connectDevice = async (deviceId: string) => {
    try {
      await api.post(`/api/wearable-devices/${deviceId}/connect/`);
      fetchDevices();
      toast({
        title: "Success",
        description: "Device connected successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect device",
        variant: "destructive",
      });
    }
  };

  const toggleMonitoring = async () => {
    try {
      await api.post("/api/biofeedback/toggle-monitoring/", {
        enabled: !isMonitoring,
      });
      setIsMonitoring(!isMonitoring);
      toast({
        title: isMonitoring ? "Monitoring Stopped" : "Monitoring Started",
        description: isMonitoring
          ? "Biofeedback monitoring has been stopped"
          : "Biofeedback monitoring has been started",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle monitoring",
        variant: "destructive",
      });
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "smartwatch":
        return <Watch className="w-6 h-6" />;
      case "fitness_tracker":
        return <Activity className="w-6 h-6" />;
      case "ar_glasses":
        return <Glasses className="w-6 h-6" />;
      default:
        return <Settings2 className="w-6 h-6" />;
    }
  };

  const getDataIcon = (type: string) => {
    switch (type) {
      case "heart_rate":
        return <Heart className="w-4 h-4" />;
      case "movement":
        return <Activity className="w-4 h-4" />;
      case "focus_level":
        return <Brain className="w-4 h-4" />;
      default:
        return <Waves className="w-4 h-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Biofeedback Integration</h1>
        <Button
          onClick={toggleMonitoring}
          variant={isMonitoring ? "destructive" : "default"}
        >
          {isMonitoring ? "Stop Monitoring" : "Start Monitoring"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {devices.map((device) => (
          <Card key={device.id} className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold">{device.device_name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {device.device_type}
                </p>
              </div>
              {getDeviceIcon(device.device_type)}
            </div>
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span>Status</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    device.connection_status === "connected"
                      ? "bg-green-500/20 text-green-700"
                      : "bg-red-500/20 text-red-700"
                  }`}
                >
                  {device.connection_status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Last Sync</span>
                <span className="text-sm text-muted-foreground">
                  {new Date(device.last_sync).toLocaleString()}
                </span>
              </div>
              <Button
                onClick={() => connectDevice(device.id)}
                disabled={device.connection_status === "connected"}
                className="w-full"
              >
                {device.connection_status === "connected"
                  ? "Connected"
                  : "Connect"}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Real-time Data</h2>
          <ScrollArea className="h-[300px]">
            <div className="space-y-4">
              {biofeedbackData.map((data) => (
                <div
                  key={data.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getDataIcon(data.data_type)}
                    <div>
                      <p className="font-medium">{data.data_type}</p>
                      <p className="text-sm text-muted-foreground">
                        {data.device_name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {data.value} {data.unit}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(data.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Events</h2>
          <ScrollArea className="h-[300px]">
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Music className="w-4 h-4" />
                      <span className="font-medium">{event.event_type}</span>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        event.applied
                          ? "bg-green-500/20 text-green-700"
                          : "bg-yellow-500/20 text-yellow-700"
                      }`}
                    >
                      {event.applied ? "Applied" : "Pending"}
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm">
                      Triggered by: {event.trigger_data_info.data_type} -{" "}
                      {event.trigger_data_info.value}{" "}
                      {event.trigger_data_info.unit}
                    </p>
                    <div className="flex items-center mt-1">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      <span className="text-sm">
                        Confidence: {(event.confidence_score * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
}
