import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Slider } from "@/components/ui/Slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { MusicTradition } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { useTraditions } from "@/hooks/useTraditions";
import { useToast } from "@/components/ui/useToast";

interface TraditionSelectorProps {
  onTraditionSelect: (
    traditions: Array<{ id: string; weight: number }>,
  ) => void;
  className?: string;
}

export const TraditionSelector: React.FC<TraditionSelectorProps> = ({
  onTraditionSelect,
  className,
}) => {
  const { traditions, loading, error } = useTraditions();
  const { toast } = useToast();
  const [selectedTraditions, setSelectedTraditions] = useState<
    Array<{ tradition: MusicTradition; weight: number }>
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [region, setRegion] = useState<string>("");

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const filteredTraditions = traditions.filter((tradition) => {
    const matchesSearch = tradition.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesRegion = !region || tradition.region === region;
    return matchesSearch && matchesRegion;
  });

  const handleTraditionSelect = (tradition: MusicTradition) => {
    if (selectedTraditions.some((t) => t.tradition.id === tradition.id)) {
      return;
    }

    const newSelected = [...selectedTraditions, { tradition, weight: 1.0 }];
    setSelectedTraditions(newSelected);

    // Notify parent component
    onTraditionSelect(
      newSelected.map((t) => ({
        id: t.tradition.id,
        weight: t.weight,
      })),
    );
  };

  const handleWeightChange = (index: number, weight: number) => {
    const newSelected = [...selectedTraditions];
    newSelected[index].weight = weight;
    setSelectedTraditions(newSelected);

    // Notify parent component
    onTraditionSelect(
      newSelected.map((t) => ({
        id: t.tradition.id,
        weight: t.weight,
      })),
    );
  };

  const handleRemoveTradition = (index: number) => {
    const newSelected = selectedTraditions.filter((_, i) => i !== index);
    setSelectedTraditions(newSelected);

    // Notify parent component
    onTraditionSelect(
      newSelected.map((t) => ({
        id: t.tradition.id,
        weight: t.weight,
      })),
    );
  };

  const uniqueRegions = Array.from(new Set(traditions.map((t) => t.region)));

  return (
    <div className={cn("w-full max-w-4xl mx-auto", className)}>
      <Card>
        <CardHeader>
          <CardTitle>Select Musical Traditions</CardTitle>
          <CardDescription>
            Choose one or more musical traditions to blend in your composition
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Search Traditions</Label>
                <Input
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name..."
                  className="mt-1"
                />
              </div>
              <div className="w-full sm:w-48">
                <Label htmlFor="region">Filter by Region</Label>
                <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger id="region" className="mt-1">
                    <SelectValue placeholder="All Regions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Regions</SelectItem>
                    {uniqueRegions.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Selected Traditions */}
            <div className="space-y-4">
              <Label>Selected Traditions</Label>
              <AnimatePresence>
                {selectedTraditions.map((selected, index) => (
                  <motion.div
                    key={selected.tradition.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="flex items-center gap-4 p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{selected.tradition.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Weight: {selected.weight.toFixed(2)}
                      </p>
                    </div>
                    <div className="w-48">
                      <Slider
                        value={[selected.weight]}
                        min={0}
                        max={1}
                        step={0.1}
                        onValueChange={([value]) =>
                          handleWeightChange(index, value)
                        }
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveTradition(index)}
                    >
                      ✕
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Available Traditions */}
            <div>
              <Label>Available Traditions</Label>
              <ScrollArea className="h-[300px] border rounded-lg mt-2">
                <div className="p-4 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {loading ? (
                    <div className="col-span-full flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    </div>
                  ) : (
                    filteredTraditions.map((tradition) => (
                      <motion.div
                        key={tradition.id}
                        whileHover={{ scale: 1.02 }}
                        className="relative"
                      >
                        <Button
                          variant="outline"
                          className="w-full h-auto text-left p-4"
                          onClick={() => handleTraditionSelect(tradition)}
                          disabled={selectedTraditions.some(
                            (t) => t.tradition.id === tradition.id,
                          )}
                        >
                          <div>
                            <h4 className="font-medium">{tradition.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {tradition.region}
                            </p>
                          </div>
                        </Button>
                      </motion.div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
