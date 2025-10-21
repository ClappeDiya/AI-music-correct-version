import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Undo2, Info } from "lucide-react";
import { useToast } from "@/components/ui/usetoast";

interface PredictivePreferenceEvent {
  id: string;
  applied_changes: Record<string, any>;
  applied_at: string;
  reason: string;
}

export function PredictivePreferenceEventList({
  events,
}: {
  events: PredictivePreferenceEvent[];
}) {
  const { toast } = useToast();

  const handleUndo = async (eventId: string) => {
    try {
      // Call API to undo the predictive change
      const response = await fetch(
        `/api/settings/predictivepreferenceevent/${eventId}/undo`,
        {
          method: "POST",
        },
      );

      if (!response.ok) throw new Error("Failed to undo change");

      toast({
        title: "Change undone",
        description: "The predictive change has been reverted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Changes</TableHead>
          <TableHead>Applied At</TableHead>
          <TableHead>Reason</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((event) => (
          <TableRow key={event.id}>
            <TableCell className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              {Object.entries(event.applied_changes).map(([key, value]) => (
                <div key={key} className="flex gap-1">
                  <span className="font-medium">{key}:</span>
                  <span>{JSON.stringify(value)}</span>
                </div>
              ))}
            </TableCell>
            <TableCell>{new Date(event.applied_at).toLocaleString()}</TableCell>
            <TableCell>{event.reason}</TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleUndo(event.id)}
              >
                <Undo2 className="h-4 w-4 mr-2" />
                Undo
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
