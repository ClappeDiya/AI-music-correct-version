import { useState } from "react";
import { useToast } from "@/components/ui/useToast";
import { userPreferencesService } from "@/services/user-preferences";

export function useSettingsOperation<T>(
  operation: (...args: any[]) => Promise<{ data: T }>,
  successMessage: string,
  errorMessage: string,
) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const execute = async (...args: any[]): Promise<T | null> => {
    setLoading(true);
    try {
      const { data } = await operation(...args);
      toast({
        title: "Success",
        description: successMessage,
      });
      return data;
    } catch (error) {
      console.error("Operation failed:", error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading };
}
