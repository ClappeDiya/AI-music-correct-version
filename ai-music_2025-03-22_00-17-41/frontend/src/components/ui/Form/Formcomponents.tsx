"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  FormProvider,
  useFormContext as useRHFFormContext,
} from "react-hook-form";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/Label";

// Use react-hook-form's useFormContext directly to avoid issues
function useLocalFormContext<T extends FieldValues>() {
  return useRHFFormContext<T>();
}

// FormField component that uses the form context
interface FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  name: TName;
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
);

export const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

interface FormControlProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function FormControl({ children, ...props }: FormControlProps) {
  return <div {...props}>{children}</div>;
}

interface FormItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function FormItem({ children, ...props }: FormItemProps) {
  return <div {...props}>{children}</div>;
}

interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

export function FormLabel({ children, ...props }: FormLabelProps) {
  return <label {...props}>{children}</label>;
}

interface FormMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export function FormMessage({ children, ...props }: FormMessageProps) {
  return <div {...props}>{children}</div>;
}

interface FormDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export function FormDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted">{children}</p>;
}
