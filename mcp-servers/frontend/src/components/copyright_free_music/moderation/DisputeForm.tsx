import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/components/ui/useToast";
import { disputeApi } from "@/lib/api/services";
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
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { FileUploader } from "@/components/ui/file-uploader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { AlertTriangle, FileText, Send } from "lucide-react";

const disputeFormSchema = z.object({
  type: z.enum([
    "copyright_infringement",
    "license_breach",
    "content_violation",
    "other",
  ]),
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Please provide a detailed description"),
  evidence_urls: z.array(z.string()).optional(),
});

interface DisputeFormProps {
  trackId: string;
  onSuccess?: () => void;
}

export function DisputeForm({ trackId, onSuccess }: DisputeFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const form = useForm<z.infer<typeof disputeFormSchema>>({
    resolver: zodResolver(disputeFormSchema),
    defaultValues: {
      type: "copyright_infringement",
      title: "",
      description: "",
      evidence_urls: [],
    },
  });

  const onSubmit = async (values: z.infer<typeof disputeFormSchema>) => {
    try {
      setIsSubmitting(true);

      // First upload any evidence files
      if (files.length > 0) {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append("files", file);
        });
        const evidence = await disputeApi.submitEvidence(trackId, formData);
        values.evidence_urls = evidence.urls;
      }

      // Submit the dispute
      await disputeApi.submitDispute({
        track_id: trackId,
        type: values.type,
        details: {
          title: values.title,
          description: values.description,
          evidence_urls: values.evidence_urls || [],
        },
      });

      toast({
        title: "Dispute Submitted",
        description:
          "Your dispute has been successfully submitted. We will review it shortly.",
      });

      onSuccess?.();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit dispute. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Submit a Dispute</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                Please ensure you have valid evidence to support your dispute.
                False claims may result in account restrictions.
              </AlertDescription>
            </Alert>

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dispute Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select dispute type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="copyright_infringement">
                        Copyright Infringement
                      </SelectItem>
                      <SelectItem value="license_breach">
                        License Breach
                      </SelectItem>
                      <SelectItem value="content_violation">
                        Content Violation
                      </SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Brief title for your dispute"
                      {...field}
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
                    <Textarea
                      placeholder="Provide detailed information about your dispute"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Please include specific details and examples to support your
                    case
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Evidence</FormLabel>
              <FormControl>
                <FileUploader
                  accept={{
                    "image/*": [".png", ".jpg", ".jpeg"],
                    "application/pdf": [".pdf"],
                    "text/plain": [".txt"],
                  }}
                  maxSize={5 * 1024 * 1024} // 5MB
                  onFilesSelected={setFiles}
                />
              </FormControl>
              <FormDescription>
                Upload relevant documents, screenshots, or other evidence (max
                5MB per file)
              </FormDescription>
            </FormItem>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                disabled={isSubmitting}
              >
                Reset
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  "Submitting..."
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Dispute
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
