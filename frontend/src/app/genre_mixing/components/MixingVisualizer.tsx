import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Progress } from "@/components/ui/Progress";
import { MixingSessionGenre } from "@/types/GenreMixing";
import { AIAnalysisResult } from "@/services/AiAnalysisService";
import { Music4, Waves, Activity, Gauge, PieChart } from "lucide-react";
import { GenreImpactAnalysis } from "./GenreImpactAnalysis";

interface MixingVisualizerProps {
  selectedGenres: MixingSessionGenre[];
  waveformData?: any;
  notationData?: any;
  analysisData?: AIAnalysisResult;
}

export function MixingVisualizer({
  selectedGenres,
  waveformData,
  notationData,
  analysisData,
}: MixingVisualizerProps) {
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null);
  const notationCanvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTab, setActiveTab] = useState("waveform");

  // Waveform visualization
  useEffect(() => {
    if (!waveformCanvasRef.current || !waveformData) return;

    const ctx = waveformCanvasRef.current.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    if (waveformData.peaks) {
      ctx.beginPath();
      ctx.strokeStyle = "hsl(var(--primary))";
      ctx.lineWidth = 2;

      const width = ctx.canvas.width;
      const height = ctx.canvas.height;
      const step = width / waveformData.peaks.length;

      waveformData.peaks.forEach((peak: number, i: number) => {
        const x = i * step;
        const y = (height / 2) * (1 - peak);
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();
    }
  }, [waveformData]);

  // Notation visualization
  useEffect(() => {
    if (!notationCanvasRef.current || !notationData) return;

    const ctx = notationCanvasRef.current.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    if (notationData.chords) {
      ctx.font = "16px monospace";
      ctx.fillStyle = "hsl(var(--foreground))";

      notationData.chords.forEach((chord: string, i: number) => {
        const x = (ctx.canvas.width / notationData.chords.length) * i + 10;
        ctx.fillText(chord, x, ctx.canvas.height / 2);
      });
    }
  }, [notationData]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">Visualization</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid grid-cols-5 gap-4">
            <TabsTrigger value="waveform" className="flex items-center gap-2">
              <Waves className="h-4 w-4" />
              Waveform
            </TabsTrigger>
            <TabsTrigger value="notation" className="flex items-center gap-2">
              <Music4 className="h-4 w-4" />
              Notation
            </TabsTrigger>
            <TabsTrigger value="rhythm" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Rhythm
            </TabsTrigger>
            <TabsTrigger value="timbre" className="flex items-center gap-2">
              <Gauge className="h-4 w-4" />
              Timbre
            </TabsTrigger>
            <TabsTrigger value="impact" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Impact
            </TabsTrigger>
          </TabsList>

          <TabsContent value="waveform" className="h-[400px]">
            <canvas
              ref={waveformCanvasRef}
              className="w-full h-full"
              width={800}
              height={400}
            />
          </TabsContent>

          <TabsContent value="notation" className="h-[400px]">
            <canvas
              ref={notationCanvasRef}
              className="w-full h-full"
              width={800}
              height={400}
            />
          </TabsContent>

          <TabsContent value="rhythm" className="h-[400px] space-y-6 p-4">
            {analysisData?.rhythmicStructures && (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tempo</span>
                    <span>{analysisData.rhythmicStructures.tempo} BPM</span>
                  </div>
                  <Progress value={analysisData.rhythmicStructures.tempo / 2} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Rhythmic Complexity</span>
                    <span>
                      {(
                        analysisData.rhythmicStructures.rhythmicComplexity * 100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                  <Progress
                    value={
                      analysisData.rhythmicStructures.rhythmicComplexity * 100
                    }
                  />
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Time Signature</div>
                  <div className="text-2xl font-bold text-center">
                    {analysisData.rhythmicStructures.timeSignature}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Groove Type</div>
                  <div className="text-lg text-center">
                    {analysisData.rhythmicStructures.grooveType}
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="timbre" className="h-[400px] space-y-6 p-4">
            {analysisData?.timbralQualities && (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Brightness</span>
                    <span>
                      {(analysisData.timbralQualities.brightness * 100).toFixed(
                        1,
                      )}
                      %
                    </span>
                  </div>
                  <Progress
                    value={analysisData.timbralQualities.brightness * 100}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Warmth</span>
                    <span>
                      {(analysisData.timbralQualities.warmth * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress
                    value={analysisData.timbralQualities.warmth * 100}
                  />
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Texture</div>
                  <div className="text-lg text-center">
                    {analysisData.timbralQualities.texture}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-sm font-medium">Instrument Presence</div>
                  {Object.entries(
                    analysisData.timbralQualities.instrumentPresence,
                  ).map(([instrument, presence]) => (
                    <div key={instrument} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{instrument}</span>
                        <span>{(Number(presence) * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={Number(presence) * 100} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="impact" className="h-[400px]">
            <GenreImpactAnalysis
              selectedGenres={selectedGenres}
              analysisData={analysisData}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
