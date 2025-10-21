"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { useToast } from "@/components/ui/usetoast";
import { Emotion, voiceCloning } from "@/services/api/voice_cloning";
import { ColumnDef } from "@tanstack/react-table";
import { Loader2 } from "lucide-react";

const columns: ColumnDef<Emotion>[] = [
  {
    accessorKey: "label",
    header: "Emotion Label",
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) =>
      new Date(row.getValue("created_at")).toLocaleDateString(),
  },
];

export default function EmotionsPage() {
  const [emotions, setEmotions] = useState<Emotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadEmotions();
  }, []);

  const loadEmotions = async () => {
    try {
      const response = await voiceCloning.getEmotions();
      setEmotions(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load emotions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Supported Emotions</h1>
      <DataTable columns={columns} data={emotions} />
    </div>
  );
}
