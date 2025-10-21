import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Waves, Activity } from "lucide-react";
import { MixingSessionGenre } from "@/types/GenreMixing";

interface InstrumentVisualizerProps {
  instruments: string[];
  spectrumData?: Record<string, number[]>;
  stereoData?: Record<string, { left: number[]; right: number[] }>;
  className?: string;
}

export function InstrumentVisualizer({
  instruments,
  spectrumData,
  stereoData,
  className = "",
}: InstrumentVisualizerProps) {
  const spectrumCanvasRefs = useRef<Record<string, HTMLCanvasElement | null>>(
    {},
  );
  const stereoCanvasRefs = useRef<Record<string, HTMLCanvasElement | null>>({});

  // Draw frequency spectrum
  useEffect(() => {
    if (!spectrumData) return;

    instruments.forEach((instrument) => {
      const canvas = spectrumCanvasRefs.current[instrument];
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const data = spectrumData[instrument] || [];
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw frequency spectrum
      const barWidth = canvas.width / data.length;
      const heightScale = canvas.height / 256;

      ctx.fillStyle = "hsl(var(--primary))";
      data.forEach((value, i) => {
        const height = value * heightScale;
        ctx.fillRect(
          i * barWidth,
          canvas.height - height,
          barWidth * 0.8,
          height,
        );
      });

      // Draw frequency labels
      ctx.fillStyle = "hsl(var(--muted-foreground))";
      ctx.font = "10px sans-serif";
      [20, 100, 1000, 10000, 20000].forEach((freq) => {
        const x = (Math.log(freq) / Math.log(20000)) * canvas.width;
        ctx.fillText(`${freq}Hz`, x, canvas.height - 5);
      });
    });
  }, [instruments, spectrumData]);

  // Draw stereo field
  useEffect(() => {
    if (!stereoData) return;

    instruments.forEach((instrument) => {
      const canvas = stereoCanvasRefs.current[instrument];
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const data = stereoData[instrument];
      if (!data) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw stereo field background
      ctx.beginPath();
      ctx.arc(
        canvas.width / 2,
        canvas.height / 2,
        canvas.height / 2 - 10,
        0,
        Math.PI * 2,
      );
      ctx.strokeStyle = "hsl(var(--border))";
      ctx.stroke();

      // Draw center line
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.strokeStyle = "hsl(var(--border))";
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw stereo data
      const leftData = data.left || [];
      const rightData = data.right || [];
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = canvas.height / 2 - 10;

      ctx.beginPath();
      ctx.strokeStyle = "hsl(var(--primary))";
      ctx.lineWidth = 2;

      leftData.forEach((left, i) => {
        const right = rightData[i] || 0;
        const angle = (i / leftData.length) * Math.PI * 2;
        const x = centerX + Math.cos(angle) * radius * ((left + right) / 2);
        const y = centerY + Math.sin(angle) * radius * ((left - right) / 2);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.closePath();
      ctx.stroke();

      // Add labels
      ctx.fillStyle = "hsl(var(--muted-foreground))";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("L", 10, canvas.height / 2);
      ctx.fillText("R", canvas.width - 10, canvas.height / 2);
    });
  }, [instruments, stereoData]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Instrument Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            {instruments.map((instrument) => (
              <div key={instrument} className="space-y-4">
                <h3 className="font-medium">{instrument}</h3>
                <Tabs defaultValue="spectrum">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger
                      value="spectrum"
                      className="flex items-center gap-2"
                    >
                      <Activity className="h-4 w-4" />
                      Spectrum
                    </TabsTrigger>
                    <TabsTrigger
                      value="stereo"
                      className="flex items-center gap-2"
                    >
                      <Waves className="h-4 w-4" />
                      Stereo
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="spectrum">
                    <canvas
                      ref={(el) =>
                        (spectrumCanvasRefs.current[instrument] = el)
                      }
                      className="w-full h-[200px]"
                      width={600}
                      height={200}
                    />
                  </TabsContent>

                  <TabsContent value="stereo">
                    <canvas
                      ref={(el) => (stereoCanvasRefs.current[instrument] = el)}
                      className="w-full h-[200px]"
                      width={200}
                      height={200}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
