"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/usetoast";
import { Language, voiceCloning } from "@/services/api/voice_cloning";
import { ColumnDef } from "@tanstack/react-table";
import { Loader2 } from "lucide-react";

const columns: ColumnDef<Language>[] = [
  {
    accessorKey: "code",
    header: "Language Code",
  },
  {
    accessorKey: "name",
    header: "Language Name",
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) =>
      new Date(row.getValue("created_at")).toLocaleDateString(),
  },
];

export default function LanguagesPage() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadLanguages();
  }, []);

  const loadLanguages = async () => {
    try {
      const response = await voiceCloning.getLanguages();
      setLanguages(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load languages",
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
      <h1 className="text-3xl font-bold mb-8">Supported Languages</h1>
      <DataTable columns={columns} data={languages} />
    </div>
  );
}
