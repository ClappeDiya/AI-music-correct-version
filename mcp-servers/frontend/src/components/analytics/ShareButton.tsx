import { Button } from "@/components/ui/Button";
import { Share2 } from "lucide-react";
import { useToast } from "@/components/ui/usetoast";

interface ShareButtonProps {
  onShare: () => void;
}

export function ShareButton({ onShare }: ShareButtonProps) {
  const { toast } = useToast();

  const handleClick = async () => {
    try {
      await onShare();
      toast({
        title: "Share link created",
        description: "The shareable link has been copied to your clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create shareable link",
        variant: "destructive",
      });
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleClick}>
      <Share2 className="mr-2 h-4 w-4" />
      Share
    </Button>
  );
}
