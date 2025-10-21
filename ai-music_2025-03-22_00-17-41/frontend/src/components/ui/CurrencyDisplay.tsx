import { useCurrency } from "@/contexts/CurrencyContext";

interface CurrencyDisplayProps {
  value: number;
  className?: string;
}

export function CurrencyDisplay({ value, className }: CurrencyDisplayProps) {
  const { formatCurrency } = useCurrency();

  return <span className={className}>{formatCurrency(value)}</span>;
}
