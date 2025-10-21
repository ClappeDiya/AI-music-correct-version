import { ReactNode } from "react";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

export function FormField({
  label,
  error,
  required,
  className = "",
  children,
}: FormFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {children}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

interface TagInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  variant?: "default" | "destructive" | "outline";
}

export function TagInput({
  value,
  onChange,
  placeholder = "Add tag...",
  variant = "outline",
}: TagInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map((tag, index) => (
          <Badge
            key={index}
            variant={variant}
            className="flex items-center gap-1"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((_, i) => i !== index))}
              className="ml-1"
            >
              ×
            </button>
          </Badge>
        ))}
        <Input
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const input = e.currentTarget;
              if (input.value) {
                onChange([...value, input.value]);
                input.value = "";
              }
            }
          }}
          className="flex-1 min-w-[200px]"
        />
      </div>
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  className?: string;
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder = "Select...",
  required,
  error,
  className,
}: SelectFieldProps) {
  return (
    <FormField
      label={label}
      required={required}
      error={error}
      className={className}
    >
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  );
}

interface TextAreaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  className?: string;
  minRows?: number;
}

export function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  required,
  error,
  className,
  minRows = 3,
}: TextAreaFieldProps) {
  return (
    <FormField
      label={label}
      required={required}
      error={error}
      className={className}
    >
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`min-h-[${minRows * 24}px]`}
      />
    </FormField>
  );
}

interface InputFieldProps {
  label: string;
  type?: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  className?: string;
}

export function InputField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  error,
  className,
}: InputFieldProps) {
  return (
    <FormField
      label={label}
      required={required}
      error={error}
      className={className}
    >
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </FormField>
  );
}

interface CheckboxFieldProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export function CheckboxField({
  label,
  checked,
  onChange,
  className,
}: CheckboxFieldProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4"
      />
      <Label>{label}</Label>
    </div>
  );
}
