import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import * as d3 from "d3";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { useBlend } from "@/hooks/useBlend";
import { useToast } from "@/components/ui/useToast";

interface BlendVisualizerProps {
  blendData: {
    traditions: Array<{
      id: string;
      name: string;
      weight: number;
      color?: string;
    }>;
    connections?: Array<{
      source: string;
      target: string;
      strength: number;
    }>;
  };
  className?: string;
}

export const BlendVisualizer: React.FC<BlendVisualizerProps> = ({
  blendData,
  className,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const { currentBlend, loading, error } = useBlend();
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  useEffect(() => {
    if (!svgRef.current || !tooltipRef.current) return;

    // Clear previous visualization
    d3.select(svgRef.current).selectAll("*").remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;

    const svg = d3.select(svgRef.current);
    const tooltip = d3.select(tooltipRef.current);

    // Create color scale
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Calculate positions in a circle
    const angleStep = (2 * Math.PI) / blendData.traditions.length;
    const nodes = blendData.traditions.map((tradition, i) => ({
      ...tradition,
      x: centerX + radius * Math.cos(i * angleStep),
      y: centerY + radius * Math.sin(i * angleStep),
      color: tradition.color || colorScale(i.toString()),
    }));

    // Draw connections if they exist
    if (blendData.connections) {
      const linkGenerator = d3
        .linkRadial()
        .angle((d: any) => d.angle)
        .radius((d: any) => d.radius);

      blendData.connections.forEach((connection) => {
        const source = nodes.find((n) => n.id === connection.source);
        const target = nodes.find((n) => n.id === connection.target);
        if (!source || !target) return;

        svg
          .append("path")
          .attr(
            "d",
            linkGenerator({
              source: { x: source.x, y: source.y },
              target: { x: target.x, y: target.y },
            }),
          )
          .attr("stroke", "#888")
          .attr("stroke-width", connection.strength * 3)
          .attr("fill", "none")
          .attr("opacity", 0.5);
      });
    }

    // Draw nodes
    const nodeGroups = svg
      .selectAll("g")
      .data(nodes)
      .enter()
      .append("g")
      .attr("transform", (d) => `translate(${d.x},${d.y})`);

    // Add circles
    nodeGroups
      .append("circle")
      .attr("r", (d) => 20 + d.weight * 20)
      .attr("fill", (d) => d.color)
      .attr("opacity", 0.7)
      .on("mouseover", function (event, d) {
        d3.select(this).attr("opacity", 1);
        tooltip
          .style("opacity", 1)
          .html(
            `
            <div class="font-medium">${d.name}</div>
            <div class="text-sm">Weight: ${d.weight.toFixed(2)}</div>
          `,
          )
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 10}px`);
      })
      .on("mouseout", function () {
        d3.select(this).attr("opacity", 0.7);
        tooltip.style("opacity", 0);
      });

    // Add labels
    nodeGroups
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.3em")
      .attr("fill", "white")
      .attr("font-size", "12px")
      .text((d) => d.name.substring(0, 3));

    // Add weight indicators
    const arcGenerator = d3
      .arc()
      .innerRadius(0)
      .outerRadius((d: any) => 20 + d.weight * 20)
      .startAngle(0)
      .endAngle((d: any) => d.weight * 2 * Math.PI);

    nodeGroups
      .append("path")
      .attr("d", arcGenerator as any)
      .attr("fill", "white")
      .attr("opacity", 0.3);
  }, [blendData]);

  return (
    <Card className={cn("p-4", className)}>
      <div className="relative w-full aspect-square">
        <svg
          ref={svgRef}
          className="w-full h-full"
          viewBox="0 0 400 400"
          preserveAspectRatio="xMidYMid meet"
        />
        <div
          ref={tooltipRef}
          className="absolute pointer-events-none bg-background border rounded-lg p-2 shadow-lg opacity-0 transition-opacity"
          style={{
            transform: "translate(-50%, -100%)",
          }}
        />
      </div>
    </Card>
  );
};
