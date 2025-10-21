import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Save, Waveform } from "lucide-react";
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
import { EffectSelector } from "../effects/effect-selector";
import type { Effect, EffectPreset } from "@/types/virtual_studio";
import { virtualStudioApi } from "@/services/virtual_studio/api";

const presetFormSchema = z.object({
  preset_name: z.string().min(1, "Preset name is required"),
  is_public: z.boolean().default(false),
});

interface EffectPresetFormProps {
  initialData?: EffectPreset;
  onSubmit: (data: EffectPreset) => void;
  onCancel: () => void;
}

export function EffectPresetForm({
  initialData,
  onSubmit,
  onCancel,
}: EffectPresetFormProps) {
  const [selectedEffect, setSelectedEffect] = useState<Effect | null>(null);
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

  const handleEffectSelect = (
    effect: Effect,
    params: Record<string, number>,
  ) => {
    setSelectedEffect(effect);
    setParameters(params);
  };

  const handleSubmit = async (values: z.infer<typeof presetFormSchema>) => {
    if (!selectedEffect) return;

    const presetData = {
      ...values,
      effect: selectedEffect.id,
      preset_parameters: parameters,
    };

    try {
      const result = await virtualStudioApi.createEffectPreset(presetData);
      onSubmit(result);
    } catch (error) {
      console.error("Error creating preset:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Waveform className="h-5 w-5" />
          {initialData ? "Edit Effect Preset" : "Create Effect Preset"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <EffectSelector
            onSelect={handleEffectSelect}
            initialEffect={initialData?.effect}
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
                <Button type="submit" disabled={!selectedEffect}>
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
