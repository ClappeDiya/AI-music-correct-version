import { useState } from "react";
import { useForm } from "react-hook-form";
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
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/componen../ui/card";
import { useDynamicPricing } from "@/hooks/usedynamic-pricing";
import { formatCurrency } from "@/lib/utils";

const simulatorSchema = z.object({
  basePrice: z.number().min(0, "Base price must be greater than 0"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  userId: z.string().optional(),
  location: z.string().optional(),
  customParams: z.record(z.any()).optional(),
});

type SimulatorFormData = z.infer<typeof simulatorSchema>;

interface RuleSimulatorProps {
  ruleId: string;
  currency?: string;
  onClose?: () => void;
}

export function RuleSimulator({
  ruleId,
  currency = "USD",
  onClose,
}: RuleSimulatorProps) {
  const { simulatePrice, isSimulating } = useDynamicPricing();
  const [simulationResult, setSimulationResult] = useState<{
    originalPrice: number;
    adjustedPrice: number;
    appliedRules: string[];
    currency: string;
  } | null>(null);

  const form = useForm<SimulatorFormData>({
    resolver: zodResolver(simulatorSchema),
    defaultValues: {
      basePrice: 0,
      quantity: 1,
    },
  });

  const onSubmit = async (data: SimulatorFormData) => {
    const params = {
      ...data,
      currency,
    };

    try {
      const result = await simulatePrice({ id: ruleId, params });
      setSimulationResult(result);
    } catch (error) {
      // Error is handled by the mutation
      setSimulationResult(null);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Price Simulator</CardTitle>
        <CardDescription>
          Simulate pricing adjustments based on different parameters
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="basePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Price ({currency})</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User ID (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSimulating}>
                {isSimulating ? "Simulating..." : "Simulate Price"}
              </Button>
            </div>
          </form>
        </Form>

        {simulationResult && (
          <div className="mt-6 p-4 border rounded-lg bg-muted">
            <h4 className="font-medium mb-2">Simulation Results</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Original Price:</span>
                <span className="font-medium">
                  {formatCurrency(
                    simulationResult.originalPrice,
                    simulationResult.currency,
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Adjusted Price:</span>
                <span className="font-medium">
                  {formatCurrency(
                    simulationResult.adjustedPrice,
                    simulationResult.currency,
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Price Difference:</span>
                <span
                  className={`font-medium ${
                    simulationResult.adjustedPrice <
                    simulationResult.originalPrice
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {formatCurrency(
                    simulationResult.adjustedPrice -
                      simulationResult.originalPrice,
                    simulationResult.currency,
                  )}
                </span>
              </div>
              {simulationResult.appliedRules.length > 0 && (
                <div className="mt-2">
                  <span className="text-sm text-muted-foreground">
                    Applied Rules:
                  </span>
                  <ul className="list-disc list-inside text-sm">
                    {simulationResult.appliedRules.map((rule, index) => (
                      <li key={index}>{rule}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
