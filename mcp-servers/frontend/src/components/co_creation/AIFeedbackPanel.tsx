import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Wand2, Music, Sparkles, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIFeedbackPanelProps {
  onRequest: (type: string, context: any) => void;
  className?: string;
}

export const AIFeedbackPanel: React.FC<AIFeedbackPanelProps> = ({
  onRequest,
  className,
}) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const aiActions = [
    {
      id: "melody",
      icon: Music,
      label: "Generate Melody",
      description:
        "Create a new melody that complements the current composition",
      type: "melody_generation",
    },
    {
      id: "harmony",
      icon: Sparkles,
      label: "Suggest Harmony",
      description: "Get harmonic suggestions for the selected section",
      type: "harmony_suggestion",
    },
    {
      id: "variation",
      icon: RefreshCw,
      label: "Create Variation",
      description: "Generate variations of the selected musical phrase",
      type: "variation_generation",
    },
  ];

  const handleActionClick = async (action: any) => {
    setIsLoading(true);
    try {
      await onRequest(action.type, {
        // Add relevant context based on the current composition state
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence>
          {aiActions.map((action) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card
                className={cn(
                  "p-4 cursor-pointer transition-all hover:shadow-md",
                  isLoading && "opacity-50 pointer-events-none",
                )}
                onClick={() => handleActionClick(action)}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <action.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{action.label}</h3>
                    <p className="text-sm text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">Recent Suggestions</h3>
        <ScrollArea className="h-[300px]">
          <AnimatePresence>
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="mb-4"
              >
                <Card className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Wand2 className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{suggestion.content}</p>
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Handle applying suggestion
                          }}
                        >
                          Apply
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Handle modifying suggestion
                          }}
                        >
                          Modify
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </ScrollArea>
      </div>
    </div>
  );
};
