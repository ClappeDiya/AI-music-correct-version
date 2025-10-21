"use client";

import { useState, useEffect, useRef } from "react";
import { debounce } from "lodash";
import {
  Volume2,
  ArrowLeftRight,
  Filter,
  Waveform,
  Activity,
  Music2,
  Gamepad2,
  Save,
  Folder,
  SplitSquareHorizontal,
  Record,
  Pause,
  Disc,
  Sliders,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Slider } from "@/components/ui/Slider";
import { Label } from "@/components/ui/Label";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { virtualStudioApi } from "@/services/virtual_studio/api";

interface Parameter {
  name: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  icon: React.ReactNode;
  description: string;
  midiCC?: number;
  programChange?: number;
}

interface MIDIPreset {
  id: string;
  name: string;
  mappings: {
    parameter: string;
    cc?: number;
    programChange?: number;
  }[];
}

interface LiveParameterControlsProps {
  trackId: string;
  instrumentId: string;
  onParameterChange?: (name: string, value: number) => void;
}

interface AutomationPoint {
  time: number;
  value: number;
  parameter: string;
}

export function LiveParameterControls({
  trackId,
  instrumentId,
  onParameterChange,
}: LiveParameterControlsProps) {
  const [parameters, setParameters] = useState<Parameter[]>([
    {
      name: "volume",
      value: 0,
      min: -60,
      max: 12,
      step: 0.1,
      unit: "dB",
      icon: <Volume2 className="h-4 w-4" />,
      description: "Adjust the volume level from -60dB to +12dB",
      midiCC: 7, // Default MIDI CC for volume
    },
    {
      name: "pan",
      value: 0,
      min: -100,
      max: 100,
      step: 1,
      unit: "%",
      icon: <ArrowLeftRight className="h-4 w-4" />,
      description: "Control stereo position from left (-100%) to right (100%)",
      midiCC: 10, // Default MIDI CC for pan
    },
    {
      name: "cutoff",
      value: 20000,
      min: 20,
      max: 20000,
      step: 1,
      unit: "Hz",
      icon: <Filter className="h-4 w-4" />,
      description: "Adjust filter cutoff frequency from 20Hz to 20kHz",
      midiCC: 74, // Default MIDI CC for filter cutoff
    },
    {
      name: "resonance",
      value: 0,
      min: 0,
      max: 100,
      step: 1,
      unit: "%",
      icon: <Sliders className="h-4 w-4" />,
      description: "Adjust filter resonance/Q factor",
      midiCC: 71,
    },
    {
      name: "attack",
      value: 0,
      min: 0,
      max: 1000,
      step: 1,
      unit: "ms",
      icon: <Activity className="h-4 w-4" />,
      description: "Envelope attack time",
      midiCC: 73,
    },
    {
      name: "release",
      value: 100,
      min: 0,
      max: 2000,
      step: 1,
      unit: "ms",
      icon: <Activity className="h-4 w-4" />,
      description: "Envelope release time",
      midiCC: 72,
    },
  ]);

  const [meterLevels, setMeterLevels] = useState({
    left: -60,
    right: -60,
  });

  const [spectrumData, setSpectrumData] = useState<number[]>(
    new Array(128).fill(0),
  );
  const [midiActivity, setMidiActivity] = useState<{
    cc: number;
    value: number;
  } | null>(null);
  const [selectedParameter, setSelectedParameter] = useState<string | null>(
    null,
  );
  const [midiLearning, setMidiLearning] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [activeTab, setActiveTab] = useState("spectrum");
  const [waveformData, setWaveformData] = useState<number[]>(
    new Array(512).fill(0),
  );
  const [phaseCorrelation, setPhaseCorrelation] = useState(0);
  const [presets, setPresets] = useState<MIDIPreset[]>([]);
  const [newPresetName, setNewPresetName] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const spectrumCanvasRef = useRef<HTMLCanvasElement>(null);
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null);
  const phaseCanvasRef = useRef<HTMLCanvasElement>(null);

  const [vectorscopeData, setVectorscopeData] = useState<
    { x: number; y: number }[]
  >([]);
  const [correlationHistory, setCorrelationHistory] = useState<number[]>(
    new Array(100).fill(0),
  );
  const [isRecordingAutomation, setIsRecordingAutomation] = useState(false);
  const [automationPoints, setAutomationPoints] = useState<AutomationPoint[]>(
    [],
  );
  const [automationStartTime, setAutomationStartTime] = useState<number | null>(
    null,
  );

  const vectorscopeCanvasRef = useRef<HTMLCanvasElement>(null);
  const correlationHistoryCanvasRef = useRef<HTMLCanvasElement>(null);

  // Load presets
  useEffect(() => {
    const loadPresets = async () => {
      try {
        const data = await virtualStudioApi.getMIDIPresets(trackId);
        setPresets(data);
      } catch (error) {
        console.error("Error loading MIDI presets:", error);
      }
    };
    loadPresets();
  }, [trackId]);

  // MIDI setup with program change support
  useEffect(() => {
    if (navigator.requestMIDIAccess) {
      navigator
        .requestMIDIAccess()
        .then((access) => {
          access.inputs.forEach((input) => {
            input.onmidimessage = handleMIDIMessage;
          });
        })
        .catch((err) => console.error("MIDI access denied:", err));
    }
  }, []);

  // Enhanced MIDI message handler
  const handleMIDIMessage = (message: WebMidi.MIDIMessageEvent) => {
    const [status, data1, data2] = message.data;
    const channel = status & 0x0f;

    if ((status & 0xf0) === 0xb0) {
      // CC message handling
      const cc = data1;
      const value = data2;

      setMidiActivity({ cc, value });

      if (midiLearning && selectedParameter) {
        setParameters((prev) =>
          prev.map((param) =>
            param.name === selectedParameter ? { ...param, midiCC: cc } : param,
          ),
        );
        setMidiLearning(false);
        setSelectedParameter(null);
      } else {
        const param = parameters.find((p) => p.midiCC === cc);
        if (param) {
          const normalizedValue =
            (value / 127) * (param.max - param.min) + param.min;
          handleParameterChange(param.name, normalizedValue);
        }
      }
    } else if ((status & 0xf0) === 0xc0) {
      // Program change message
      const program = data1;
      const param = parameters.find((p) => p.programChange === program);
      if (param) {
        handleParameterChange(param.name, param.max); // Set to max value on program change
      }
    }
  };

  // Spectrum analyzer animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      // Simulate spectrum data (replace with real audio analysis in production)
      const newData = spectrumData.map((v, i) => {
        const target = Math.random() * 0.5 + (Math.sin(i * 0.1) * 0.25 + 0.25);
        return v * 0.9 + target * 0.1;
      });
      setSpectrumData(newData);

      // Draw spectrum
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "hsl(var(--primary))";

      const barWidth = canvas.width / newData.length;
      newData.forEach((value, i) => {
        const height = value * canvas.height;
        ctx.fillRect(
          i * barWidth,
          canvas.height - height,
          barWidth * 0.8,
          height,
        );
      });

      requestAnimationFrame(animate);
    };

    const animation = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animation);
  }, [spectrumData]);

  // Waveform visualization
  useEffect(() => {
    const canvas = waveformCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      // Simulate waveform data
      const newData = Array.from({ length: 512 }, (_, i) => {
        return Math.sin(i * 0.1 + Date.now() * 0.01) * 0.5;
      });
      setWaveformData(newData);

      // Draw waveform
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.strokeStyle = "hsl(var(--primary))";
      ctx.lineWidth = 2;

      newData.forEach((value, i) => {
        const x = (i / newData.length) * canvas.width;
        const y = ((value + 1) * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();
      requestAnimationFrame(animate);
    };

    const animation = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animation);
  }, []);

  // Phase correlation visualization
  useEffect(() => {
    const canvas = phaseCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      // Simulate phase correlation (-1 to 1)
      const newPhase = Math.sin(Date.now() * 0.001) * 0.5;
      setPhaseCorrelation(newPhase);

      // Draw phase correlation
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.arc(
        canvas.width / 2,
        canvas.height / 2,
        canvas.height / 2 - 10,
        0,
        Math.PI * 2,
      );
      ctx.strokeStyle = "hsl(var(--muted-foreground))";
      ctx.stroke();

      const angle = (newPhase + 1) * Math.PI;
      const x = Math.cos(angle) * (canvas.height / 2 - 10);
      const y = Math.sin(angle) * (canvas.height / 2 - 10);

      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, canvas.height / 2);
      ctx.lineTo(canvas.width / 2 + x, canvas.height / 2 + y);
      ctx.strokeStyle = "hsl(var(--primary))";
      ctx.lineWidth = 2;
      ctx.stroke();

      requestAnimationFrame(animate);
    };

    const animation = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animation);
  }, []);

  // Vectorscope visualization
  useEffect(() => {
    const canvas = vectorscopeCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      // Simulate vectorscope data (Lissajous figure)
      const time = Date.now() * 0.001;
      const points = Array.from({ length: 360 }, (_, i) => {
        const angle = (i / 360) * Math.PI * 2;
        return {
          x: Math.sin(angle * 3 + time) * 0.5,
          y: Math.sin(angle * 2 + time * 1.5) * 0.5,
        };
      });
      setVectorscopeData(points);

      // Draw vectorscope
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "hsl(var(--primary))";
      ctx.lineWidth = 1;
      ctx.beginPath();

      points.forEach((point, i) => {
        const x = ((point.x + 1) * canvas.width) / 2;
        const y = ((point.y + 1) * canvas.height) / 2;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.closePath();
      ctx.stroke();

      requestAnimationFrame(animate);
    };

    const animation = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animation);
  }, []);

  // Correlation history visualization
  useEffect(() => {
    const canvas = correlationHistoryCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      // Update correlation history
      const newCorrelation = Math.sin(Date.now() * 0.001) * 0.5;
      setCorrelationHistory((prev) => [...prev.slice(1), newCorrelation]);

      // Draw correlation history
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "hsl(var(--primary))";
      ctx.lineWidth = 1;
      ctx.beginPath();

      correlationHistory.forEach((value, i) => {
        const x = (i / correlationHistory.length) * canvas.width;
        const y = (1 - (value + 1) / 2) * canvas.height;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();

      requestAnimationFrame(animate);
    };

    const animation = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animation);
  }, [correlationHistory]);

  // Debounced update function to prevent too many API calls
  const debouncedUpdate = useRef(
    debounce(async (name: string, value: number) => {
      try {
        await virtualStudioApi.updateTrackInstrumentParameter(
          trackId,
          instrumentId,
          {
            parameter: name,
            value: value,
          },
        );
      } catch (error) {
        console.error("Error updating parameter:", error);
      }
    }, 50),
  ).current;

  // Simulated meter levels update
  useEffect(() => {
    const interval = setInterval(() => {
      setMeterLevels({
        left: Math.max(
          -60,
          Math.min(0, meterLevels.left + (Math.random() * 2 - 1)),
        ),
        right: Math.max(
          -60,
          Math.min(0, meterLevels.right + (Math.random() * 2 - 1)),
        ),
      });
    }, 50);

    return () => clearInterval(interval);
  }, [meterLevels]);

  // MIDI automation recording
  const handleAutomationRecording = () => {
    if (isRecordingAutomation) {
      setIsRecordingAutomation(false);
      setAutomationStartTime(null);

      // Save automation data
      if (automationPoints.length > 0) {
        virtualStudioApi
          .saveAutomation(trackId, instrumentId, automationPoints)
          .catch((error) => console.error("Error saving automation:", error));
      }
    } else {
      setIsRecordingAutomation(true);
      setAutomationStartTime(Date.now());
      setAutomationPoints([]);
    }
  };

  // Enhanced parameter change handler with automation recording
  const handleParameterChange = (name: string, value: number) => {
    setParameters((prev) =>
      prev.map((param) => (param.name === name ? { ...param, value } : param)),
    );

    onParameterChange?.(name, value);
    debouncedUpdate(name, value);

    // Record automation point if recording is active
    if (isRecordingAutomation && automationStartTime) {
      const time = Date.now() - automationStartTime;
      setAutomationPoints((prev) => [
        ...prev,
        { time, value, parameter: name },
      ]);
    }
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === "Hz" && value >= 1000) {
      return `${(value / 1000).toFixed(1)}kHz`;
    }
    return `${value}${unit}`;
  };

  const startMIDILearn = (paramName: string) => {
    setSelectedParameter(paramName);
    setMidiLearning(true);
  };

  // Save MIDI preset
  const handleSavePreset = async () => {
    if (!newPresetName) return;

    const preset: MIDIPreset = {
      id: Date.now().toString(),
      name: newPresetName,
      mappings: parameters.map((param) => ({
        parameter: param.name,
        cc: param.midiCC,
        programChange: param.programChange,
      })),
    };

    try {
      await virtualStudioApi.saveMIDIPreset(trackId, preset);
      setPresets((prev) => [...prev, preset]);
      setNewPresetName("");
    } catch (error) {
      console.error("Error saving MIDI preset:", error);
    }
  };

  // Load MIDI preset
  const handleLoadPreset = (presetId: string) => {
    const preset = presets.find((p) => p.id === presetId);
    if (!preset) return;

    setParameters((prev) =>
      prev.map((param) => {
        const mapping = preset.mappings.find((m) => m.parameter === param.name);
        return mapping
          ? {
              ...param,
              midiCC: mapping.cc,
              programChange: mapping.programChange,
            }
          : param;
      }),
    );
    setSelectedPreset(presetId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Waveform className="h-5 w-5" />
            Live Parameters
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={isRecordingAutomation ? "destructive" : "outline"}
              size="sm"
              onClick={handleAutomationRecording}
              className="flex items-center gap-2"
            >
              {isRecordingAutomation ? (
                <>
                  <Pause className="h-4 w-4" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Record className="h-4 w-4" />
                  Record Automation
                </>
              )}
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Folder className="h-4 w-4" />
                  MIDI Presets
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>MIDI Mapping Presets</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="New preset name"
                      value={newPresetName}
                      onChange={(e) => setNewPresetName(e.target.value)}
                    />
                    <Button
                      onClick={handleSavePreset}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Save
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {presets.map((preset) => (
                      <div
                        key={preset.id}
                        className={cn(
                          "flex items-center justify-between p-2 rounded-md border",
                          selectedPreset === preset.id && "border-primary",
                        )}
                      >
                        <span>{preset.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLoadPreset(preset.id)}
                        >
                          Load
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-6 w-full">
                <TabsTrigger value="spectrum">Spectrum</TabsTrigger>
                <TabsTrigger value="waveform">Waveform</TabsTrigger>
                <TabsTrigger value="phase">Phase</TabsTrigger>
                <TabsTrigger value="vectorscope">Vectorscope</TabsTrigger>
                <TabsTrigger value="correlation">Correlation</TabsTrigger>
                <TabsTrigger value="meters">Meters</TabsTrigger>
              </TabsList>

              <TabsContent value="spectrum">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Music2 className="h-4 w-4" />
                    Spectrum Analyzer
                  </Label>
                  <div className="h-32 bg-secondary rounded-lg overflow-hidden">
                    <canvas
                      ref={spectrumCanvasRef}
                      width={512}
                      height={128}
                      className="w-full h-full"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="waveform">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Waveform className="h-4 w-4" />
                    Waveform Display
                  </Label>
                  <div className="h-32 bg-secondary rounded-lg overflow-hidden">
                    <canvas
                      ref={waveformCanvasRef}
                      width={512}
                      height={128}
                      className="w-full h-full"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="phase">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <SplitSquareHorizontal className="h-4 w-4" />
                    Phase Correlation
                  </Label>
                  <div className="h-32 bg-secondary rounded-lg overflow-hidden">
                    <canvas
                      ref={phaseCanvasRef}
                      width={128}
                      height={128}
                      className="w-full h-full"
                    />
                    <div className="text-center text-sm text-muted-foreground mt-2">
                      {phaseCorrelation.toFixed(2)}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="vectorscope">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Disc className="h-4 w-4" />
                    Vectorscope
                  </Label>
                  <div className="h-32 bg-secondary rounded-lg overflow-hidden">
                    <canvas
                      ref={vectorscopeCanvasRef}
                      width={128}
                      height={128}
                      className="w-full h-full"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="correlation">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Correlation History
                  </Label>
                  <div className="h-32 bg-secondary rounded-lg overflow-hidden">
                    <canvas
                      ref={correlationHistoryCanvasRef}
                      width={512}
                      height={128}
                      className="w-full h-full"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="meters">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Output Levels
                  </Label>
                  <div className="flex gap-2">
                    <div className="flex-1 space-y-1">
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full transition-all duration-75",
                            meterLevels.left > -6
                              ? "bg-destructive"
                              : "bg-primary",
                          )}
                          style={{
                            width: `${Math.max(0, ((meterLevels.left + 60) / 60) * 100)}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>L</span>
                        <span>{Math.round(meterLevels.left)}dB</span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full transition-all duration-75",
                            meterLevels.right > -6
                              ? "bg-destructive"
                              : "bg-primary",
                          )}
                          style={{
                            width: `${Math.max(0, ((meterLevels.right + 60) / 60) * 100)}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>R</span>
                        <span>{Math.round(meterLevels.right)}dB</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* MIDI Activity Indicator */}
            {midiActivity && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground animate-in fade-in">
                <Gamepad2 className="h-4 w-4" />
                <span>
                  MIDI CC {midiActivity.cc}: {midiActivity.value}
                </span>
              </div>
            )}
          </div>

          {/* Parameter Controls */}
          <div className="grid grid-cols-2 gap-4">
            {parameters.map((param) => (
              <div key={param.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Label className="flex items-center gap-2 cursor-help">
                        {param.icon}
                        <span className="capitalize">{param.name}</span>
                      </Label>
                    </HoverCardTrigger>
                    <HoverCardContent>
                      <p className="text-sm">{param.description}</p>
                    </HoverCardContent>
                  </HoverCard>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {formatValue(param.value, param.unit)}
                    </span>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "px-2",
                            (param.midiCC !== undefined ||
                              param.programChange !== undefined) &&
                              "text-primary",
                          )}
                        >
                          <Gamepad2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>MIDI Mapping</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Control Change (CC)</Label>
                            <Select
                              value={param.midiCC?.toString()}
                              onValueChange={(value) =>
                                setParameters((prev) =>
                                  prev.map((p) =>
                                    p.name === param.name
                                      ? { ...p, midiCC: parseInt(value) }
                                      : p,
                                  ),
                                )
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select CC" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 128 }, (_, i) => (
                                  <SelectItem key={i} value={i.toString()}>
                                    CC {i}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Program Change</Label>
                            <Select
                              value={param.programChange?.toString()}
                              onValueChange={(value) =>
                                setParameters((prev) =>
                                  prev.map((p) =>
                                    p.name === param.name
                                      ? { ...p, programChange: parseInt(value) }
                                      : p,
                                  ),
                                )
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Program" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 128 }, (_, i) => (
                                  <SelectItem key={i} value={i.toString()}>
                                    Program {i}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <Button
                            variant="secondary"
                            className="w-full"
                            onClick={() => startMIDILearn(param.name)}
                          >
                            {midiLearning && selectedParameter === param.name
                              ? "Waiting for MIDI CC..."
                              : "Learn CC"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <Slider
                  value={[param.value]}
                  min={param.min}
                  max={param.max}
                  step={param.step}
                  onValueChange={([value]) =>
                    handleParameterChange(param.name, value)
                  }
                />
              </div>
            ))}
          </div>

          {/* Automation Recording Indicator */}
          {isRecordingAutomation && (
            <div className="flex items-center justify-between p-2 rounded-md border border-destructive animate-pulse">
              <div className="flex items-center gap-2">
                <Record className="h-4 w-4 text-destructive" />
                <span>Recording Automation</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {Math.floor((Date.now() - (automationStartTime || 0)) / 1000)}s
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
