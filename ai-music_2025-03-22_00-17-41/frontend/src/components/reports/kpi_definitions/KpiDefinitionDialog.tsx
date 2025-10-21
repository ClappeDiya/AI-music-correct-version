"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { toast } from "@/components/ui/useToast";
import { kpiDefinitionsApi } from "@/lib/api/reports";

const formSchema = z.object({
  kpi_name: z.string().min(1, "KPI name is required"),
  description: z.string().optional(),
  calculation_details: z.string().optional(),
});

interface KPIDefinitionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KPIDefinitionDialog({
  open,
  onOpenChange,
}: KPIDefinitionDialogProps) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      kpi_name: "",
      description: "",
      calculation_details: "",
    },
  });

  const createKPIMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const calculationDetails = values.calculation_details
        ? JSON.parse(values.calculation_details)
        : null;
      return await kpiDefinitionsApi.create({
        ...values,
        calculation_details: calculationDetails,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kpi-definitions"] });
      toast({
        title: "Success",
        description: "KPI definition created successfully",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create KPI definition",
        variant: "destructive",
      });
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await createKPIMutation.mutateAsync(values);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create KPI Definition</DialogTitle>
          <DialogDescription>
            Create a new KPI definition. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="kpi_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>KPI Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter KPI name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter KPI description"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="calculation_details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Calculation Details (JSON)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter calculation details in JSON format"
                      className="resize-none font-mono"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create KPI"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
