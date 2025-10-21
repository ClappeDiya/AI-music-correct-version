import { Form } from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { useForm } from "react-hook-form";

export function PaymentRoutingRuleForm() {
  const form = useForm();

  const onSubmit = (values: any) => {
    console.log(values);
    return Promise.resolve();
  };

  return (
    <Form {...form} onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="priority">Priority</Label>
          <Input id="priority" type="number" min="1" max="10" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="paymentMethod">Payment Method</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="credit_card">Credit Card</SelectItem>
              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              <SelectItem value="paypal">PayPal</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="currency">Currency</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="GBP">GBP</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="minAmount">Minimum Amount</Label>
          <Input id="minAmount" type="number" min="0" />
        </div>
      </div>
    </Form>
  );
}
