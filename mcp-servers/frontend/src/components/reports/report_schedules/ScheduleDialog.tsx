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
import { Switch } from "@/components/ui/Switch";
import { toast } from "@/components/ui/useToast";
import { reportSchedulesApi } from "@/lib/api/reports";

const formSchema = z.object({
  report: z.number(),
  schedule_cron: z.string().min(1, "Cron schedule is required"),
  delivery_channels: z.string().optional(),
  active: z.boolean().default(true),
});

interface ScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ScheduleDialog({ open, onOpenChange }: ScheduleDialogProps) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      report: 0,
      schedule_cron: "",
      delivery_channels: "",
      active: true,
    },
  });

  const createScheduleMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const deliveryChannels = values.delivery_channels
        ? JSON.parse(values.delivery_channels)
        : null;
      return await reportSchedulesApi.create({
        ...values,
        delivery_channels: deliveryChannels,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["report-schedules"] });
      toast({
        title: "Success",
        description: "Schedule created successfully",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create schedule",
        variant: "destructive",
      });
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await createScheduleMutation.mutateAsync(values);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Schedule</DialogTitle>
          <DialogDescription>
            Create a new report schedule. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="report"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Report ID</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter report ID"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="schedule_cron"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cron Schedule</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter cron schedule" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="delivery_channels"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Channels (JSON)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='{"email": ["user@example.com"]}'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Active</FormLabel>
                    <FormDescription>
                      Activate this schedule immediately
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Schedule"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
