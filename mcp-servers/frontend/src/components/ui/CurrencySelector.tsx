import { useCurrency } from "@/contexts/CurrencyContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

export function CurrencySelector() {
  const { currentCurrency, setCurrency, currencies } = useCurrency();

  return (
    <Select
      value={currentCurrency}
      onValueChange={(value) => setCurrency(value)}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select currency" />
      </SelectTrigger>
      <SelectContent>
        {currencies.map((currency) => (
          <SelectItem key={currency.code} value={currency.code}>
            {currency.name} ({currency.symbol})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
