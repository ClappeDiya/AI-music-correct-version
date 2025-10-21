import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Participant {
  id: string;
  user__username: string;
  role: string;
}

interface ParticipantListProps {
  participants: Participant[];
  className?: string;
}

export const ParticipantList: React.FC<ParticipantListProps> = ({
  participants,
  className,
}) => {
  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "producer":
        return "bg-red-500";
      case "composer":
        return "bg-blue-500";
      case "arranger":
        return "bg-green-500";
      case "performer":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <ScrollArea className={cn("h-[500px]", className)}>
      <div className="space-y-4">
        <AnimatePresence>
          {participants.map((participant) => (
            <motion.div
              key={participant.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent"
            >
              <div className="relative">
                <Avatar>
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${participant.user__username}`}
                    alt={participant.user__username}
                  />
                  <AvatarFallback>
                    {participant.user__username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background",
                    getRoleColor(participant.role),
                  )}
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {participant.user__username}
                </p>
                <Badge variant="secondary" className="mt-1 text-xs">
                  {participant.role}
                </Badge>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ScrollArea>
  );
};
