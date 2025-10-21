import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Separator } from "@/components/ui/Separator";
import { MixingSessionGenre } from "@/types/GenreMixing";
import { AIAnalysisResult } from "@/services/AiAnalysisService";
import { Waves, Music, Activity, Gauge } from "lucide-react";

interface GenreContribution {
  genre: string;
  impact: {
    melody: number;
    harmony: number;
    rhythm: number;
    timbre: number;
  };
  dominantElements: string[];
}

interface GenreImpactAnalysisProps {
  selectedGenres: MixingSessionGenre[];
  analysisData?: AIAnalysisResult;
  className?: string;
}

export function GenreImpactAnalysis({
  selectedGenres,
  analysisData,
  className = "",
}: GenreImpactAnalysisProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Calculate genre contributions based on analysis data
  const genreContributions = selectedGenres.map((sg) => ({
    genre: sg.genre.name,
    weight: sg.weight,
    impact: {
      melody: Math.random() * 100, // Replace with actual analysis data
      harmony: Math.random() * 100,
      rhythm: Math.random() * 100,
      timbre: Math.random() * 100,
    },
    dominantElements: ["Bass line", "Chord progression", "Rhythmic pattern"],
  }));

  // Draw comparative visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analysisData) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw genre interaction visualization
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(centerX, centerY) - 20;

    selectedGenres.forEach((sg, index) => {
      const angle = (index * 2 * Math.PI) / selectedGenres.length;
      const radius = (sg.weight / 100) * maxRadius;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      // Draw genre node
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, 2 * Math.PI);
      ctx.fillStyle = `hsl(${(index * 360) / selectedGenres.length}, 70%, 50%)`;
      ctx.fill();

      // Draw connection to center
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = `hsla(${(index * 360) / selectedGenres.length}, 70%, 50%, 0.5)`;
      ctx.lineWidth = (sg.weight / 100) * 5;
      ctx.stroke();

      // Add genre label
      ctx.font = "12px sans-serif";
      ctx.fillStyle = "hsl(var(--foreground))";
      ctx.textAlign = "center";
      ctx.fillText(sg.genre.name, x, y + 25);
    });
  }, [selectedGenres, analysisData]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Genre Interaction Visualization */}
      <Card>
        <CardContent className="p-4">
          <canvas ref={canvasRef} className="w-full" width={400} height={300} />
        </CardContent>
      </Card>

      {/* Genre-specific Analysis */}
      <ScrollArea className="h-[400px]">
        <div className="space-y-6 pr-4">
          {genreContributions.map((contribution, index) => (
            <Card key={index}>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{contribution.genre}</h3>
                  <span className="text-sm text-muted-foreground">
                    {contribution.weight}%
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Melodic Impact */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Music className="h-4 w-4" />
                      <span className="text-sm">Melodic Impact</span>
                    </div>
                    <Progress value={contribution.impact.melody} />
                  </div>

                  {/* Harmonic Impact */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Waves className="h-4 w-4" />
                      <span className="text-sm">Harmonic Impact</span>
                    </div>
                    <Progress value={contribution.impact.harmony} />
                  </div>

                  {/* Rhythmic Impact */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      <span className="text-sm">Rhythmic Impact</span>
                    </div>
                    <Progress value={contribution.impact.rhythm} />
                  </div>

                  {/* Timbral Impact */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Gauge className="h-4 w-4" />
                      <span className="text-sm">Timbral Impact</span>
                    </div>
                    <Progress value={contribution.impact.timbre} />
                  </div>
                </div>

                <Separator />

                {/* Dominant Musical Elements */}
                <div>
                  <h4 className="text-sm font-medium mb-2">
                    Dominant Elements
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {contribution.dominantElements.map((element, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs"
                      >
                        {element}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
