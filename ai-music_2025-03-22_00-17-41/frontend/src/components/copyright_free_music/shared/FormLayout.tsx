import { ReactNode } from "react";
import { Button } from "@/components/ui/Button";

interface FormLayoutProps {
  children: ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  className?: string;
}

export function FormLayout({
  children,
  onSubmit,
  onCancel,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  className = "",
}: FormLayoutProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(e);
      }}
      className={`space-y-6 ${className}`}
    >
      <div className="space-y-4">{children}</div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
