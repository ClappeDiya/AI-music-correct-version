"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radiogroup";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/usetoast";
import {
  GlobeIcon,
  UsersIcon,
  LockClosedIcon,
  CopyIcon,
  CheckIcon,
} from "lucide-react";

interface ShareCompositionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  compositionId: string;
  currentPrivacy: "private" | "friends" | "public";
  onPrivacyChange: (privacy: "private" | "friends" | "public") => Promise<void>;
}

export function ShareCompositionDialog({
  isOpen,
  onClose,
  compositionId,
  currentPrivacy,
  onPrivacyChange,
}: ShareCompositionDialogProps) {
  const [privacy, setPrivacy] = useState(currentPrivacy);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const shareUrl = `${window.location.origin}/compositions/${compositionId}`;

  const handlePrivacyChange = async (
    newPrivacy: "private" | "friends" | "public",
  ) => {
    setIsSaving(true);
    try {
      await onPrivacyChange(newPrivacy);
      setPrivacy(newPrivacy);
      toast({
        title: "Privacy Updated",
        description: `Composition is now ${newPrivacy}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update privacy settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link Copied",
        description: "Share link copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Composition</DialogTitle>
          <DialogDescription>
            Choose who can access your composition and share it with others.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <RadioGroup
            value={privacy}
            onValueChange={(value: "private" | "friends" | "public") =>
              handlePrivacyChange(value)
            }
            className="grid gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="private"
                id="private"
                disabled={isSaving}
              />
              <Label htmlFor="private" className="flex items-center">
                <LockClosedIcon className="h-4 w-4 mr-2" />
                Private
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="friends"
                id="friends"
                disabled={isSaving}
              />
              <Label htmlFor="friends" className="flex items-center">
                <UsersIcon className="h-4 w-4 mr-2" />
                Friends Only
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="public" id="public" disabled={isSaving} />
              <Label htmlFor="public" className="flex items-center">
                <GlobeIcon className="h-4 w-4 mr-2" />
                Public
              </Label>
            </div>
          </RadioGroup>

          {privacy !== "private" && (
            <div className="grid gap-2">
              <Label>Share Link</Label>
              <div className="flex space-x-2">
                <Input readOnly value={shareUrl} className="flex-1" />
                <Button variant="outline" size="icon" onClick={copyShareLink}>
                  {copied ? (
                    <CheckIcon className="h-4 w-4" />
                  ) : (
                    <CopyIcon className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
