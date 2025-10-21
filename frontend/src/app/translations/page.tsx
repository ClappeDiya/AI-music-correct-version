"use client";

import { useAuth } from "@/contexts/AuthContext";
import { DataTable } from "@/components/ui/DataTable";
import { columns } from "./columns";
import { useTranslations } from "@/hooks/usetranslations";

export default function TranslationsPage() {
  const { user } = useAuth();
  const { data: translations, isLoading } = useTranslations();

  if (!user) {
    return <div>Please sign in to view translations</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Translations</h1>
      <DataTable
        columns={columns}
        data={translations || []}
        isLoading={isLoading}
      />
    </div>
  );
}
