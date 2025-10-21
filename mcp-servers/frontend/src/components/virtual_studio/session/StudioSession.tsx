"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Settings, Share2, Save, Music, Waveform } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { DataTable } from "@/components/ui/data-table";
import { TrackManager } from "../tracks/track-manager";
import type {
  Track,
  TrackInstrument,
  TrackEffect,
} from "@/types/virtual_studio";
import { virtualStudioApi } from "@/services/virtual_studio/api";

interface StudioSessionProps {
  sessionId: number;
}

export function StudioSession({ sessionId }: StudioSessionProps) {
  const router = useRouter();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [instruments, setInstruments] = useState<TrackInstrument[]>([]);
  const [effects, setEffects] = useState<TrackEffect[]>([]);
  const [activeTab, setActiveTab] = useState("tracks");
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);

  useEffect(() => {
    loadSessionData();
  }, [sessionId]);

  const loadSessionData = async () => {
    try {
      const [instrumentsData, effectsData] = await Promise.all([
        virtualStudioApi.getTrackInstruments(),
        virtualStudioApi.getTrackEffects(),
      ]);
      setInstruments(instrumentsData);
      setEffects(effectsData);
    } catch (error) {
      console.error("Error loading session data:", error);
    }
  };

  const handleTrackSelect = (track: Track) => {
    setSelectedTrack(track);
    // Additional logic for track selection
  };

  const instrumentColumns = [
    {
      accessorKey: "instrument.name",
      header: "Instrument",
    },
    {
      accessorKey: "parameters",
      header: "Parameters",
      cell: ({ row }) => {
        const params = row.original.parameters;
        return <pre className="text-sm">{JSON.stringify(params, null, 2)}</pre>;
      },
    },
  ];

  const effectColumns = [
    {
      accessorKey: "effect.name",
      header: "Effect",
    },
    {
      accessorKey: "parameters",
      header: "Parameters",
      cell: ({ row }) => {
        const params = row.original.parameters;
        return <pre className="text-sm">{JSON.stringify(params, null, 2)}</pre>;
      },
    },
  ];

  const filteredInstruments = instruments.filter(
    (instrument) => instrument.track.id === selectedTrack?.id,
  );

  const filteredEffects = effects.filter(
    (effect) => effect.track.id === selectedTrack?.id,
  );

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Studio Session</h1>
        <div className="space-x-2">
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="default">
            <Save className="h-4 w-4 mr-2" />
            Save Session
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-4">
          <TrackManager
            sessionId={sessionId}
            onTrackSelect={handleTrackSelect}
          />
        </div>

        <div className="col-span-8">
          <Card>
            <CardHeader>
              <CardTitle>Track Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="instruments">
                    <Music className="h-4 w-4 mr-2" />
                    Instruments
                  </TabsTrigger>
                  <TabsTrigger value="effects">
                    <Waveform className="h-4 w-4 mr-2" />
                    Effects
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="instruments">
                  {selectedTrack ? (
                    <DataTable
                      columns={instrumentColumns}
                      data={filteredInstruments}
                      searchKey="instrument.name"
                    />
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Select a track to view its instruments
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="effects">
                  {selectedTrack ? (
                    <DataTable
                      columns={effectColumns}
                      data={filteredEffects}
                      searchKey="effect.name"
                    />
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Select a track to view its effects
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
