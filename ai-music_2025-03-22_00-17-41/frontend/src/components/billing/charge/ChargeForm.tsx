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
import { useCharges } from "@/hooks/usecharges";
import { ChargeCreate } from "@/types/billing/ChargeTypes";

const chargeSchema = z.object({
  payment_method_id: z.string().min(1, "Payment method is required"),
  amount_cents: z.number().min(50, "Amount must be at least 0.50"),
  currency: z.string().min(1, "Currency is required"),
  description: z.string().optional(),
});

export function ChargeForm() {
  const { createCharge, isCreating } = useCharges();
  const form = useForm<ChargeCreate>({
    resolver: zodResolver(chargeSchema),
    defaultValues: {
      currency: "USD",
    },
  });

  const onSubmit = (data: ChargeCreate) => {
    createCharge(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="payment_method_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Method</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount_cents"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  onChange={(e) =>
                    field.onChange(Math.round(e.target.valueAsNumber * 100))
                  }
                  value={field.value ? field.value / 100 : ""}
                />
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
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isCreating}>
          {isCreating ? "Creating..." : "Create Charge"}
        </Button>
      </form>
    </Form>
  );
}
