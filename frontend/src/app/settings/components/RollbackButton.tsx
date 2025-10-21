"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/usetoast";
import { Undo } from "lucide-react";

interface RollbackButtonProps {
  versionId: string;
  versionNumber: number;
}

export default function RollbackButton({
  versionId,
  versionNumber,
}: RollbackButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleRollback = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/settings/history/${versionId}/restore`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to restore version");
      }

      toast({
        title: "Success",
        description: `Settings restored to version ${versionNumber}`,
      });

      // Refresh the page to show updated settings
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to restore settings version",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRollback}
      disabled={isLoading}
    >
      <Undo className="mr-2 h-4 w-4" />
      {isLoading ? "Restoring..." : "Restore"}
    </Button>
  );
}
