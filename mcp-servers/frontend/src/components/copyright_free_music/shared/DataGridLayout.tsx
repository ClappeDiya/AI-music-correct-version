import { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";

interface DataGridLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
  statsCards?: ReactNode;
  onAdd?: () => void;
  addButtonLabel?: string;
  dialogContent?: ReactNode;
  dialogTitle?: string;
  dialogDescription?: string;
  showDialog?: boolean;
  onDialogChange?: (open: boolean) => void;
}

export function DataGridLayout({
  title,
  description,
  children,
  statsCards,
  onAdd,
  addButtonLabel = "Add New",
  dialogContent,
  dialogTitle,
  dialogDescription,
  showDialog,
  onDialogChange,
}: DataGridLayoutProps) {
  const hasDialog = dialogContent && onDialogChange;

  return (
    <div className="space-y-6">
      {statsCards && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsCards}
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>

          {hasDialog ? (
            <Dialog open={showDialog} onOpenChange={onDialogChange}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {addButtonLabel}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                  <DialogTitle>{dialogTitle}</DialogTitle>
                  {dialogDescription && (
                    <DialogDescription>{dialogDescription}</DialogDescription>
                  )}
                </DialogHeader>
                {dialogContent}
              </DialogContent>
            </Dialog>
          ) : onAdd ? (
            <Button onClick={onAdd}>
              <Plus className="h-4 w-4 mr-2" />
              {addButtonLabel}
            </Button>
          ) : null}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
}
