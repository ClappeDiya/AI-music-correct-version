import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/usetoast";
import { api } from "@/lib/api";
import { Profile } from "@/types/profile";

interface ProfileDuplicationButtonProps {
  profile: Profile;
  onDuplicated: (newProfile: Profile) => void;
}

export function ProfileDuplicationButton({
  profile,
  onDuplicated,
}: ProfileDuplicationButtonProps) {
  const { toast } = useToast();
  const duplicateProfile = api.settings.profiles.duplicate.useMutation();

  useEffect(() => {
    if (duplicateProfile.isSuccess) {
      toast({
        title: "Profile duplicated",
        description: `${profile.name} was successfully duplicated`,
      });
      onDuplicated(duplicateProfile.data);
    }
    if (duplicateProfile.isError) {
      toast({
        title: "Duplication failed",
        description: duplicateProfile.error.message,
        variant: "destructive",
      });
    }
  }, [duplicateProfile.isSuccess, duplicateProfile.isError]);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => duplicateProfile.mutate(profile.id)}
      disabled={duplicateProfile.isPending}
    >
      {duplicateProfile.isPending ? "Duplicating..." : "Duplicate"}
    </Button>
  );
}
