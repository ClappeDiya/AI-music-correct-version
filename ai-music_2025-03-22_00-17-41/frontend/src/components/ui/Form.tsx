"use client";

import * as React from "react";
import {
  useForm as useHookForm,
  useFormContext as useRHFFormContext,
  UseFormReturn,
  FieldValues,
  DefaultValues,
  FormProvider,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface FormProps<T extends FieldValues>
  extends Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit"> {
  children: React.ReactNode;
  form: UseFormReturn<T>;
  onSubmit?: (data: T) => void;
}

const FormContext = React.createContext<UseFormReturn<any> | null>(null);

export function Form<T extends FieldValues>({
  children,
  form,
  onSubmit,
  ...props
}: FormProps<T>) {
  return (
    <FormContext.Provider value={form}>
      <FormProvider {...form}>
        <form
          onSubmit={onSubmit ? form.handleSubmit(onSubmit) : undefined}
          {...props}
        >
          {children}
        </form>
      </FormProvider>
    </FormContext.Provider>
  );
}

export function useFormContext<T extends FieldValues>() {
  const context = React.useContext(FormContext);
  if (!context) {
    return useRHFFormContext<T>();
  }
  return context as UseFormReturn<T>;
}

export function useForm<T extends FieldValues>(
  schema: z.ZodObject<any>,
  defaultValues?: DefaultValues<T>,
) {
  return useHookForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
  });
}

export {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/Form/Formcomponents";
