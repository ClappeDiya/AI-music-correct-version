import { useState } from "react";
import { useApiQuery, useApiMutation } from "@/lib/hooks/use-api-query";
import { licenseTiersApi } from "@/lib/api/services";
import { LicenseTier } from "@/lib/api/types";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Switch } from "@/components/ui/Switch";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/useToast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Globe,
  Clock,
  Users,
  Pencil,
  FileCheck,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const licenseTierSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().min(0, "Price must be greater than or equal to 0"),
  currency: z.string().min(1, "Currency is required"),
  usage_rights: z.object({
    commercial_use: z.boolean(),
    territory: z.array(z.string()),
    duration: z.string(),
    distribution_limit: z.number().optional(),
    modifications_allowed: z.boolean(),
    attribution_required: z.boolean(),
  }),
  royalty_rate: z
    .number()
    .min(0, "Royalty rate must be greater than or equal to 0"),
  minimum_fee: z
    .number()
    .min(0, "Minimum fee must be greater than or equal to 0"),
});

export function LicenseTierManagement() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingTier, setEditingTier] = useState<LicenseTier | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof licenseTierSchema>>({
    resolver: zodResolver(licenseTierSchema),
    defaultValues: {
      usage_rights: {
        commercial_use: false,
        territory: ["Worldwide"],
        duration: "Perpetual",
        modifications_allowed: false,
        attribution_required: true,
      },
    },
  });

  const { data: licenseTiers, refetch } = useApiQuery("license-tiers", () =>
    licenseTiersApi.list(),
  );

  const { create: createTier, update: updateTier } = useApiMutation(
    "license-tiers",
    licenseTiersApi,
  );

  const handleSubmit = async (values: z.infer<typeof licenseTierSchema>) => {
    try {
      if (editingTier) {
        await updateTier.mutateAsync({
          id: editingTier.id,
          ...values,
        });
        toast({
          title: "License tier updated",
          description: "The license tier has been updated successfully.",
        });
      } else {
        await createTier.mutateAsync(values);
        toast({
          title: "License tier created",
          description: "The new license tier has been created successfully.",
        });
      }
      setShowDialog(false);
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save the license tier. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (tier: LicenseTier) => {
    setEditingTier(tier);
    form.reset(tier);
    setShowDialog(true);
  };

  const handleDelete = async (tier: LicenseTier) => {
    try {
      await licenseTiersApi.delete(tier.id);
      toast({
        title: "License tier deleted",
        description: "The license tier has been deleted successfully.",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the license tier. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>License Tiers</CardTitle>
              <CardDescription>
                Manage your license tiers and pricing
              </CardDescription>
            </div>
            <Button
              onClick={() => {
                setEditingTier(null);
                form.reset();
                setShowDialog(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Tier
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Usage Rights</TableHead>
                <TableHead>Royalty Rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {licenseTiers?.results.map((tier) => (
                <TableRow key={tier.id}>
                  <TableCell className="font-medium">{tier.name}</TableCell>
                  <TableCell>
                    {tier.currency} {tier.price}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {tier.usage_rights.commercial_use && (
                        <Badge variant="secondary">Commercial</Badge>
                      )}
                      {tier.usage_rights.modifications_allowed && (
                        <Badge variant="secondary">Modifications</Badge>
                      )}
                      {tier.usage_rights.attribution_required && (
                        <Badge variant="secondary">Attribution</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{tier.royalty_rate}%</TableCell>
                  <TableCell>
                    <Badge variant={tier.is_active ? "default" : "secondary"}>
                      {tier.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(tier)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(tier)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTier ? "Edit License Tier" : "Create License Tier"}
            </DialogTitle>
            <DialogDescription>
              Set up the license tier details and usage rights
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              <div className="grid gap-4 md:grid-cols-2">
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
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="usage_rights.commercial_use"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Commercial Use</FormLabel>
                        <FormDescription>
                          Allow use in commercial projects
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

                <FormField
                  control={form.control}
                  name="usage_rights.modifications_allowed"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Modifications</FormLabel>
                        <FormDescription>
                          Allow modifications to the track
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
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="royalty_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Royalty Rate (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="minimum_fee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Fee</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="submit">
                  {editingTier ? "Update" : "Create"} License Tier
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
