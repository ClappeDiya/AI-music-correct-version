import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { Track } from "@/types/virtual_studio";

const trackFormSchema = z.object({
  track_name: z.string().min(1, "Track name is required"),
  track_type: z.string().min(1, "Track type is required"),
  position: z.number().min(0).optional(),
});

interface TrackFormProps {
  sessionId: number;
  initialData?: Track;
  onSubmit: (data: z.infer<typeof trackFormSchema>) => void;
  onCancel: () => void;
}

const trackTypes = [
  { value: "audio", label: "Audio" },
  { value: "midi", label: "MIDI" },
  { value: "instrument", label: "Instrument" },
  { value: "aux", label: "Auxiliary" },
];

export function TrackForm({
  sessionId,
  initialData,
  onSubmit,
  onCancel,
}: TrackFormProps) {
  const form = useForm<z.infer<typeof trackFormSchema>>({
    resolver: zodResolver(trackFormSchema),
    defaultValues: {
      track_name: initialData?.track_name || "",
      track_type: initialData?.track_type || "",
      position: initialData?.position || 0,
    },
  });

  const handleSubmit = (values: z.infer<typeof trackFormSchema>) => {
    onSubmit({
      ...values,
      position: values.position || 0,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Edit Track" : "Create Track"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="track_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Track Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter track name" {...field} />
                  </FormControl>
                  <FormDescription>
                    Give your track a descriptive name
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="track_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Track Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select track type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {trackTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the type of track you want to create
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder="Track position"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Set the track's position in the session (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">
                {initialData ? "Update Track" : "Create Track"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
