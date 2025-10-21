import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/usetoast";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const formSchema = z.object({
  localizedName: z.string().min(1, "Name is required"),
  localizedDescription: z.string().optional(),
  isDefault: z.boolean().optional(),
  fallbackOrder: z.number().min(0),
  locale: z.string().min(1, "Locale is required"),
  userId: z.string().min(1, "User ID is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface GenreLocalizationFormProps {
  initialData?: {
    id: string;
    localizedName: string;
    localizedDescription?: string;
    isDefault: boolean;
    fallbackOrder: number;
    locale: string;
  };
  onSuccess?: () => void;
  isAdmin?: boolean;
}

export function GenreLocalizationForm({
  initialData,
  onSuccess,
  isAdmin = false,
}: GenreLocalizationFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const [locale, setLocale] = useState(router.locale || "en");
  const userId = user?.id || "";

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      localizedName: initialData?.localizedName || "",
      localizedDescription: initialData?.localizedDescription || "",
      isDefault: initialData?.isDefault || false,
      fallbackOrder: initialData?.fallbackOrder || 0,
      locale: initialData?.locale || locale,
      userId,
    },
  });

  // Update form values when locale changes
  useEffect(() => {
    form.setValue("locale", locale);
  }, [locale, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (initialData) {
        await api.genreLocalizations.updateLocalization.mutate({
          id: initialData.id,
          ...values,
          userId: isAdmin ? values.userId : userId, // Admins can edit other users' data
        });
      } else {
        await api.genreLocalizations.createLocalization.mutate({
          ...values,
          userId: isAdmin ? values.userId : userId,
        });
      }

      toast({
        title: "Success",
        description: "Genre localization saved successfully",
      });
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save genre localization",
        variant: "destructive",
      });
    }
  };

  // Fallback logic for missing translations
  const getFallbackLabel = (field: string) => {
    const fallbackLocale = "en";
    if (locale === fallbackLocale) return field;

    // TODO: Fetch fallback translation from API
    return `${field} (${fallbackLocale})`;
  };

  return (
    <Form form={form} onSubmit={onSubmit}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {isAdmin && (
          <FormField name="userId">
            {(field) => (
              <FormItem>
                <FormLabel>User ID</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value as string} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          </FormField>
        )}

        <FormField name="localizedName">
          {(field) => (
            <FormItem>
              <FormLabel>{getFallbackLabel("Localized Name")}</FormLabel>
              <FormControl>
                <Input {...field} value={field.value as string} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        </FormField>

        <FormField name="localizedDescription">
          {(field) => (
            <FormItem>
              <FormLabel>{getFallbackLabel("Description")}</FormLabel>
              <FormControl>
                <Textarea {...field} value={field.value as string} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        </FormField>

        <FormField name="fallbackOrder">
          {(field) => (
            <FormItem>
              <FormLabel>Fallback Order</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  {...field}
                  value={field.value as number}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        </FormField>

        <Button type="submit">Save</Button>
      </form>
    </Form>
  );
}
