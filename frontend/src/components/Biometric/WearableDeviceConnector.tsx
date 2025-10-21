"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Watch,
  Bluetooth,
  BluetoothOff,
  RefreshCw,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useToast } from "@/components/ui/useToast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { cn } from "@/lib/utils";

interface WearableDevice {
  id: string;
  name: string;
  type: "garmin" | "apple" | "fitbit";
  status: "available" | "connected" | "disconnected" | "error";
}

interface WearableDeviceConnectorProps {
  onDeviceConnect: (device: WearableDevice) => void;
  onDeviceDisconnect: (deviceId: string) => void;
  className?: string;
}

export function WearableDeviceConnector({
  onDeviceConnect,
  onDeviceDisconnect,
  className,
}: WearableDeviceConnectorProps) {
  const { toast } = useToast();
  const [scanning, setScanning] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("");
  const [devices, setDevices] = useState<WearableDevice[]>([]);

  const scanForDevices = async () => {
    if (!selectedType) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a device type first",
      });
      return;
    }

    setScanning(true);
    try {
      const response = await fetch("/api/wearables/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: selectedType }),
      });

      if (!response.ok) throw new Error("Failed to scan for devices");

      const newDevices = await response.json();
      setDevices(newDevices);

      toast({
        title: "Success",
        description: `Found ${newDevices.length} devices`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to scan for devices",
      });
    } finally {
      setScanning(false);
    }
  };

  const handleConnect = async (device: WearableDevice) => {
    try {
      const response = await fetch("/api/wearables/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId: device.id }),
      });

      if (!response.ok) throw new Error("Failed to connect to device");

      const updatedDevice = await response.json();
      setDevices((prev) =>
        prev.map((d) => (d.id === device.id ? updatedDevice : d)),
      );
      onDeviceConnect(updatedDevice);

      toast({
        title: "Connected",
        description: `Successfully connected to ${device.name}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to connect to device",
      });
    }
  };

  const handleDisconnect = async (device: WearableDevice) => {
    try {
      const response = await fetch("/api/wearables/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId: device.id }),
      });

      if (!response.ok) throw new Error("Failed to disconnect device");

      setDevices((prev) =>
        prev.map((d) =>
          d.id === device.id ? { ...d, status: "disconnected" } : d,
        ),
      );
      onDeviceDisconnect(device.id);

      toast({
        title: "Disconnected",
        description: `Successfully disconnected from ${device.name}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to disconnect device",
      });
    }
  };

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Watch className="h-5 w-5" />
          Connect Wearable
        </CardTitle>
        <CardDescription>
          Connect your wearable device to enable biometric features
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Select device type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="garmin">Garmin</SelectItem>
                <SelectItem value="apple">Apple Watch</SelectItem>
                <SelectItem value="fitbit">Fitbit</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={scanForDevices}
              disabled={scanning || !selectedType}
              className="w-full sm:w-auto gap-2"
            >
              {scanning ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Bluetooth className="h-4 w-4" />
                  Scan for Devices
                </>
              )}
            </Button>
          </div>

          <div className="space-y-2">
            {devices.map((device) => (
              <div
                key={device.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  {device.status === "connected" ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : device.status === "error" ? (
                    <XCircle className="h-4 w-4 text-destructive" />
                  ) : (
                    <BluetoothOff className="h-4 w-4 text-muted-foreground" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{device.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {device.type}
                    </p>
                  </div>
                </div>
                <Button
                  variant={
                    device.status === "connected" ? "destructive" : "default"
                  }
                  size="sm"
                  onClick={() =>
                    device.status === "connected"
                      ? handleDisconnect(device)
                      : handleConnect(device)
                  }
                  className="gap-2"
                >
                  {device.status === "connected" ? (
                    <>
                      <BluetoothOff className="h-4 w-4" />
                      Disconnect
                    </>
                  ) : (
                    <>
                      <Bluetooth className="h-4 w-4" />
                      Connect
                    </>
                  )}
                </Button>
              </div>
            ))}
            {devices.length === 0 && !scanning && (
              <div className="flex flex-col items-center justify-center h-24 text-muted-foreground text-sm">
                <BluetoothOff className="h-6 w-6 mb-2" />
                No devices found
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
