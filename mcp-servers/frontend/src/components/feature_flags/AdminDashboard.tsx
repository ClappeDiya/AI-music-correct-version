import { useState } from "react";
import {
  useFeatureFlagAdmin,
  useFeatureMetrics,
} from "@/lib/hooks/UseFeatureFlags";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/useToast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

const featureFlagSchema = z.object({
  name: z.string().min(1, "Name is required"),
  key: z
    .string()
    .min(1, "Key is required")
    .regex(/^[a-z0-9-]+$/, "Key must be lowercase alphanumeric with hyphens"),
  description: z.string().min(1, "Description is required"),
  status: z.enum(["active", "inactive", "scheduled", "archived"]),
  percentage_rollout: z.number().min(0).max(100),
  user_segments: z.array(z.string()),
  geographic_regions: z.array(z.string()),
  device_types: z.array(z.string()),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  rules: z.record(z.any()),
  is_monitored: z.boolean(),
  alert_threshold: z.number().optional(),
});

export function FeatureFlagAdminDashboard() {
  const { flags, isLoading, createFlag, updateFlag, deleteFlag } =
    useFeatureFlagAdmin();
  const [selectedFlag, setSelectedFlag] = useState<string | null>(null);
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(featureFlagSchema),
  });

  const handleCreateFlag = async (data: z.infer<typeof featureFlagSchema>) => {
    try {
      await createFlag.mutateAsync(data);
      toast({
        title: "Feature flag created",
        description: "The feature flag has been created successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create feature flag.",
      });
    }
  };

  const handleUpdateFlag = async (data: z.infer<typeof featureFlagSchema>) => {
    if (!selectedFlag) return;

    try {
      await updateFlag.mutateAsync({ key: selectedFlag, flag: data });
      toast({
        title: "Feature flag updated",
        description: "The feature flag has been updated successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update feature flag.",
      });
    }
  };

  const handleDeleteFlag = async (key: string) => {
    try {
      await deleteFlag.mutateAsync(key);
      toast({
        title: "Feature flag deleted",
        description: "The feature flag has been deleted successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete feature flag.",
      });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Feature Flags</h1>
          <p className="text-muted-foreground">
            Manage and monitor your feature flags
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Create Feature Flag</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Feature Flag</DialogTitle>
              <DialogDescription>
                Create a new feature flag with targeting rules and monitoring.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleCreateFlag)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Key</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Unique identifier for the feature flag
                      </FormDescription>
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
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="percentage_rollout"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Percentage Rollout</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_monitored"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel>Enable Monitoring</FormLabel>
                        <FormDescription>
                          Track metrics and receive alerts
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
                  <Button type="submit">Create Flag</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {flags?.map((flag) => (
          <FeatureFlagCard
            key={flag.key}
            flag={flag}
            onEdit={() => setSelectedFlag(flag.key)}
            onDelete={() => handleDeleteFlag(flag.key)}
          />
        ))}
      </div>
    </div>
  );
}

function FeatureFlagCard({ flag, onEdit, onDelete }) {
  const { metrics, isLoading: metricsLoading } = useFeatureMetrics(flag.key);
  const [showMetrics, setShowMetrics] = useState(false);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{flag.name}</CardTitle>
            <CardDescription>{flag.description}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onEdit}>
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={onDelete}>
              Delete
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="rules">Rules</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        flag.status === "active"
                          ? "bg-green-100 text-green-800"
                          : flag.status === "inactive"
                            ? "bg-gray-100 text-gray-800"
                            : flag.status === "scheduled"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-red-100 text-red-800"
                      }`}
                    >
                      {flag.status}
                    </span>
                  </div>
                </div>

                <div>
                  <Label>Rollout Percentage</Label>
                  <div className="mt-1">{flag.percentage_rollout}%</div>
                </div>
              </div>

              {flag.start_date && (
                <div>
                  <Label>Schedule</Label>
                  <div className="mt-1">
                    {format(new Date(flag.start_date), "PPP")} -{" "}
                    {flag.end_date
                      ? format(new Date(flag.end_date), "PPP")
                      : "Ongoing"}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="metrics">
            {metrics && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Impressions</Label>
                    <div className="mt-1 text-2xl font-bold">
                      {metrics.impressions}
                    </div>
                  </div>
                  <div>
                    <Label>Activation Rate</Label>
                    <div className="mt-1 text-2xl font-bold">
                      {(metrics.activation_rate * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <Label>Error Rate</Label>
                    <div className="mt-1 text-2xl font-bold">
                      {(metrics.error_rate * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metrics.history}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="activations"
                        stroke="#10b981"
                        name="Activations"
                      />
                      <Line
                        type="monotone"
                        dataKey="errors"
                        stroke="#ef4444"
                        name="Errors"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="rules">
            <pre className="p-4 bg-gray-100 rounded-lg overflow-auto">
              {JSON.stringify(flag.rules, null, 2)}
            </pre>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
