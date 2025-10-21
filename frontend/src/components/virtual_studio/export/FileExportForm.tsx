import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Download, FileAudio, Radio } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import type { ExportedFile } from "@/types/virtual_studio";
import { virtualStudioApi } from "@/services/virtual_studio/api";

const exportFormSchema = z.object({
  format: z.enum(["wav", "mp3", "aiff", "flac"]),
  bit_depth: z.enum(["16", "24", "32"]).optional(),
  sample_rate: z.enum(["44100", "48000", "96000"]).optional(),
  spatial_audio: z.boolean().default(false),
});

interface FileExportFormProps {
  sessionId: number;
  onExportComplete: (file: ExportedFile) => void;
  onCancel: () => void;
}

export function FileExportForm({
  sessionId,
  onExportComplete,
  onCancel,
}: FileExportFormProps) {
  const [progress, setProgress] = useState(0);
  const [exporting, setExporting] = useState(false);

  const form = useForm<z.infer<typeof exportFormSchema>>({
    resolver: zodResolver(exportFormSchema),
    defaultValues: {
      format: "wav",
      bit_depth: "24",
      sample_rate: "48000",
      spatial_audio: false,
    },
  });

  const handleSubmit = async (values: z.infer<typeof exportFormSchema>) => {
    setExporting(true);
    setProgress(0);

    // Simulate export progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 500);

    try {
      const exportData = {
        session: sessionId,
        format: values.format,
        spatial_audio: values.spatial_audio,
        file_url: "", // This would be set by the backend
        cryptographic_signature: "", // This would be set by the backend
      };

      const result = await virtualStudioApi.createExportedFile(exportData);
      clearInterval(progressInterval);
      setProgress(100);
      onExportComplete(result);
    } catch (error) {
      console.error("Error exporting file:", error);
      clearInterval(progressInterval);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileAudio className="h-5 w-5" />
          Export Session
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="format"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Export Format</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="wav">WAV</SelectItem>
                      <SelectItem value="mp3">MP3</SelectItem>
                      <SelectItem value="aiff">AIFF</SelectItem>
                      <SelectItem value="flac">FLAC</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the output format for your audio
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bit_depth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bit Depth</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select bit depth" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="16">16-bit</SelectItem>
                      <SelectItem value="24">24-bit</SelectItem>
                      <SelectItem value="32">32-bit float</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the bit depth for your export
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sample_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sample Rate</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sample rate" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="44100">44.1 kHz</SelectItem>
                      <SelectItem value="48000">48 kHz</SelectItem>
                      <SelectItem value="96000">96 kHz</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the sample rate for your export
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="spatial_audio"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      <div className="flex items-center gap-2">
                        <Radio className="h-4 w-4" />
                        Spatial Audio
                      </div>
                    </FormLabel>
                    <FormDescription>
                      Export with spatial audio encoding
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

            {exporting && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-muted-foreground text-center">
                  Exporting... {progress}%
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onCancel} disabled={exporting}>
                Cancel
              </Button>
              <Button type="submit" disabled={exporting}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
