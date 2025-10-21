import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from ../ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/Form';
import { Input } from '../ui/Input';
import { Textarea } from './ui/textarea';
import { Button } from '../ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Slider } from './ui/slider';
import { Switch } from '../ui/Switch';
import { useToast } from './ui/Usetoast';
import { Loader2 } from 'lucide-react';

// Form schema with validation
const promptSchema = z.object({
  prompt: z.string().min(10, 'Prompt must be at least 10 characters'),
  style: z.string(),
  mood: z.string(),
  instruments: z.array(z.string()).min(1, 'Select at least one instrument'),
  complexity: z.number().min(1).max(10),
  useAdvancedLLM: z.boolean().default(false),
  additionalNotes: z.string().optional(),
});

type PromptFormData = z.infer<typeof promptSchema>;

// Available options
const STYLES = ['Classical', 'Jazz', 'Rock', 'Electronic', 'Folk', 'Ambient'];
const MOODS = ['Happy', 'Sad', 'Energetic', 'Calm', 'Mysterious', 'Epic'];
const INSTRUMENTS = ['Piano', 'Guitar', 'Violin', 'Drums', 'Bass', 'Synthesizer', 'Flute', 'Trumpet'];

interface MusicGenerationPromptFormProps {
  onSubmit: (data: PromptFormData) => Promise<void>;
  isLoading?: boolean;
}

export function MusicGenerationPromptForm({ onSubmit, isLoading = false }: MusicGenerationPromptFormProps) {
  const { toast } = useToast();
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);

  const form = useForm<PromptFormData>({
    resolver: zodResolver(promptSchema),
    defaultValues: {
      prompt: '',
      style: 'Classical',
      mood: 'Happy',
      instruments: [],
      complexity: 5,
      useAdvancedLLM: false,
      additionalNotes: '',
    },
  });

  const handleSubmit = async (data: PromptFormData) => {
    try {
      await onSubmit(data);
      toast({
        title: 'Success',
        description: 'Your music generation request has been submitted.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit music generation request. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const toggleInstrument = (instrument: string) => {
    const updated = selectedInstruments.includes(instrument)
      ? selectedInstruments.filter(i => i !== instrument)
      : [...selectedInstruments, instrument];
    setSelectedInstruments(updated);
    form.setValue('instruments', updated);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Generate Music</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Describe your music</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the music you want to generate..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="style"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Style</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select style" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STYLES.map((style) => (
                          <SelectItem key={style} value={style}>
                            {style}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mood"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mood</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select mood" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MOODS.map((mood) => (
                          <SelectItem key={mood} value={mood}>
                            {mood}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="instruments"
              render={() => (
                <FormItem>
                  <FormLabel>Instruments</FormLabel>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {INSTRUMENTS.map((instrument) => (
                      <Button
                        key={instrument}
                        type="button"
                        variant={selectedInstruments.includes(instrument) ? "default" : "outline"}
                        onClick={() => toggleInstrument(instrument)}
                        className="w-full"
                      >
                        {instrument}
                      </Button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="complexity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Complexity (1-10)</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-4">
                      <Slider
                        min={1}
                        max={10}
                        step={1}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        className="flex-1"
                      />
                      <span className="w-12 text-center">{field.value}</span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="useAdvancedLLM"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <FormLabel>Use Advanced LLM (OpenAI)</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="additionalNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional details or preferences..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Music'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 

