"use client";

import { useEffect, useState } from "react";
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
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
  Brain,
  Activity,
  Waves,
  Settings2,
  AlertCircle,
  Music,
  Sliders,
  Power,
  RefreshCw,
} from "lucide-react";
import { api } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Slider } from '@/components/ui/Slider';
import { Progress } from '@/components/ui/Progress';

interface NeuralDevice {
  id: string;
  device_type: string;
  device_name: string;
  connection_status: string;
  signal_quality: number;
  last_calibration: string;
}

interface NeuralSignal {
  id: string;
  device_name: string;
  signal_type: string;
  processed_value: number;
  confidence_score: number;
  timestamp: string;
}

interface NeuralControl {
  id: string;
  name: string;
  signal_type: string;
  control_parameter: string;
  mapping_function: string;
  enabled: boolean;
}

export default function NeuralPage() {
  const { toast } = useToast();
  const [devices, setDevices] = useState<NeuralDevice[]>([]);
  const [signals, setSignals] = useState<NeuralSignal[]>([]);
  const [controls, setControls] = useState<NeuralControl[]>([]);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<string>("");

  useEffect(() => {
    fetchDevices();
    fetchSignals();
    fetchControls();
    const interval = setInterval(fetchSignals, 1000); // Update signals every second
    return () => clearInterval(interval);
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await api.get('/api/neural-devices/');
      setDevices(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch neural devices",
        variant: "destructive",
      });
    }
  };

  const fetchSignals = async () => {
    try {
      const response = await api.get('/api/neural-signals/');
      setSignals(response.data);
    } catch (error) {
      console.error("Failed to fetch neural signals");
    }
  };

  const fetchControls = async () => {
    try {
      const response = await api.get('/api/neural-controls/');
      setControls(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch neural controls",
        variant: "destructive",
      });
    }
  };

  const startCalibration = async (deviceId: string) => {
    try {
      setIsCalibrating(true);
      await api.post(`/api/neural-devices/${deviceId}/calibrate/`);
      toast({
        title: "Calibration Started",
        description: "Please follow the on-screen instructions",
      });
      await new Promise(resolve => setTimeout(resolve, 5000)); // Simulated calibration
      await fetchDevices();
      setIsCalibrating(false);
      toast({
        title: "Calibration Complete",
        description: "Neural device has been calibrated successfully",
      });
    } catch (error) {
      setIsCalibrating(false);
      toast({
        title: "Error",
        description: "Failed to calibrate device",
        variant: "destructive",
      });
    }
  };

  const toggleControl = async (controlId: string, enabled: boolean) => {
    try {
      await api.patch(`/api/neural-controls/${controlId}/`, {
        enabled: !enabled,
      });
      fetchControls();
      toast({
        title: enabled ? "Control Disabled" : "Control Enabled",
        description: `Neural control has been ${enabled ? 'disabled' : 'enabled'}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle control",
        variant: "destructive",
      });
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'eeg_headset':
        return <Brain className="w-6 h-6" />;
      case 'neural_band':
        return <Activity className="w-6 h-6" />;
      case 'emg_sensor':
        return <Waves className="w-6 h-6" />;
      default:
        return <Settings2 className="w-6 h-6" />;
    }
  };

  const getSignalQualityColor = (quality: number) => {
    if (quality >= 0.8) return "bg-green-500";
    if (quality >= 0.5) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Neural Interface Control</h1>
        <Select value={selectedDevice} onValueChange={setSelectedDevice}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Device" />
          </SelectTrigger>
          <SelectContent>
            {devices.map((device) => (
              <SelectItem key={device.id} value={device.id}>
                {device.device_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
                <span>Signal Quality</span>
                <div className="w-32">
                  <Progress
                    value={device.signal_quality * 100}
                    className={getSignalQualityColor(device.signal_quality)}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Last Calibration</span>
                <span className="text-sm text-muted-foreground">
                  {new Date(device.last_calibration).toLocaleString()}
                </span>
              </div>
              <Button
                onClick={() => startCalibration(device.id)}
                disabled={isCalibrating}
                className="w-full"
              >
                {isCalibrating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Calibrating...
                  </>
                ) : (
                  "Calibrate"
                )}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Neural Signals</h2>
          <ScrollArea className="h-[300px]">
            <div className="space-y-4">
              {signals.map((signal) => (
                <div
                  key={signal.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Brain className="w-4 h-4" />
                    <div>
                      <p className="font-medium">{signal.signal_type}</p>
                      <p className="text-sm text-muted-foreground">
                        {signal.device_name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{signal.processed_value.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">
                      {(signal.confidence_score * 100).toFixed(0)}% confidence
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Control Mappings</h2>
          <ScrollArea className="h-[300px]">
            <div className="space-y-4">
              {controls.map((control) => (
                <div
                  key={control.id}
                  className="p-4 bg-muted rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Music className="w-4 h-4" />
                      <div>
                        <p className="font-medium">{control.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {control.signal_type} → {control.control_parameter}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={control.enabled}
                      onCheckedChange={() => toggleControl(control.id, control.enabled)}
                    />
                  </div>
                  {control.enabled && (
                    <div className="mt-4">
                      <Slider
                        defaultValue={[50]}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                        <span>Min</span>
                        <span>Response Curve ({control.mapping_function})</span>
                        <span>Max</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      </div>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="w-full">
            <Settings2 className="mr-2 h-4 w-4" />
            Advanced Settings
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Neural Interface Settings</SheetTitle>
            <SheetDescription>
              Configure advanced settings for neural signal processing and control mappings.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <h3 className="font-medium">Signal Processing</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm">Minimum Confidence Threshold</label>
                  <Slider defaultValue={[50]} max={100} step={1} />
                </div>
                <div>
                  <label className="text-sm">Signal Smoothing</label>
                  <Slider defaultValue={[30]} max={100} step={1} />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Safety Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm">Maximum Session Duration (minutes)</label>
                  <Slider defaultValue={[60]} max={120} step={5} />
                </div>
                <div>
                  <label className="text-sm">Auto-disable on Low Quality</label>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );



