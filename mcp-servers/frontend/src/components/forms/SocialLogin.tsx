import React from "react";
import { Button } from "../ui/Button";
import { Google, Microsoft, Github } from "../ui/icons";

interface SocialLoginProps {
  onProviderSelect: (provider: string) => void;
}

export const SocialLogin: React.FC<SocialLoginProps> = ({
  onProviderSelect,
}) => {
  const handleSocialLogin = (provider: string) => {
    window.location.href = `/api/v1/auth/oauth/${provider}`;
  };

  return (
    <div className="space-y-4">
      <Button
        variant="outline"
        className="w-full"
        onClick={() => handleSocialLogin("google")}
      >
        <Google className="mr-2 h-4 w-4" />
        Continue with Google
      </Button>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => handleSocialLogin("microsoft")}
      >
        <Microsoft className="mr-2 h-4 w-4" />
        Continue with Microsoft
      </Button>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => handleSocialLogin("github")}
      >
        <Github className="mr-2 h-4 w-4" />
        Continue with GitHub
      </Button>
    </div>
  );
};
