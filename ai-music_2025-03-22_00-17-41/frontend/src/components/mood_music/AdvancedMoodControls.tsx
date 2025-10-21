import { Slider } from "@/components/ui/Slider";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";

interface AdvancedMoodControlsProps {
  onParametersChange: (params: MoodParameters) => void;
  defaultParameters?: MoodParameters;
}

export interface MoodParameters {
  tempo: number;
  key: string;
  instrumentation: string[];
}

const MUSICAL_KEYS = [
  "C",
  "G",
  "D",
  "A",
  "E",
  "B",
  "F♯",
  "C♯",
  "F",
  "B♭",
  "E♭",
  "A♭",
  "D♭",
  "G♭",
  "C♭",
  "Am",
  "Em",
  "Bm",
  "F♯m",
  "C♯m",
  "G♯m",
  "D♯m",
  "A♯m",
  "Dm",
  "Gm",
  "Cm",
  "Fm",
  "B♭m",
  "E♭m",
  "A♭m",
];

const INSTRUMENTS = [
  "Piano",
  "Guitar",
  "Strings",
  "Synth",
  "Bass",
  "Drums",
  "Woodwinds",
  "Brass",
  "Percussion",
  "Choir",
];

export function AdvancedMoodControls({
  onParametersChange,
  defaultParameters,
}: AdvancedMoodControlsProps) {
  const [parameters, setParameters] = React.useState<MoodParameters>(
    defaultParameters || {
      tempo: 120,
      key: "C",
      instrumentation: ["Piano"],
    },
  );

  const handleChange = (update: Partial<MoodParameters>) => {
    const newParams = { ...parameters, ...update };
    setParameters(newParams);
    onParametersChange(newParams);
  };

  return (
    <Card className="p-4 space-y-6">
      <div className="space-y-2">
        <Label>Tempo (BPM)</Label>
        <Slider
          value={[parameters.tempo]}
          onValueChange={([value]) => handleChange({ tempo: value })}
          min={40}
          max={200}
          step={1}
          className="py-4"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Slow</span>
          <span>{parameters.tempo} BPM</span>
          <span>Fast</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Key</Label>
        <Select
          value={parameters.key}
          onValueChange={(value) => handleChange({ key: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select key" />
          </SelectTrigger>
          <SelectContent>
            {MUSICAL_KEYS.map((key) => (
              <SelectItem key={key} value={key}>
                {key}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Primary Instrument</Label>
        <Select
          value={parameters.instrumentation[0]}
          onValueChange={(value) =>
            handleChange({
              instrumentation: [value, ...parameters.instrumentation.slice(1)],
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select instrument" />
          </SelectTrigger>
          <SelectContent>
            {INSTRUMENTS.map((instrument) => (
              <SelectItem key={instrument} value={instrument}>
                {instrument}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </Card>
  );
}
