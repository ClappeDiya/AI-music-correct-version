import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Slider } from "@/components/ui/Slider";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Switch } from "@/components/ui/Switch";
import { Label } from "@/components/ui/Label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import {
  Volume2,
  Music4,
  ArrowLeftRight,
  Waves,
  Clock,
  Filter,
} from "lucide-react";

interface InstrumentBalance {
  volume: number;
  timbre: number;
  pan: number;
}

interface Effects {
  reverb: {
    enabled: boolean;
    amount: number;
    decay: number;
  };
  delay: {
    enabled: boolean;
    time: number;
    feedback: number;
  };
  filter: {
    enabled: boolean;
    frequency: number;
    resonance: number;
  };
}

interface InstrumentEffectsControlsProps {
  instruments: string[];
  onInstrumentBalanceChange: (
    instrument: string,
    balance: InstrumentBalance,
  ) => void;
  onEffectsChange: (effects: Effects) => void;
  isLoading?: boolean;
}

export function InstrumentEffectsControls({
  instruments,
  onInstrumentBalanceChange,
  onEffectsChange,
  isLoading = false,
}: InstrumentEffectsControlsProps) {
  const [instrumentBalances, setInstrumentBalances] = useState<
    Record<string, InstrumentBalance>
  >(
    Object.fromEntries(
      instruments.map((inst) => [inst, { volume: 100, timbre: 50, pan: 50 }]),
    ),
  );

  const [effects, setEffects] = useState<Effects>({
    reverb: { enabled: false, amount: 30, decay: 2 },
    delay: { enabled: false, time: 200, feedback: 30 },
    filter: { enabled: false, frequency: 1000, resonance: 1 },
  });

  const handleBalanceChange = (
    instrument: string,
    property: keyof InstrumentBalance,
    value: number,
  ) => {
    const newBalance = {
      ...instrumentBalances[instrument],
      [property]: value,
    };
    setInstrumentBalances({
      ...instrumentBalances,
      [instrument]: newBalance,
    });
    onInstrumentBalanceChange(instrument, newBalance);
  };

  const handleEffectChange = (
    effect: keyof Effects,
    property: string,
    value: number | boolean,
  ) => {
    const newEffects = {
      ...effects,
      [effect]: {
        ...effects[effect],
        [property]: value,
      },
    };
    setEffects(newEffects);
    onEffectsChange(newEffects);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Instrument & Effects</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="instruments">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="instruments">Instruments</TabsTrigger>
            <TabsTrigger value="effects">Effects</TabsTrigger>
          </TabsList>

          <TabsContent value="instruments">
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-6">
                {instruments.map((instrument) => (
                  <div key={instrument} className="space-y-4">
                    <h3 className="font-medium">{instrument}</h3>

                    {/* Volume Control */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Volume2 className="h-4 w-4" />
                              <span className="text-sm">Volume</span>
                              <span className="ml-auto text-sm">
                                {instrumentBalances[instrument].volume}%
                              </span>
                            </div>
                            <Slider
                              value={[instrumentBalances[instrument].volume]}
                              min={0}
                              max={100}
                              step={1}
                              onValueChange={([value]) =>
                                handleBalanceChange(instrument, "volume", value)
                              }
                              disabled={isLoading}
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Adjust instrument volume level</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {/* Timbre Control */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Music4 className="h-4 w-4" />
                              <span className="text-sm">Timbre</span>
                              <span className="ml-auto text-sm">
                                {instrumentBalances[instrument].timbre}%
                              </span>
                            </div>
                            <Slider
                              value={[instrumentBalances[instrument].timbre]}
                              min={0}
                              max={100}
                              step={1}
                              onValueChange={([value]) =>
                                handleBalanceChange(instrument, "timbre", value)
                              }
                              disabled={isLoading}
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Adjust tonal character of the instrument</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {/* Pan Control */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <ArrowLeftRight className="h-4 w-4" />
                              <span className="text-sm">Pan</span>
                              <span className="ml-auto text-sm">
                                {instrumentBalances[instrument].pan < 50
                                  ? "L"
                                  : "R"}
                                {Math.abs(
                                  instrumentBalances[instrument].pan - 50,
                                ) * 2}
                                %
                              </span>
                            </div>
                            <Slider
                              value={[instrumentBalances[instrument].pan]}
                              min={0}
                              max={100}
                              step={1}
                              onValueChange={([value]) =>
                                handleBalanceChange(instrument, "pan", value)
                              }
                              disabled={isLoading}
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Adjust stereo position (Left/Right balance)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="effects">
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-6">
                {/* Reverb */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Waves className="h-4 w-4" />
                      <Label htmlFor="reverb">Reverb</Label>
                    </div>
                    <Switch
                      id="reverb"
                      checked={effects.reverb.enabled}
                      onCheckedChange={(checked) =>
                        handleEffectChange("reverb", "enabled", checked)
                      }
                      disabled={isLoading}
                    />
                  </div>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Amount</span>
                            <span>{effects.reverb.amount}%</span>
                          </div>
                          <Slider
                            value={[effects.reverb.amount]}
                            min={0}
                            max={100}
                            step={1}
                            onValueChange={([value]) =>
                              handleEffectChange("reverb", "amount", value)
                            }
                            disabled={isLoading || !effects.reverb.enabled}
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Adjust reverb intensity</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Decay</span>
                            <span>{effects.reverb.decay}s</span>
                          </div>
                          <Slider
                            value={[effects.reverb.decay]}
                            min={0.1}
                            max={10}
                            step={0.1}
                            onValueChange={([value]) =>
                              handleEffectChange("reverb", "decay", value)
                            }
                            disabled={isLoading || !effects.reverb.enabled}
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Adjust reverb decay time</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* Delay */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <Label htmlFor="delay">Delay</Label>
                    </div>
                    <Switch
                      id="delay"
                      checked={effects.delay.enabled}
                      onCheckedChange={(checked) =>
                        handleEffectChange("delay", "enabled", checked)
                      }
                      disabled={isLoading}
                    />
                  </div>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Time</span>
                            <span>{effects.delay.time}ms</span>
                          </div>
                          <Slider
                            value={[effects.delay.time]}
                            min={0}
                            max={1000}
                            step={10}
                            onValueChange={([value]) =>
                              handleEffectChange("delay", "time", value)
                            }
                            disabled={isLoading || !effects.delay.enabled}
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Adjust delay time</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Feedback</span>
                            <span>{effects.delay.feedback}%</span>
                          </div>
                          <Slider
                            value={[effects.delay.feedback]}
                            min={0}
                            max={100}
                            step={1}
                            onValueChange={([value]) =>
                              handleEffectChange("delay", "feedback", value)
                            }
                            disabled={isLoading || !effects.delay.enabled}
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Adjust delay feedback amount</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* Filter */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <Label htmlFor="filter">Filter</Label>
                    </div>
                    <Switch
                      id="filter"
                      checked={effects.filter.enabled}
                      onCheckedChange={(checked) =>
                        handleEffectChange("filter", "enabled", checked)
                      }
                      disabled={isLoading}
                    />
                  </div>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Frequency</span>
                            <span>{effects.filter.frequency}Hz</span>
                          </div>
                          <Slider
                            value={[effects.filter.frequency]}
                            min={20}
                            max={20000}
                            step={1}
                            onValueChange={([value]) =>
                              handleEffectChange("filter", "frequency", value)
                            }
                            disabled={isLoading || !effects.filter.enabled}
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Adjust filter cutoff frequency</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Resonance</span>
                            <span>{effects.filter.resonance.toFixed(1)}</span>
                          </div>
                          <Slider
                            value={[effects.filter.resonance]}
                            min={0.1}
                            max={20}
                            step={0.1}
                            onValueChange={([value]) =>
                              handleEffectChange("filter", "resonance", value)
                            }
                            disabled={isLoading || !effects.filter.enabled}
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Adjust filter resonance</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
