import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useLyrics } from "@/hooks/useLyrics";
import { useToast } from "@/components/ui/useToast";

interface CulturalElement {
  name: string;
  category: string;
  description: string;
  significance: string;
  common_usage: string;
  related: Array<{
    name: string;
    category: string;
    description: string;
  }>;
}

interface CulturalContext {
  elements: CulturalElement[];
  general_notes: {
    overview: string;
    key_concepts: string[];
    etiquette: string[];
  };
  recommendations: string[];
}

interface CulturalContextViewerProps {
  context: CulturalContext;
  className?: string;
}

export const CulturalContextViewer: React.FC<CulturalContextViewerProps> = ({
  context,
  className,
}) => {
  const { currentLyrics, loading, error } = useLyrics();
  const { toast } = useToast();

  React.useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>Cultural Context</CardTitle>
        <CardDescription>
          Understanding the cultural elements in your composition
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-6">
            {/* General Overview */}
            <section>
              <h3 className="text-lg font-semibold mb-2">Overview</h3>
              <p className="text-muted-foreground">
                {context.general_notes.overview}
              </p>
            </section>

            {/* Key Concepts */}
            <section>
              <h3 className="text-lg font-semibold mb-2">Key Concepts</h3>
              <div className="flex flex-wrap gap-2">
                {context.general_notes.key_concepts.map((concept, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {concept}
                  </Badge>
                ))}
              </div>
            </section>

            {/* Cultural Elements */}
            <section>
              <h3 className="text-lg font-semibold mb-2">Cultural Elements</h3>
              <Accordion type="single" collapsible className="w-full">
                <AnimatePresence>
                  {context.elements.map((element, index) => (
                    <motion.div
                      key={element.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <AccordionItem value={element.name}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-2">
                            <span>{element.name}</span>
                            <Badge>{element.category}</Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4 p-4">
                            <div>
                              <h4 className="font-medium mb-1">Description</h4>
                              <p className="text-muted-foreground">
                                {element.description}
                              </p>
                            </div>

                            <div>
                              <h4 className="font-medium mb-1">
                                Cultural Significance
                              </h4>
                              <p className="text-muted-foreground">
                                {element.significance}
                              </p>
                            </div>

                            <div>
                              <h4 className="font-medium mb-1">Common Usage</h4>
                              <p className="text-muted-foreground">
                                {element.common_usage}
                              </p>
                            </div>

                            {element.related.length > 0 && (
                              <div>
                                <h4 className="font-medium mb-1">
                                  Related Elements
                                </h4>
                                <div className="grid gap-2">
                                  {element.related.map((related) => (
                                    <div
                                      key={related.name}
                                      className="p-2 border rounded-lg"
                                    >
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium">
                                          {related.name}
                                        </span>
                                        <Badge
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {related.category}
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-muted-foreground">
                                        {related.description}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </Accordion>
            </section>

            {/* Cultural Etiquette */}
            <section>
              <h3 className="text-lg font-semibold mb-2">Cultural Etiquette</h3>
              <div className="space-y-2">
                {context.general_notes.etiquette.map((rule, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-2 border rounded-lg"
                  >
                    <span className="text-primary">•</span>
                    <p className="text-muted-foreground">{rule}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Recommendations */}
            <section>
              <h3 className="text-lg font-semibold mb-2">Recommendations</h3>
              <div className="space-y-2">
                {context.recommendations.map((recommendation, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-2 p-2 border rounded-lg"
                  >
                    <span className="text-primary">→</span>
                    <p className="text-muted-foreground">{recommendation}</p>
                  </motion.div>
                ))}
              </div>
            </section>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
