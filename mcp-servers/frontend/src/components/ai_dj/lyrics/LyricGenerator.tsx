import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Mic,
  Music,
  Pen,
  Save,
  RefreshCw,
  Sliders,
  BookOpen,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
} from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/useToast";
import { Slider } from "@/components/ui/Slider";
import { lyricPromptApi, lyricDraftApi } from "@/services/LyricsGenerationApi";
import type { LyricPrompt, LyricDraft } from "@/types/LyricsGeneration";

const formSchema = z.object({
  prompt_text: z.string().min(1, "Prompt is required"),
  provider: z.string(),
  language_code: z.string().optional(),
  influencer: z.string().optional(),
  parameters: z
    .object({
      complexity: z.number().min(1).max(10),
      rhymeScheme: z.string(),
      thematicElements: z.array(z.string()),
      emotionalTone: z.string(),
      verseStructure: z.string(),
    })
    .optional(),
});

const RHYME_SCHEMES = [
  { value: "aabb", label: "AABB (Simple)" },
  { value: "abab", label: "ABAB (Alternating)" },
  { value: "abba", label: "ABBA (Enclosed)" },
  { value: "free", label: "Free Verse" },
];

const THEMATIC_ELEMENTS = [
  "Nature",
  "Love",
  "Urban Life",
  "Technology",
  "Spirituality",
  "Social Issues",
  "Personal Growth",
  "Fantasy",
  "Science Fiction",
  "Nostalgia",
];

const EMOTIONAL_TONES = [
  "Joyful",
  "Melancholic",
  "Energetic",
  "Contemplative",
  "Angry",
  "Hopeful",
  "Peaceful",
  "Mysterious",
];

const VERSE_STRUCTURES = [
  { value: "verse-chorus", label: "Verse-Chorus" },
  { value: "verse-chorus-bridge", label: "Verse-Chorus-Bridge" },
  { value: "stanzas", label: "Stanzas Only" },
  { value: "free-form", label: "Free Form" },
];

export function LyricGenerator() {
  const [drafts, setDrafts] = useState<LyricDraft[]>([]);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt_text: "",
      provider: "",
      parameters: {
        complexity: 5,
        rhymeScheme: "abab",
        thematicElements: [],
        emotionalTone: "Joyful",
        verseStructure: "verse-chorus",
      },
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const prompt = await lyricPromptApi.create({
        ...values,
        provider: parseInt(values.provider),
        influencer: values.influencer ? parseInt(values.influencer) : undefined,
        track_id: 0, // TODO: Get from context
      });

      const draft = await lyricDraftApi.create({
        prompt: prompt.id,
      });

      setDrafts([...drafts, draft]);
      toast({
        title: "Success",
        description: "Lyrics generated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate lyrics",
        variant: "destructive",
      });
    }
  };

  const handleRegenerate = async (draftId: number) => {
    try {
      setIsRegenerating(true);
      const currentDraft = drafts.find((d) => d.id === draftId);
      if (!currentDraft) return;

      const newDraft = await lyricDraftApi.create({
        prompt: currentDraft.prompt,
        parameters: form.getValues().parameters,
      });

      setDrafts(drafts.map((d) => (d.id === draftId ? newDraft : d)));
      toast({
        title: "Success",
        description: "Lyrics regenerated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to regenerate lyrics",
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <Card className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="prompt_text"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prompt</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter your lyrics prompt..."
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AI Model</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select AI model" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">GPT-4</SelectItem>
                      <SelectItem value="2">Claude</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="language_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Language</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Sliders className="w-4 h-4" />
              Refinement Controls
            </h3>

            <FormField
              control={form.control}
              name="parameters.complexity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Complexity Level</FormLabel>
                  <FormControl>
                    <Slider
                      min={1}
                      max={10}
                      step={1}
                      value={[field.value]}
                      onValueChange={([value]) => field.onChange(value)}
                    />
                  </FormControl>
                  <FormDescription>
                    Adjust the complexity of generated lyrics (1: Simple, 10:
                    Complex)
                  </FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="parameters.rhymeScheme"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rhyme Scheme</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select rhyme scheme" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {RHYME_SCHEMES.map((scheme) => (
                        <SelectItem key={scheme.value} value={scheme.value}>
                          {scheme.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="parameters.thematicElements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thematic Elements</FormLabel>
                  <Select
                    onValueChange={(value) =>
                      field.onChange([...field.value, value])
                    }
                    value={field.value[field.value.length - 1]}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Add thematic elements" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {THEMATIC_ELEMENTS.map((theme) => (
                        <SelectItem key={theme} value={theme}>
                          {theme}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {field.value.map((theme) => (
                      <Button
                        key={theme}
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          field.onChange(field.value.filter((t) => t !== theme))
                        }
                      >
                        {theme} ×
                      </Button>
                    ))}
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="parameters.emotionalTone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Emotional Tone</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select emotional tone" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EMOTIONAL_TONES.map((tone) => (
                        <SelectItem key={tone} value={tone}>
                          {tone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="parameters.verseStructure"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verse Structure</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select verse structure" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {VERSE_STRUCTURES.map((structure) => (
                        <SelectItem
                          key={structure.value}
                          value={structure.value}
                        >
                          {structure.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" className="flex-1">
              <Wand2 className="w-4 h-4 mr-2" />
              Generate Lyrics
            </Button>
            <Button type="button" variant="outline">
              <Mic className="w-4 h-4 mr-2" />
              Voice Input
            </Button>
            <Button type="button" variant="outline">
              <Music className="w-4 h-4 mr-2" />
              From Melody
            </Button>
          </div>
        </form>
      </Form>

      {drafts.map((draft) => (
        <Card key={draft.id} className="mt-4 p-4">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="text-sm text-muted-foreground">
                Draft #{draft.id}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRegenerate(draft.id)}
                disabled={isRegenerating}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${isRegenerating ? "animate-spin" : ""}`}
                />
                Regenerate
              </Button>
              <Button variant="outline" size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save as Final
              </Button>
            </div>
          </div>
          <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-md">
            {draft.draft_content}
          </pre>
        </Card>
      ))}
    </Card>
  );
}
