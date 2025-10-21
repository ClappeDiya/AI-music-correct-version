"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/AlertDialog";
import { consentManagement } from "@/services/api/consent-management";
import { useToast } from "@/components/ui/useToast";

interface UsageConfirmationProps {
  voiceId: number;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  usage: {
    type: string;
    description: string;
    duration?: number;
  };
}

export function UsageConfirmation({
  voiceId,
  isOpen,
  onClose,
  onConfirm,
  usage,
}: UsageConfirmationProps) {
  const { toast } = useToast();

  const handleConfirm = async () => {
    try {
      const verification = await consentManagement.verifyConsent(voiceId);

      if (verification.status === "valid") {
        onConfirm();
      } else {
        toast({
          title: "Cannot Proceed",
          description: verification.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify consent",
        variant: "destructive",
      });
    }
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Voice Model Usage</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>
              You are about to use your voice model for:
              <br />
              <strong>{usage.type}</strong>
            </p>
            <p>{usage.description}</p>
            {usage.duration && (
              <p>
                Estimated duration: {Math.ceil(usage.duration / 60)} minutes
              </p>
            )}
            <p className="text-muted-foreground">
              By proceeding, you confirm that you have the necessary rights and
              consent to use this voice model for the specified purpose.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            Confirm Usage
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
