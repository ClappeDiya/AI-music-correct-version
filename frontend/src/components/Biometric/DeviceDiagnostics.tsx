"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Battery,
  Cpu,
  Signal,
  Clock,
  Heart,
  Activity,
  RotateCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DeviceDiagnostics {
  batteryLevel: number;
  firmwareVersion: string;
  lastSyncTime: string;
  connectionStrength: number;
  sensorStatus: {
    heartRate: boolean;
    accelerometer: boolean;
    gyroscope: boolean;
  };
  errors: string[];
}

interface DeviceDiagnosticsProps {
  data: DeviceDiagnostics;
  deviceType: "garmin" | "apple" | "fitbit";
  className?: string;
}

export function DeviceDiagnostics({
  data,
  deviceType,
  className,
}: DeviceDiagnosticsProps) {
  const getBatteryColor = (level: number) => {
    if (level > 60) return "text-success";
    if (level > 20) return "text-warning";
    return "text-destructive";
  };

  const getConnectionStrengthLabel = (strength: number) => {
    if (strength > 80) return "Excellent";
    if (strength > 60) return "Good";
    if (strength > 40) return "Fair";
    if (strength > 20) return "Poor";
    return "Very Poor";
  };

  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cpu className="h-5 w-5" />
          Device Diagnostics
        </CardTitle>
        <CardDescription>Technical details and sensor status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Battery and Connection Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Battery
                    className={cn(
                      "h-4 w-4",
                      getBatteryColor(data.batteryLevel),
                    )}
                  />
                  <span className="text-sm font-medium">Battery</span>
                </div>
                <span className="text-sm">{data.batteryLevel}%</span>
              </div>
              <Progress
                value={data.batteryLevel}
                className={cn("h-2", getBatteryColor(data.batteryLevel))}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Signal className="h-4 w-4" />
                  <span className="text-sm font-medium">Connection</span>
                </div>
                <span className="text-sm">
                  {getConnectionStrengthLabel(data.connectionStrength)}
                </span>
              </div>
              <Progress value={data.connectionStrength} className="h-2" />
            </div>
          </div>

          {/* Device Info */}
          <div className="space-y-2 p-3 rounded-lg border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCw className="h-4 w-4" />
                <span className="text-sm font-medium">Firmware</span>
              </div>
              <span className="text-sm">{data.firmwareVersion}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">Last Sync</span>
              </div>
              <span className="text-sm">
                {new Date(data.lastSyncTime).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Sensor Status */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="sensors">
              <AccordionTrigger className="text-sm">
                Sensor Status
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      <span className="text-sm">Heart Rate Sensor</span>
                    </div>
                    {data.sensorStatus.heartRate ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      <span className="text-sm">Accelerometer</span>
                    </div>
                    {data.sensorStatus.accelerometer ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RotateCw className="h-4 w-4" />
                      <span className="text-sm">Gyroscope</span>
                    </div>
                    {data.sensorStatus.gyroscope ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Error Log */}
          {data.errors.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">Error Log</span>
              </div>
              <div className="max-h-[100px] overflow-y-auto space-y-1">
                {data.errors.map((error, index) => (
                  <div
                    key={index}
                    className="text-xs text-destructive bg-destructive/10 p-2 rounded"
                  >
                    {error}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
