"use client";

import { usePersonaFusion } from "@/services/persona-fusion.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/componen../ui/card";
import { Badge } from "@/components/ui/Badge";

interface PersonaFusionViewProps {
  userId: string;
}

export function PersonaFusionView({ userId }: PersonaFusionViewProps) {
  const { data, isLoading } = usePersonaFusion(userId);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Persona Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Persona Type</span>
            <Badge>{data?.personaType}</Badge>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Preferences</h3>
            <div className="grid grid-cols-2 gap-2">
              {data?.preferences &&
                Object.entries(data.preferences).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-sm">{key}</span>
                    <span className="text-sm font-medium">{value}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
