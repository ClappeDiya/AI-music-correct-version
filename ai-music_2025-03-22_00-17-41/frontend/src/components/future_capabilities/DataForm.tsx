import * as React from "react";
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
import { Textarea } from "@/components/ui/Textarea";
import { toast } from "@/components/ui/useToast";

interface DataFormProps<T> {
  initialData?: T;
  onSubmit: (data: T) => Promise<void>;
  schema: z.ZodObject<any>;
  fields: {
    name: string;
    label: string;
    type: "text" | "textarea" | "select" | "number" | "json";
    description?: string;
    options?: { label: string; value: string }[];
  }[];
}

export function DataForm<T>({
  initialData,
  onSubmit,
  schema,
  fields,
}: DataFormProps<T>) {
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: initialData || {},
  });

  async function handleSubmit(data: T) {
    try {
      await onSubmit(data);
      toast({
        title: "Success",
        description: "Data saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save data",
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {fields.map((field) => (
          <FormField
            key={field.name}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  {field.type === "textarea" ? (
                    <Textarea {...formField} className="min-h-[100px]" />
                  ) : field.type === "select" ? (
                    <Select
                      onValueChange={formField.onChange}
                      defaultValue={formField.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${field.label}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : field.type === "json" ? (
                    <Textarea
                      {...formField}
                      className="min-h-[100px] font-mono"
                      value={
                        typeof formField.value === "object"
                          ? JSON.stringify(formField.value, null, 2)
                          : formField.value
                      }
                      onChange={(e) => {
                        try {
                          const value = JSON.parse(e.target.value);
                          formField.onChange(value);
                        } catch {
                          formField.onChange(e.target.value);
                        }
                      }}
                    />
                  ) : (
                    <Input {...formField} type={field.type} />
                  )}
                </FormControl>
                {field.description && (
                  <FormDescription>{field.description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <div className="flex justify-end space-x-4">
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Form>
  );
}
