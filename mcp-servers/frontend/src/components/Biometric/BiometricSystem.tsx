"use client";

import React, { useState, useEffect } from "react";
import { BiometricDataDisplay } from "./BiometricDataDisplay";
import { WearableDeviceConnector } from "./WearableDeviceConnector";
import { useToast } from "@/components/ui/useToast";
import { cn } from "@/lib/utils";

interface BiometricSystemProps {
  sessionId: number;
  className?: string;
}

interface BiometricData {
  heartRate: number;
  stressLevel: number;
  energyLevel: number;
  movement: number;
  mood: string;
  deviceBattery: number;
  lastUpdated: string;
}

interface WearableDevice {
  id: string;
  name: string;
  type: "garmin" | "apple" | "fitbit";
  status: "available" | "connected" | "disconnected" | "error";
}

export function BiometricSystem({
  sessionId,
  className,
}: BiometricSystemProps) {
  const { toast } = useToast();
  const [connectedDevice, setConnectedDevice] = useState<WearableDevice | null>(
    null,
  );
  const [biometricData, setBiometricData] = useState<BiometricData | null>(
    null,
  );

  useEffect(() => {
    if (!connectedDevice) return;

    const fetchBiometricData = async () => {
      try {
        const response = await fetch(`/api/sessions/${sessionId}/biometrics`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) throw new Error("Failed to fetch biometric data");

        const data = await response.json();
        setBiometricData(data);
      } catch (error) {
        console.error("Error fetching biometric data:", error);
      }
    };

    // Initial fetch
    fetchBiometricData();

    // Set up polling interval
    const interval = setInterval(fetchBiometricData, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [sessionId, connectedDevice]);

  const handleDeviceConnect = (device: WearableDevice) => {
    setConnectedDevice(device);
    toast({
      title: "Device Connected",
      description: `Now tracking biometric data from ${device.name}`,
    });
  };

  const handleDeviceDisconnect = () => {
    setConnectedDevice(null);
    setBiometricData(null);
    toast({
      title: "Device Disconnected",
      description: "Biometric tracking stopped",
    });
  };

  return (
    <div
      className={cn(
        "w-full max-w-5xl mx-auto p-4",
        "grid grid-cols-1 lg:grid-cols-2 gap-4",
        className,
      )}
    >
      <div className="w-full flex justify-center">
        <WearableDeviceConnector
          onDeviceConnect={handleDeviceConnect}
          onDeviceDisconnect={handleDeviceDisconnect}
          className="w-full"
        />
      </div>
      <div className="w-full flex justify-center">
        {biometricData && connectedDevice ? (
          <BiometricDataDisplay
            data={biometricData}
            deviceType={connectedDevice.type}
            className="w-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            Connect a device to view biometric data
          </div>
        )}
      </div>
    </div>
  );
}
