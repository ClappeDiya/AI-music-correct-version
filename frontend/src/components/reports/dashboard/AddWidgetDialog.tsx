"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { useForm } from "react-hook-form";
import { dashboardApi } from "@/lib/api/dashboard";

interface AddWidgetDialogProps {
  onWidgetAdded: () => void;
}

const widgetTypes = [
  {
    id: "user_growth",
    name: "User Growth",
    description: "Track user acquisition and retention",
  },
  {
    id: "active_users",
    name: "Active Users",
    description: "Monitor daily and monthly active users",
  },
  {
    id: "top_genres",
    name: "Top Genres",
    description: "Most popular music genres",
  },
  {
    id: "trending_styles",
    name: "Trending Styles",
    description: "Currently trending music styles",
  },
  {
    id: "revenue_metrics",
    name: "Revenue Metrics",
    description: "Track revenue and financial KPIs",
  },
  {
    id: "engagement",
    name: "User Engagement",
    description: "Measure user interaction and activity",
  },
  {
    id: "geographic",
    name: "Geographic Distribution",
    description: "User distribution by region",
  },
  {
    id: "usage_time",
    name: "Usage Time",
    description: "Average time spent on platform",
  },
];

export function AddWidgetDialog({ onWidgetAdded }: AddWidgetDialogProps) {
  const [open, setOpen] = useState(false);
  const form = useForm({
    defaultValues: {
      type: "",
      title: "",
      timeRange: "7d",
    },
  });

  const addWidgetMutation = useMutation({
    mutationFn: async (values: any) => {
      await dashboardApi.addWidget(values);
      setOpen(false);
      onWidgetAdded();
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Widget
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add KPI Widget</DialogTitle>
          <DialogDescription>
            Create a new widget to track key performance indicators
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) =>
              addWidgetMutation.mutate(values),
            )}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Widget Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a widget type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {widgetTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          <div className="flex flex-col">
                            <span>{type.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {type.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the type of KPI you want to track
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Widget Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter widget title" {...field} />
                  </FormControl>
                  <FormDescription>
                    Give your widget a descriptive name
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timeRange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time Range</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time range" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="7d">Last 7 Days</SelectItem>
                      <SelectItem value="30d">Last 30 Days</SelectItem>
                      <SelectItem value="90d">Last 90 Days</SelectItem>
                      <SelectItem value="1y">Last Year</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the time period for the widget data
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={addWidgetMutation.isPending}
            >
              Add Widget
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
