import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Save, Sliders } from "lucide-react";
import { Button } from "@/components/ui/Button";
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
import { Switch } from "@/components/ui/Switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { InstrumentSelector } from "../instruments/instrument-selector";
import type { Instrument, InstrumentPreset } from "@/types/virtual_studio";
import { virtualStudioApi } from "@/services/virtual_studio/api";

const presetFormSchema = z.object({
  preset_name: z.string().min(1, "Preset name is required"),
  is_public: z.boolean().default(false),
});

interface InstrumentPresetFormProps {
  initialData?: InstrumentPreset;
  onSubmit: (data: InstrumentPreset) => void;
  onCancel: () => void;
}

export function InstrumentPresetForm({
  initialData,
  onSubmit,
  onCancel,
}: InstrumentPresetFormProps) {
  const [selectedInstrument, setSelectedInstrument] =
    useState<Instrument | null>(null);
  const [parameters, setParameters] = useState<Record<string, number>>(
    (initialData?.preset_parameters as Record<string, number>) || {},
  );

  const form = useForm<z.infer<typeof presetFormSchema>>({
    resolver: zodResolver(presetFormSchema),
    defaultValues: {
      preset_name: initialData?.preset_name || "",
      is_public: initialData?.is_public || false,
    },
  });

  const handleInstrumentSelect = (
    instrument: Instrument,
    params: Record<string, number>,
  ) => {
    setSelectedInstrument(instrument);
    setParameters(params);
  };

  const handleSubmit = async (values: z.infer<typeof presetFormSchema>) => {
    if (!selectedInstrument) return;

    const presetData = {
      ...values,
      instrument: selectedInstrument.id,
      preset_parameters: parameters,
    };

    try {
      const result = await virtualStudioApi.createInstrumentPreset(presetData);
      onSubmit(result);
    } catch (error) {
      console.error("Error creating preset:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sliders className="h-5 w-5" />
          {initialData ? "Edit Instrument Preset" : "Create Instrument Preset"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <InstrumentSelector
            onSelect={handleInstrumentSelect}
            initialInstrument={initialData?.instrument}
          />

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="preset_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preset Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter preset name" {...field} />
                    </FormControl>
                    <FormDescription>
                      Give your preset a descriptive name
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_public"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Public Preset</FormLabel>
                      <FormDescription>
                        Make this preset available to other users
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

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!selectedInstrument}>
                  <Save className="h-4 w-4 mr-2" />
                  {initialData ? "Update Preset" : "Save Preset"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
}
