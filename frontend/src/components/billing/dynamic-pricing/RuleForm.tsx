import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { Textarea } from "@/components/ui/Textarea";
import { useDynamicPricing } from "@/hooks/usedynamic-pricing";
import { DynamicPricingRuleCreate } from "@/types/billing/dynamic-pricing.types";
import { Card, CardContent } from "@/componen../ui/card";
import { Plus, Minus } from "lucide-react";

const conditionSchema = z.object({
  type: z.enum(["time", "volume", "user_segment", "location", "custom"]),
  operator: z.enum(["equals", "greater_than", "less_than", "between", "in"]),
  value: z.any(),
  parameters: z.record(z.any()).optional(),
});

const adjustmentSchema = z.object({
  type: z.enum(["percentage", "fixed_amount", "override"]),
  value: z.number(),
  currency: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
});

const ruleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  conditions: z
    .array(conditionSchema)
    .min(1, "At least one condition is required"),
  adjustments: z
    .array(adjustmentSchema)
    .min(1, "At least one adjustment is required"),
  priority: z.number().min(0),
  active: z.boolean(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

interface RuleFormProps {
  initialData?: DynamicPricingRuleCreate;
  onSuccess?: () => void;
}

export function RuleForm({ initialData, onSuccess }: RuleFormProps) {
  const { createRule, isCreating } = useDynamicPricing();
  const form = useForm<DynamicPricingRuleCreate>({
    resolver: zodResolver(ruleSchema),
    defaultValues: initialData || {
      conditions: [{ type: "time", operator: "equals", value: null }],
      adjustments: [{ type: "percentage", value: 0 }],
      active: true,
      priority: 0,
    },
  });

  const {
    fields: conditionFields,
    append: appendCondition,
    remove: removeCondition,
  } = useFieldArray({
    control: form.control,
    name: "conditions",
  });

  const {
    fields: adjustmentFields,
    append: appendAdjustment,
    remove: removeAdjustment,
  } = useFieldArray({
    control: form.control,
    name: "adjustments",
  });

  const onSubmit = async (data: DynamicPricingRuleCreate) => {
    await createRule(data);
    onSuccess?.();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rule Name</FormLabel>
              <FormControl>
                <Input {...field} />
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
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Conditions</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendCondition({
                  type: "time",
                  operator: "equals",
                  value: null,
                })
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Condition
            </Button>
          </div>

          {conditionFields.map((field, index) => (
            <Card key={field.id}>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <FormField
                    control={form.control}
                    name={`conditions.${index}.type`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="time">Time-based</SelectItem>
                            <SelectItem value="volume">Volume-based</SelectItem>
                            <SelectItem value="user_segment">
                              User Segment
                            </SelectItem>
                            <SelectItem value="location">
                              Location-based
                            </SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Add more condition fields */}

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCondition(index)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Similar structure for adjustments */}

        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between">
              <FormLabel>Active</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isCreating}>
          {isCreating ? "Creating..." : "Create Rule"}
        </Button>
      </form>
    </Form>
  );
}
