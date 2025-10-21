import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Cube, Save, Glasses } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { Slider } from "@/components/ui/Slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import type { VrArSetting } from "@/types/virtual_studio";
import { virtualStudioApi } from "@/services/virtual_studio/api";

const vrArSettingsSchema = z.object({
  mode: z.enum(["vr", "ar", "mixed"]),
  environment: z.enum(["studio", "concert_hall", "outdoor", "custom"]),
  room_size: z.number().min(0).max(100),
  reflection_level: z.number().min(0).max(100),
  enable_hand_tracking: z.boolean().default(true),
  enable_spatial_audio: z.boolean().default(true),
  enable_gesture_controls: z.boolean().default(true),
});

interface VrArSettingsFormProps {
  sessionId: number;
  initialData?: VrArSetting;
  onSubmit: (data: VrArSetting) => void;
  onCancel: () => void;
}

export function VrArSettingsForm({
  sessionId,
  initialData,
  onSubmit,
  onCancel,
}: VrArSettingsFormProps) {
  const [activeTab, setActiveTab] = useState("environment");

  const form = useForm<z.infer<typeof vrArSettingsSchema>>({
    resolver: zodResolver(vrArSettingsSchema),
    defaultValues: {
      mode: (initialData?.config?.mode as any) || "vr",
      environment: (initialData?.config?.environment as any) || "studio",
      room_size: initialData?.config?.room_size || 50,
      reflection_level: initialData?.config?.reflection_level || 50,
      enable_hand_tracking: initialData?.config?.enable_hand_tracking ?? true,
      enable_spatial_audio: initialData?.config?.enable_spatial_audio ?? true,
      enable_gesture_controls:
        initialData?.config?.enable_gesture_controls ?? true,
    },
  });

  const handleSubmit = async (values: z.infer<typeof vrArSettingsSchema>) => {
    try {
      const settingData = {
        session: sessionId,
        config: values,
      };

      const result = await virtualStudioApi.createVrArSetting(settingData);
      onSubmit(result);
    } catch (error) {
      console.error("Error saving VR/AR settings:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Glasses className="h-5 w-5" />
          VR/AR Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="environment">
              <Cube className="h-4 w-4 mr-2" />
              Environment
            </TabsTrigger>
            <TabsTrigger value="controls">Controls</TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              <TabsContent value="environment">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="mode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mode</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select mode" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="vr">Virtual Reality</SelectItem>
                            <SelectItem value="ar">
                              Augmented Reality
                            </SelectItem>
                            <SelectItem value="mixed">Mixed Reality</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choose your preferred reality mode
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="environment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Environment</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select environment" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="studio">
                              Recording Studio
                            </SelectItem>
                            <SelectItem value="concert_hall">
                              Concert Hall
                            </SelectItem>
                            <SelectItem value="outdoor">
                              Outdoor Stage
                            </SelectItem>
                            <SelectItem value="custom">Custom Space</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Select your virtual environment
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="room_size"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Room Size</FormLabel>
                        <FormControl>
                          <Slider
                            min={0}
                            max={100}
                            step={1}
                            value={[field.value]}
                            onValueChange={([value]) => field.onChange(value)}
                          />
                        </FormControl>
                        <FormDescription>
                          Adjust the virtual room size
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="reflection_level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reflection Level</FormLabel>
                        <FormControl>
                          <Slider
                            min={0}
                            max={100}
                            step={1}
                            value={[field.value]}
                            onValueChange={([value]) => field.onChange(value)}
                          />
                        </FormControl>
                        <FormDescription>
                          Adjust room reflections and reverb
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="controls">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="enable_hand_tracking"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Hand Tracking
                          </FormLabel>
                          <FormDescription>
                            Enable hand tracking for gesture controls
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
                    name="enable_spatial_audio"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Spatial Audio
                          </FormLabel>
                          <FormDescription>
                            Enable 3D spatial audio processing
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
                    name="enable_gesture_controls"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Gesture Controls
                          </FormLabel>
                          <FormDescription>
                            Enable gesture-based interaction
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
              </TabsContent>

              <div className="flex justify-end space-x-2 pt-6">
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </Button>
              </div>
            </form>
          </Form>
        </Tabs>
      </CardContent>
    </Card>
  );
}
