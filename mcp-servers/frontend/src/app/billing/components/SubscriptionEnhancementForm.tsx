import { Form } from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useForm } from "react-hook-form";

export function SubscriptionEnhancementForm() {
  const form = useForm();

  const onSubmit = (values: any) => {
    console.log(values);
    return Promise.resolve();
  };

  return (
    <Form {...form} onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="autoUpgrade">Auto Upgrade</Label>
          <Input id="autoUpgrade" type="checkbox" className="w-4 h-4" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="gracePeriod">Grace Period (days)</Label>
          <Input id="gracePeriod" type="number" min="0" max="30" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="renewalReminder">
            Renewal Reminder (days before)
          </Label>
          <Input id="renewalReminder" type="number" min="1" max="30" />
        </div>
      </div>
    </Form>
  );
}
