"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm, Controller, ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import {
  Form,
  FormControl,
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
import { currencies, Currency } from "@/lib/currencies";

const formSchema = z.object({
  currency: z.string().min(1, "Currency is required"),
});

interface CurrencyPreferenceFormProps {
  userId: string;
  defaultCurrency: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CurrencyPreferenceForm({
  userId,
  defaultCurrency,
  onSuccess,
  onCancel,
}: CurrencyPreferenceFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currency: defaultCurrency,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // TODO: Implement API call to save currency preference
      onSuccess();
    } catch (error) {
      console.error("Failed to save currency preference:", error);
    }
  };

  return (
    <Form form={form} onSubmit={onSubmit}>
      <Controller
        name="currency"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Preferred Currency</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {currencies.map((currency: Currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.name} ({currency.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </Form>
  );
}
