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
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { useRefunds } from "@/hooks/userefunds";
import { RefundCreate } from "@/types/billing/refund.types";

const refundSchema = z.object({
  charge_id: z.string().min(1, "Charge ID is required"),
  amount_cents: z.number().min(1, "Amount must be greater than 0").optional(),
  reason: z.string().optional(),
});

export function RefundForm() {
  const { createRefund, isCreating } = useRefunds();
  const form = useForm<RefundCreate>({
    resolver: zodResolver(refundSchema),
  });

  const onSubmit = (data: RefundCreate) => {
    createRefund(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="charge_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Charge ID</FormLabel>
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
              <FormLabel>Amount (Optional)</FormLabel>
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
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isCreating}>
          {isCreating ? "Processing..." : "Process Refund"}
        </Button>
      </form>
    </Form>
  );
}
