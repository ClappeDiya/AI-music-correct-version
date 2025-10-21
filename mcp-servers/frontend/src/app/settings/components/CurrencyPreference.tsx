import { useCurrency } from "@/contexts/CurrencyContext";
import { CurrencySelector } from "@/components/ui/CurrencySelector";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/componen../ui/card";

export default function CurrencyPreference() {
  const { currentCurrency } = useCurrency();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Currency Preferences</CardTitle>
        <CardDescription>Current currency: {currentCurrency}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Select your preferred currency
            </label>
            <CurrencySelector />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
