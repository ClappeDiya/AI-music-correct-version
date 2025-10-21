import { Form } from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useForm } from "react-hook-form";

export function AnalyticsConfigForm() {
  const form = useForm();

  const onSubmit = (values: Record<string, any>) => {
    console.log(values);
    return Promise.resolve();
  };

  return (
    <Form {...form} onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="trackingEnabled">Enable Tracking</Label>
          <Input id="trackingEnabled" type="checkbox" className="w-4 h-4" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="dataRetention">Data Retention (days)</Label>
          <Input id="dataRetention" type="number" min="1" max="365" />
        </div>
      </div>
    </Form>
  );
}
