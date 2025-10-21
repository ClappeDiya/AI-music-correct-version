import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Textarea } from "@/components/ui/Textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Brain,
  Copyright,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import { ContentFlag } from "@/services/admin_tools/AiModeration";
import { aiModerationApi } from "@/services/admin_tools/AiModeration";
import { useToast } from "@/components/ui/useToast";

interface FlagDetailsDialogProps {
  flag: ContentFlag;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDecision: (
    flag: ContentFlag,
    decision: "approve" | "reject" | "escalate",
  ) => Promise<void>;
}

const confidenceColors = {
  high: "bg-red-500/20 text-red-700",
  medium: "bg-yellow-500/20 text-yellow-700",
  low: "bg-blue-500/20 text-blue-700",
};

const getConfidenceLevel = (score: number) => {
  if (score >= 0.8) return "high";
  if (score >= 0.5) return "medium";
  return "low";
};

export function FlagDetailsDialog({
  flag,
  open,
  onOpenChange,
  onDecision,
}: FlagDetailsDialogProps) {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDecision = async (
    decision: "approve" | "reject" | "escalate",
  ) => {
    setLoading(true);
    try {
      await onDecision(flag, decision);
      if (notes) {
        await aiModerationApi.submitFeedback(flag.id, {
          correct: decision === "reject",
          reason: notes,
        });
      }
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit decision",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getFlagIcon = () => {
    switch (flag.flag_type) {
      case "hate_speech":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "explicit":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "copyright":
        return <Copyright className="h-5 w-5 text-blue-500" />;
      default:
        return <MessageSquare className="h-5 w-5" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getFlagIcon()}
            AI Flag Details
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="space-y-6 p-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Content Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline" className="text-base">
                    {flag.content_type}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    AI Confidence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={
                        confidenceColors[
                          getConfidenceLevel(flag.confidence_score)
                        ]
                      }
                    >
                      {Math.round(flag.confidence_score * 100)}%
                    </Badge>
                    <Brain className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Accordion type="single" collapsible defaultValue="details">
              <AccordionItem value="details">
                <AccordionTrigger>Detection Details</AccordionTrigger>
                <AccordionContent>
                  {flag.details.detected_phrases && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Detected Phrases</h4>
                      <div className="flex flex-wrap gap-2">
                        {flag.details.detected_phrases.map((phrase, index) => (
                          <Badge key={index} variant="secondary">
                            {phrase}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {flag.details.copyright_matches && (
                    <div className="space-y-2 mt-4">
                      <h4 className="font-medium">Copyright Matches</h4>
                      <div className="space-y-2">
                        {flag.details.copyright_matches.map((match, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between"
                          >
                            <span>{match.source}</span>
                            <Badge variant="outline">
                              {Math.round(match.similarity * 100)}% match
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="content">
                <AccordionTrigger>Flagged Content</AccordionTrigger>
                <AccordionContent>
                  <Card className="bg-muted">
                    <CardContent className="p-4">
                      <pre className="whitespace-pre-wrap text-sm">
                        {flag.content_ref}
                      </pre>
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="space-y-2">
              <label className="text-sm font-medium">Moderator Notes</label>
              <Textarea
                placeholder="Add notes about this decision..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="flex-none sm:space-x-2">
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => handleDecision("approve")}
              disabled={loading}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve Content
            </Button>
            <Button
              variant="destructive"
              className="w-full sm:w-auto"
              onClick={() => handleDecision("reject")}
              disabled={loading}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Remove Content
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
