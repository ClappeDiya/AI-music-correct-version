"use client";

import { useState, useRef, useEffect } from "react";
import {
  Waveform,
  Activity,
  Maximize2,
  ArrowLeftRight,
  Save,
  BarChart3,
  Layers,
  Sliders,
  Disc,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Slider } from "@/components/ui/Slider";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Label } from "@/components/ui/Label";
import { Switch } from "@/components/ui/Switch";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { virtualStudioApi } from "@/services/virtual_studio/api";

interface MasteringChainProps {
  sessionId: string;
  onParameterChange?: (type: string, param: string, value: number) => void;
}

interface MasterLevels {
  left: number;
  right: number;
  peakLeft: number;
  peakRight: number;
  rmsLeft: number;
  rmsRight: number;
  lufs: number;
  dynamicRange: number;
}

interface MasteringSnapshot {
  id: string;
  name: string;
  parameters: Record<string, any>;
  timestamp: number;
}

export function MasteringChain({
  sessionId,
  onParameterChange,
}: MasteringChainProps) {
  // EQ Parameters
  const [eqBands, setEqBands] = useState([
    { freq: 20, gain: 0, q: 1 },
    { freq: 100, gain: 0, q: 1 },
    { freq: 500, gain: 0, q: 1 },
    { freq: 2000, gain: 0, q: 1 },
    { freq: 8000, gain: 0, q: 1 },
    { freq: 16000, gain: 0, q: 1 },
  ]);

  // Limiter Parameters
  const [limiterParams, setLimiterParams] = useState({
    threshold: -1.0,
    release: 50,
    ceiling: 0.0,
  });

  // Stereo Imaging Parameters
  const [imagingParams, setImagingParams] = useState({
    width: 100,
    panLaw: -3,
    monoLow: true,
    crossover: 150,
  });

  // Metering State
  const [levels, setLevels] = useState<MasterLevels>({
    left: -60,
    right: -60,
    peakLeft: -60,
    peakRight: -60,
    rmsLeft: -60,
    rmsRight: -60,
    lufs: -23,
    dynamicRange: 0,
  });

  // Snapshots
  const [snapshots, setSnapshots] = useState<MasteringSnapshot[]>([]);
  const [selectedSnapshot, setSelectedSnapshot] = useState<string | null>(null);

  // Canvas refs for visualizations
  const eqCanvasRef = useRef<HTMLCanvasElement>(null);
  const meterCanvasRef = useRef<HTMLCanvasElement>(null);
  const stereoCanvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize audio analysis
  useEffect(() => {
    const updateMeters = () => {
      // Simulate meter levels (replace with actual audio analysis)
      setLevels((prev) => ({
        left: Math.max(-60, Math.min(0, prev.left + (Math.random() * 2 - 1))),
        right: Math.max(-60, Math.min(0, prev.right + (Math.random() * 2 - 1))),
        peakLeft: Math.max(prev.left, prev.peakLeft),
        peakRight: Math.max(prev.right, prev.peakRight),
        rmsLeft: Math.max(
          -60,
          Math.min(0, prev.rmsLeft + (Math.random() - 0.5)),
        ),
        rmsRight: Math.max(
          -60,
          Math.min(0, prev.rmsRight + (Math.random() - 0.5)),
        ),
        lufs: -23 + Math.sin(Date.now() * 0.001) * 2,
        dynamicRange: 8 + Math.sin(Date.now() * 0.0005) * 2,
      }));
    };

    const intervalId = setInterval(updateMeters, 50);
    return () => clearInterval(intervalId);
  }, []);

  // Draw EQ curve
  useEffect(() => {
    const canvas = eqCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const drawEQCurve = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "hsl(var(--primary))";
      ctx.lineWidth = 2;
      ctx.beginPath();

      // Draw EQ curve
      for (let x = 0; x < canvas.width; x++) {
        const freq = 20 * Math.pow(1000, x / canvas.width);
        let gain = 0;

        // Sum the contribution of each band
        eqBands.forEach((band) => {
          const bandFreq = band.freq;
          const bandGain = band.gain;
          const bandQ = band.q;
          const response =
            bandGain /
            (1 + Math.pow(Math.abs(freq - bandFreq) / (bandFreq / bandQ), 2));
          gain += response;
        });

        const y = canvas.height / 2 - (gain * canvas.height) / 40;
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
    };

    drawEQCurve();
  }, [eqBands]);

  // Draw level meters
  useEffect(() => {
    const canvas = meterCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const drawMeters = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw RMS levels
      const drawChannel = (
        x: number,
        level: number,
        peak: number,
        rms: number,
      ) => {
        const width = canvas.width / 4;
        const height = canvas.height;

        // RMS
        ctx.fillStyle = "hsl(var(--primary))";
        const rmsHeight = Math.max(0, (rms + 60) / 60) * height;
        ctx.fillRect(x, height - rmsHeight, width * 0.8, rmsHeight);

        // Peak
        ctx.fillStyle =
          level > -6 ? "hsl(var(--destructive))" : "hsl(var(--primary))";
        const peakHeight = 2;
        const peakY = height - Math.max(0, (peak + 60) / 60) * height;
        ctx.fillRect(x, peakY, width * 0.8, peakHeight);

        // Level scale
        ctx.fillStyle = "hsl(var(--muted-foreground))";
        ctx.font = "10px sans-serif";
        for (let db = 0; db >= -60; db -= 12) {
          const y = height - ((db + 60) / 60) * height;
          ctx.fillText(db.toString(), x + width, y);
        }
      };

      drawChannel(0, levels.left, levels.peakLeft, levels.rmsLeft);
      drawChannel(
        canvas.width / 2,
        levels.right,
        levels.peakRight,
        levels.rmsRight,
      );
    };

    drawMeters();
  }, [levels]);

  // Draw stereo correlation
  useEffect(() => {
    const canvas = stereoCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const drawCorrelation = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw correlation meter (Lissajous)
      ctx.strokeStyle = "hsl(var(--primary))";
      ctx.lineWidth = 1;
      ctx.beginPath();

      const time = Date.now() * 0.001;
      for (let i = 0; i < 360; i++) {
        const angle = (i / 360) * Math.PI * 2;
        const x =
          (Math.sin(angle * 3 + time) * 0.5 * imagingParams.width) / 100;
        const y = Math.sin(angle * 2 + time * 1.5) * 0.5;

        const screenX = ((x + 1) * canvas.width) / 2;
        const screenY = ((y + 1) * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(screenX, screenY);
        } else {
          ctx.lineTo(screenX, screenY);
        }
      }

      ctx.closePath();
      ctx.stroke();
    };

    const animation = requestAnimationFrame(drawCorrelation);
    return () => cancelAnimationFrame(animation);
  }, [imagingParams.width]);

  const handleEQChange = (
    index: number,
    param: "freq" | "gain" | "q",
    value: number,
  ) => {
    const newBands = [...eqBands];
    newBands[index][param] = value;
    setEqBands(newBands);
    onParameterChange?.("eq", `band${index}_${param}`, value);
  };

  const handleLimiterChange = (
    param: keyof typeof limiterParams,
    value: number,
  ) => {
    setLimiterParams((prev) => ({ ...prev, [param]: value }));
    onParameterChange?.("limiter", param, value);
  };

  const handleImagingChange = (
    param: keyof typeof imagingParams,
    value: number | boolean,
  ) => {
    setImagingParams((prev) => ({ ...prev, [param]: value }));
    if (typeof value === "number") {
      onParameterChange?.("imaging", param, value);
    }
  };

  const saveSnapshot = async () => {
    const snapshot: MasteringSnapshot = {
      id: Date.now().toString(),
      name: `Snapshot ${snapshots.length + 1}`,
      parameters: {
        eq: eqBands,
        limiter: limiterParams,
        imaging: imagingParams,
      },
      timestamp: Date.now(),
    };

    try {
      await virtualStudioApi.saveMasteringSnapshot(sessionId, snapshot);
      setSnapshots((prev) => [...prev, snapshot]);
    } catch (error) {
      console.error("Error saving snapshot:", error);
    }
  };

  const loadSnapshot = (id: string) => {
    const snapshot = snapshots.find((s) => s.id === id);
    if (!snapshot) return;

    setEqBands(snapshot.parameters.eq);
    setLimiterParams(snapshot.parameters.limiter);
    setImagingParams(snapshot.parameters.imaging);
    setSelectedSnapshot(id);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="h-5 w-5" />
            Mastering Chain
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={saveSnapshot}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Snapshot
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="eq">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="eq">
              <Layers className="h-4 w-4 mr-2" />
              EQ
            </TabsTrigger>
            <TabsTrigger value="dynamics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dynamics
            </TabsTrigger>
            <TabsTrigger value="imaging">
              <Disc className="h-4 w-4 mr-2" />
              Imaging
            </TabsTrigger>
          </TabsList>

          <TabsContent value="eq" className="space-y-4">
            <div className="h-40 bg-secondary rounded-lg overflow-hidden">
              <canvas
                ref={eqCanvasRef}
                width={600}
                height={160}
                className="w-full h-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {eqBands.map((band, i) => (
                <div key={i} className="space-y-2">
                  <Label>Band {i + 1}</Label>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Frequency</span>
                        <span>{band.freq}Hz</span>
                      </div>
                      <Slider
                        value={[band.freq]}
                        min={20}
                        max={20000}
                        step={1}
                        onValueChange={([value]) =>
                          handleEQChange(i, "freq", value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Gain</span>
                        <span>{band.gain}dB</span>
                      </div>
                      <Slider
                        value={[band.gain]}
                        min={-12}
                        max={12}
                        step={0.1}
                        onValueChange={([value]) =>
                          handleEQChange(i, "gain", value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Q</span>
                        <span>{band.q.toFixed(1)}</span>
                      </div>
                      <Slider
                        value={[band.q]}
                        min={0.1}
                        max={10}
                        step={0.1}
                        onValueChange={([value]) =>
                          handleEQChange(i, "q", value)
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="dynamics" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Threshold</Label>
                  <div className="flex justify-between text-sm">
                    <span>Level</span>
                    <span>{limiterParams.threshold}dB</span>
                  </div>
                  <Slider
                    value={[limiterParams.threshold]}
                    min={-60}
                    max={0}
                    step={0.1}
                    onValueChange={([value]) =>
                      handleLimiterChange("threshold", value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Release</Label>
                  <div className="flex justify-between text-sm">
                    <span>Time</span>
                    <span>{limiterParams.release}ms</span>
                  </div>
                  <Slider
                    value={[limiterParams.release]}
                    min={1}
                    max={1000}
                    step={1}
                    onValueChange={([value]) =>
                      handleLimiterChange("release", value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Ceiling</Label>
                  <div className="flex justify-between text-sm">
                    <span>Level</span>
                    <span>{limiterParams.ceiling}dB</span>
                  </div>
                  <Slider
                    value={[limiterParams.ceiling]}
                    min={-12}
                    max={0}
                    step={0.1}
                    onValueChange={([value]) =>
                      handleLimiterChange("ceiling", value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="h-64 bg-secondary rounded-lg overflow-hidden">
                  <canvas
                    ref={meterCanvasRef}
                    width={300}
                    height={256}
                    className="w-full h-full"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>LUFS</span>
                    <span>{levels.lufs.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Dynamic Range</span>
                    <span>{levels.dynamicRange.toFixed(1)} dB</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="imaging" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Stereo Width</Label>
                  <div className="flex justify-between text-sm">
                    <span>Width</span>
                    <span>{imagingParams.width}%</span>
                  </div>
                  <Slider
                    value={[imagingParams.width]}
                    min={0}
                    max={200}
                    step={1}
                    onValueChange={([value]) =>
                      handleImagingChange("width", value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Pan Law</Label>
                  <div className="flex justify-between text-sm">
                    <span>Compensation</span>
                    <span>{imagingParams.panLaw}dB</span>
                  </div>
                  <Slider
                    value={[imagingParams.panLaw]}
                    min={-6}
                    max={0}
                    step={0.1}
                    onValueChange={([value]) =>
                      handleImagingChange("panLaw", value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Mono Low Frequencies</Label>
                    <Switch
                      checked={imagingParams.monoLow}
                      onCheckedChange={(checked) =>
                        handleImagingChange("monoLow", checked)
                      }
                    />
                  </div>
                  {imagingParams.monoLow && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Crossover</span>
                        <span>{imagingParams.crossover}Hz</span>
                      </div>
                      <Slider
                        value={[imagingParams.crossover]}
                        min={20}
                        max={500}
                        step={1}
                        onValueChange={([value]) =>
                          handleImagingChange("crossover", value)
                        }
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="h-64 bg-secondary rounded-lg overflow-hidden">
                  <canvas
                    ref={stereoCanvasRef}
                    width={256}
                    height={256}
                    className="w-full h-full"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
