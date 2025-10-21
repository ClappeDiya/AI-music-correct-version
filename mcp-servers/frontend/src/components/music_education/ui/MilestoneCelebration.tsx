"use client";

import { useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Trophy, Share2, X } from "lucide-react";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";

interface MilestoneCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: () => void;
  achievement: {
    title: string;
    description: string;
    type: "milestone" | "skill" | "social" | "special";
    icon: string;
    reward?: {
      type: string;
      value: string;
    };
  };
}

const CELEBRATION_COLORS = {
  milestone: ["#9333EA", "#C084FC"], // Purple
  skill: ["#2563EB", "#60A5FA"], // Blue
  social: ["#16A34A", "#4ADE80"], // Green
  special: ["#EAB308", "#FDE047"], // Yellow
} as const;

export function MilestoneCelebration({
  isOpen,
  onClose,
  onShare,
  achievement,
}: MilestoneCelebrationProps) {
  useEffect(() => {
    if (isOpen) {
      const colors = CELEBRATION_COLORS[achievement.type];

      // Initial burst
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors,
      });

      // Follow-up bursts
      const timer = setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        });

        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        });
      }, 250);

      return () => clearTimeout(timer);
    }
  }, [isOpen, achievement.type]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="flex flex-col items-center text-center space-y-4 py-6">
            <div className="relative">
              <div
                className={cn(
                  "w-20 h-20 rounded-full flex items-center justify-center animate-bounce",
                  {
                    "bg-purple-100": achievement.type === "milestone",
                    "bg-blue-100": achievement.type === "skill",
                    "bg-green-100": achievement.type === "social",
                    "bg-yellow-100": achievement.type === "special",
                  },
                )}
              >
                <Trophy
                  className={cn("w-10 h-10", {
                    "text-purple-500": achievement.type === "milestone",
                    "text-blue-500": achievement.type === "skill",
                    "text-green-500": achievement.type === "social",
                    "text-yellow-500": achievement.type === "special",
                  })}
                />
              </div>
              <div
                className={cn(
                  "absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center animate-ping",
                  {
                    "bg-purple-400": achievement.type === "milestone",
                    "bg-blue-400": achievement.type === "skill",
                    "bg-green-400": achievement.type === "social",
                    "bg-yellow-400": achievement.type === "special",
                  },
                )}
              />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Achievement Unlocked!</h2>
              <p className="text-xl font-semibold">{achievement.title}</p>
              <p className="text-muted-foreground">{achievement.description}</p>
            </div>

            {achievement.reward && (
              <div
                className={cn("rounded-lg p-4 w-full text-white", {
                  "bg-purple-500": achievement.type === "milestone",
                  "bg-blue-500": achievement.type === "skill",
                  "bg-green-500": achievement.type === "social",
                  "bg-yellow-500": achievement.type === "special",
                })}
              >
                <p className="font-medium">Reward Earned</p>
                <p className="text-sm opacity-90">{achievement.reward.value}</p>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button onClick={onClose}>Continue Learning</Button>
              <Button variant="outline" onClick={onShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
