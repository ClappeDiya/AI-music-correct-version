import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/useToast";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  Music,
  Headphones,
  Mic2,
  Radio,
  Settings,
  Mix,
  AlertCircle,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Persona {
  id: string;
  name: string;
  description: string;
  icon: string;
  preferences: any;
}

interface PersonaFusion {
  id: string;
  name: string;
  description: string;
  source_personas: string[];
  fused_profile: any;
  confidence_score: number;
  is_active: boolean;
  last_used: string;
}

const PERSONA_ICONS: { [key: string]: any } = {
  casual: Headphones,
  professional: Music,
  recording: Mic2,
  broadcast: Radio,
  custom: Settings,
};

export function PersonaFusion() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);
  const [activeFusion, setActiveFusion] = useState<PersonaFusion | null>(null);
  const [fusionPreview, setFusionPreview] = useState<any>(null);
  const [newFusionName, setNewFusionName] = useState("");
  const [newFusionDesc, setNewFusionDesc] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPersonas();
    fetchActiveFusion();
  }, []);

  const fetchPersonas = async () => {
    try {
      const response = await fetch("/api/settings/personas/");
      const data = await response.json();
      setPersonas(data);
    } catch (error) {
      console.error("Error fetching personas:", error);
    }
  };

  const fetchActiveFusion = async () => {
    try {
      const response = await fetch(
        "/api/settings/personafusion/?is_active=true",
      );
      const data = await response.json();
      if (data.length > 0) {
        setActiveFusion(data[0]);
      }
    } catch (error) {
      console.error("Error fetching active fusion:", error);
    }
  };

  const handlePersonaSelect = (personaId: string) => {
    setSelectedPersonas((prev) => {
      if (prev.includes(personaId)) {
        return prev.filter((id) => id !== personaId);
      }
      return [...prev, personaId];
    });
  };

  const previewFusion = async () => {
    if (selectedPersonas.length < 2) {
      toast({
        title: "Select Personas",
        description: "Please select at least two personas to fuse",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const sourcePersonas = selectedPersonas.map(
        (id) => personas.find((p) => p.id === id)?.preferences,
      );

      const response = await fetch(
        "/api/settings/personafusion/preview_fusion/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ source_personas: sourcePersonas }),
        },
      );
      const data = await response.json();
      setFusionPreview(data);
    } catch (error) {
      console.error("Error previewing fusion:", error);
      toast({
        title: "Preview Failed",
        description: "Failed to generate fusion preview",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createFusion = async () => {
    if (!newFusionName) {
      toast({
        title: "Name Required",
        description: "Please provide a name for the fusion",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const sourcePersonas = selectedPersonas.map(
        (id) => personas.find((p) => p.id === id)?.preferences,
      );

      const response = await fetch("/api/settings/personafusion/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newFusionName,
          description: newFusionDesc,
          source_personas: sourcePersonas,
        }),
      });
      const data = await response.json();

      toast({
        title: "Fusion Created",
        description: "New persona fusion has been created",
      });

      // Activate the new fusion
      await fetch(`/api/settings/personafusion/${data.id}/activate/`, {
        method: "POST",
      });

      fetchActiveFusion();
      setFusionPreview(null);
      setNewFusionName("");
      setNewFusionDesc("");
      setSelectedPersonas([]);
    } catch (error) {
      console.error("Error creating fusion:", error);
      toast({
        title: "Creation Failed",
        description: "Failed to create persona fusion",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const rollbackFusion = async () => {
    if (!activeFusion) return;

    try {
      await fetch(`/api/settings/personafusion/${activeFusion.id}/rollback/`, {
        method: "POST",
      });

      toast({
        title: "Fusion Rolled Back",
        description: "Settings have been reverted to previous state",
      });

      fetchActiveFusion();
    } catch (error) {
      console.error("Error rolling back fusion:", error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Persona Fusion</CardTitle>
          <CardDescription>
            Combine multiple personas to create a hybrid preference set
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="personas" className="w-full">
            <TabsList>
              <TabsTrigger value="personas">Select Personas</TabsTrigger>
              <TabsTrigger value="preview" disabled={!fusionPreview}>
                Preview
              </TabsTrigger>
              <TabsTrigger value="active" disabled={!activeFusion}>
                Active Fusion
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personas">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {personas.map((persona) => {
                    const Icon = PERSONA_ICONS[persona.icon] || Mix;
                    return (
                      <Card
                        key={persona.id}
                        className={cn(
                          "cursor-pointer transition-colors",
                          selectedPersonas.includes(persona.id)
                            ? "border-primary"
                            : "hover:border-primary/50",
                        )}
                        onClick={() => handlePersonaSelect(persona.id)}
                      >
                        <CardHeader>
                          <div className="flex items-center space-x-2">
                            <Icon className="h-5 w-5" />
                            <CardTitle className="text-lg">
                              {persona.name}
                            </CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            {persona.description}
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {selectedPersonas.length >= 2 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Fusion Name</Label>
                      <Input
                        value={newFusionName}
                        onChange={(e) => setNewFusionName(e.target.value)}
                        placeholder="e.g., Studio Performance Mode"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={newFusionDesc}
                        onChange={(e) => setNewFusionDesc(e.target.value)}
                        placeholder="Describe this fusion..."
                      />
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="secondary"
                        onClick={previewFusion}
                        disabled={isLoading}
                      >
                        Preview Fusion
                      </Button>

                      <Button
                        onClick={createFusion}
                        disabled={isLoading || !newFusionName}
                      >
                        Create Fusion
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="preview">
              {fusionPreview && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Confidence Score:{" "}
                      {Math.round(fusionPreview.confidence_score * 100)}%
                    </p>
                  </div>

                  <ScrollArea className="h-[400px] rounded-md border p-4">
                    <div className="space-y-4">
                      {/* Added Settings */}
                      {Object.keys(fusionPreview.preview.added).length > 0 && (
                        <div>
                          <h4 className="font-medium">New Settings</h4>
                          <pre className="mt-2 rounded-md bg-muted p-4">
                            {JSON.stringify(
                              fusionPreview.preview.added,
                              null,
                              2,
                            )}
                          </pre>
                        </div>
                      )}

                      {/* Modified Settings */}
                      {Object.keys(fusionPreview.preview.modified).length >
                        0 && (
                        <div>
                          <h4 className="font-medium">Modified Settings</h4>
                          <pre className="mt-2 rounded-md bg-muted p-4">
                            {JSON.stringify(
                              fusionPreview.preview.modified,
                              null,
                              2,
                            )}
                          </pre>
                        </div>
                      )}

                      {/* Removed Settings */}
                      {Object.keys(fusionPreview.preview.removed).length >
                        0 && (
                        <div>
                          <h4 className="font-medium">Removed Settings</h4>
                          <pre className="mt-2 rounded-md bg-muted p-4">
                            {JSON.stringify(
                              fusionPreview.preview.removed,
                              null,
                              2,
                            )}
                          </pre>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </TabsContent>

            <TabsContent value="active">
              {activeFusion && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{activeFusion.name}</CardTitle>
                        <CardDescription>
                          Created from {activeFusion.source_personas.length}{" "}
                          personas
                        </CardDescription>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={rollbackFusion}
                      >
                        Rollback
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Confidence Score:{" "}
                          {Math.round(activeFusion.confidence_score * 100)}%
                        </p>
                      </div>
                      <p className="text-sm">{activeFusion.description}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
