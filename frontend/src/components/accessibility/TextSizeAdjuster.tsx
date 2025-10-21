import { Slider } from "@/components/ui/Slider";
import { Label } from "@/components/ui/Label";
import { useDynamicPreferences } from "@/contexts/DynamicPreferencesContext";

export function TextSizeAdjuster() {
  const { textSize, setTextSize } = useDynamicPreferences();

  return (
    <div className="space-y-4">
      <Label htmlFor="text-size">Text Size</Label>
      <Slider
        id="text-size"
        value={[textSize]}
        onValueChange={([size]) => setTextSize(size)}
        min={0.8}
        max={2.0}
        step={0.1}
        className="w-[200px]"
      />
      <p className="text-sm text-muted-foreground">Current size: {textSize}x</p>
    </div>
  );
}
