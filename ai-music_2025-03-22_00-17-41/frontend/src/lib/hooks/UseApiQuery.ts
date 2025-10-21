import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/useToast";

interface ApiService<T> {
  list: (filters?: any) => Promise<{ results: T[] }>;
  get: (id: string) => Promise<T>;
  create: (data: Partial<T>) => Promise<T>;
  update: (id: string, data: Partial<T>) => Promise<T>;
  delete: (id: string) => Promise<void>;
}

export function useApiQuery<T>(
  queryKey: string,
  apiService: ApiService<T>,
  filters?: any,
) {
  const { toast } = useToast();

  return useQuery({
    queryKey: [queryKey, filters],
    queryFn: () => apiService.list(filters),
    onError: () => {
      toast({
        title: "Error",
        description: `Failed to fetch ${queryKey}`,
        variant: "destructive",
      });
    },
  });
}

export function useApiMutation<T>(
  queryKey: string,
  apiService: ApiService<T>,
  options?: {
    onSuccess?: () => void;
    successMessage?: string;
    errorMessage?: string;
  },
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return {
    create: useMutation({
      mutationFn: (data: Partial<T>) => apiService.create(data),
      onSuccess: () => {
        queryClient.invalidateQueries([queryKey]);
        toast({
          title: "Success",
          description:
            options?.successMessage || `${queryKey} created successfully`,
        });
        options?.onSuccess?.();
      },
      onError: () => {
        toast({
          title: "Error",
          description: options?.errorMessage || `Failed to create ${queryKey}`,
          variant: "destructive",
        });
      },
    }),

    update: useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<T> }) =>
        apiService.update(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries([queryKey]);
        toast({
          title: "Success",
          description:
            options?.successMessage || `${queryKey} updated successfully`,
        });
        options?.onSuccess?.();
      },
      onError: () => {
        toast({
          title: "Error",
          description: options?.errorMessage || `Failed to update ${queryKey}`,
          variant: "destructive",
        });
      },
    }),

    delete: useMutation({
      mutationFn: (id: string) => apiService.delete(id),
      onSuccess: () => {
        queryClient.invalidateQueries([queryKey]);
        toast({
          title: "Success",
          description:
            options?.successMessage || `${queryKey} deleted successfully`,
        });
        options?.onSuccess?.();
      },
      onError: () => {
        toast({
          title: "Error",
          description: options?.errorMessage || `Failed to delete ${queryKey}`,
          variant: "destructive",
        });
      },
    }),
  };
}
