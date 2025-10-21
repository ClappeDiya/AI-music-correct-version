import { useState, useEffect } from "react";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import { dynamicPricingRulesApi, tracksApi } from "@/lib/api/services";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Calculator, DollarSign, ArrowRight, Info } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/Tooltip";

interface PriceBreakdown {
  basePrice: number;
  adjustments: {
    ruleId: string;
    ruleName: string;
    type: string;
    amount: number;
  }[];
  finalPrice: number;
}

export function PriceCalculator() {
  const [selectedTrack, setSelectedTrack] = useState<string>("");
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [usageType, setUsageType] = useState<string>("");
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(
    null,
  );

  const { data: tracks } = useApiQuery("tracks", tracksApi);
  const { data: rules } = useApiQuery("pricing-rules", dynamicPricingRulesApi);

  // Simulate price calculation based on selected parameters
  const calculatePrice = () => {
    const track = tracks?.results.find((t) => t.id === selectedTrack);
    if (!track) return;

    const basePrice = track.pricing?.price || 0;
    const adjustments = [];
    let finalPrice = basePrice;

    // Apply volume-based rules
    const volumeRules =
      rules?.results.filter((r) => r.type === "volume" && r.is_active) || [];
    for (const rule of volumeRules) {
      if (quantity >= rule.value) {
        const adjustment =
          rule.adjustment_type === "percentage"
            ? basePrice * (rule.adjustment_value / 100)
            : rule.adjustment_value;
        adjustments.push({
          ruleId: rule.id,
          ruleName: rule.name,
          type: "Volume Discount",
          amount: -adjustment,
        });
        finalPrice -= adjustment;
      }
    }

    // Apply region-based rules
    const regionRules =
      rules?.results.filter((r) => r.type === "region" && r.is_active) || [];
    for (const rule of regionRules) {
      if (rule.condition === selectedRegion) {
        const adjustment =
          rule.adjustment_type === "percentage"
            ? basePrice * (rule.adjustment_value / 100)
            : rule.adjustment_value;
        adjustments.push({
          ruleId: rule.id,
          ruleName: rule.name,
          type: "Regional Pricing",
          amount: adjustment,
        });
        finalPrice += adjustment;
      }
    }

    // Apply usage-based rules
    const usageRules =
      rules?.results.filter((r) => r.type === "usage" && r.is_active) || [];
    for (const rule of usageRules) {
      if (rule.condition === usageType) {
        const adjustment =
          rule.adjustment_type === "percentage"
            ? basePrice * (rule.adjustment_value / 100)
            : rule.adjustment_value;
        adjustments.push({
          ruleId: rule.id,
          ruleName: rule.name,
          type: "Usage Type",
          amount: adjustment,
        });
        finalPrice += adjustment;
      }
    }

    setPriceBreakdown({
      basePrice,
      adjustments,
      finalPrice: Math.max(0, finalPrice) * quantity,
    });
  };

  useEffect(() => {
    if (selectedTrack && selectedRegion && usageType) {
      calculatePrice();
    }
  }, [selectedTrack, selectedRegion, quantity, usageType]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Price Calculator
          </CardTitle>
          <CardDescription>
            Calculate dynamic prices based on various factors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Track</Label>
              <Select value={selectedTrack} onValueChange={setSelectedTrack}>
                <SelectTrigger>
                  <SelectValue placeholder="Select track" />
                </SelectTrigger>
                <SelectContent>
                  {tracks?.results.map((track) => (
                    <SelectItem key={track.id} value={track.id}>
                      {track.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Region</Label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="na">North America</SelectItem>
                  <SelectItem value="eu">Europe</SelectItem>
                  <SelectItem value="asia">Asia</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label>Usage Type</Label>
              <Select value={usageType} onValueChange={setUsageType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select usage type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="broadcast">Broadcast</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {priceBreakdown && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Price Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Component</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Base Price</TableCell>
                      <TableCell className="text-right">
                        ${priceBreakdown.basePrice.toFixed(2)}
                      </TableCell>
                    </TableRow>
                    {priceBreakdown.adjustments.map((adjustment, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{adjustment.type}</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="h-4 w-4 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{adjustment.ruleName}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={
                              adjustment.amount < 0 ? "success" : "default"
                            }
                          >
                            {adjustment.amount < 0 ? "-" : "+"}$
                            {Math.abs(adjustment.amount).toFixed(2)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {quantity > 1 && (
                      <TableRow>
                        <TableCell>Quantity ({quantity}x)</TableCell>
                        <TableCell className="text-right">
                          <ArrowRight className="inline h-4 w-4 mr-2" />x
                          {quantity}
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow className="font-bold">
                      <TableCell>Final Price</TableCell>
                      <TableCell className="text-right text-xl">
                        <DollarSign className="inline h-4 w-4" />
                        {priceBreakdown.finalPrice.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Proceed to Purchase
                </Button>
              </CardFooter>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
