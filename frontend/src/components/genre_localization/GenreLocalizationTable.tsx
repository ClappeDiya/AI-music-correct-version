import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Pencil, Trash } from "lucide-react";
import { useTranslations } from "@/hooks/usetranslations";
import { useToast } from "@/components/ui/usetoast";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

interface GenreLocalization {
  id: string;
  genre_id: string;
  language: {
    code: string;
    name: string;
  };
  localized_name: string;
  localized_description?: string;
  source: "user_preference" | "translation" | "default_fallback";
}

export function GenreLocalizationTable() {
  const { toast } = useToast();
  const { data: translations, isLoading: isLoadingTranslations } =
    useTranslations();
  const { data, isLoading: isLoadingData } = useQuery({
    queryKey: ["genre_localizations"],
    queryFn: async () => {
      const result = await api.genreLocalizations.getLocalizedGenre.query({
        language: navigator.language,
      });
      return result;
    },
  });

  // Get translations for the current component
  const getTranslation = (key: string): string => {
    const translation = translations?.find(
      (t) =>
        t.original_text === `GenreLocalization.${key}` &&
        t.target_language === navigator.language,
    );
    return translation?.translated_text || `GenreLocalization.${key}`;
  };

  const handleEdit = async (genreId: string) => {
    try {
      // TODO: Implement edit functionality
      toast({
        title: "Edit",
        description: "Edit functionality coming soon",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to edit genre localization",
        variant: "destructive",
      });
    }
  };

  const columns: ColumnDef<GenreLocalization, string>[] = [
    {
      id: "language",
      accessorFn: (row: GenreLocalization): string => row.language.name || "",
      header: () => <div>{getTranslation("language")}</div>,
      cell: ({ row }) => <div>{row.original.language.name}</div>,
    },
    {
      id: "localized_name",
      accessorFn: (row: GenreLocalization): string => row.localized_name || "",
      header: () => <div>{getTranslation("localizedName")}</div>,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span>{row.original.localized_name}</span>
          <span className="text-xs text-muted-foreground">
            ({row.original.source})
          </span>
        </div>
      ),
    },
    {
      id: "localized_description",
      accessorFn: (row: GenreLocalization): string =>
        row.localized_description || "",
      header: () => <div>{getTranslation("localizedDescription")}</div>,
      cell: ({ row }) => <div>{row.original.localized_description || "-"}</div>,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const genre = row.original;

        return (
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(genre.id)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  if (isLoadingTranslations || isLoadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <DataTable<GenreLocalization, string>
      columns={columns}
      data={data}
      searchKey="localized_name"
    />
  );
}
