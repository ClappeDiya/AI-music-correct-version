import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/usetoast";
import { api } from "@/lib/api";
import { Profile } from "@/types/profile";

interface ProfileActivationButtonProps {
  profile: Profile;
  onActivated: () => void;
}

export function ProfileActivationButton({
  profile,
  onActivated,
}: ProfileActivationButtonProps) {
  const { toast } = useToast();
  const activateProfile = api.settings.profiles.activate.useMutation();

  useEffect(() => {
    if (activateProfile.isSuccess) {
      toast({
        title: "Profile activated",
        description: `${profile.name} is now your active profile`,
      });
      onActivated();
    }
    if (activateProfile.isError) {
      toast({
        title: "Activation failed",
        description: activateProfile.error.message,
        variant: "destructive",
      });
    }
  }, [activateProfile.isSuccess, activateProfile.isError]);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => activateProfile.mutate(profile.id)}
      disabled={activateProfile.isPending}
    >
      {activateProfile.isPending ? "Activating..." : "Activate"}
    </Button>
  );
}
