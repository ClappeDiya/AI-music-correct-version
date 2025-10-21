import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/componen../ui/card";
import { Form } from "@/components/ui/Form";
import { Button } from "@/components/ui/Button";
import { Loader2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

interface SettingsFormProps<T> {
  title: string;
  description: string;
  form: UseFormReturn<T>;
  onSubmit: (data: T) => void;
  isLoading?: boolean;
  isPending?: boolean;
  children: React.ReactNode;
}

export function SettingsForm<T>({
  title,
  description,
  form,
  onSubmit,
  isLoading,
  isPending,
  children,
}: SettingsFormProps<T>) {
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">{children}</CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => form.reset()}
              type="button"
            >
              Reset
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
