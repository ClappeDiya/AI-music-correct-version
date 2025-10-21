import { createContext, useContext, useEffect, useState } from "react";
import { useLanguage } from "./LanguageContext";
import { trpc } from "@/lib/trpc";

type CurrencyContextType = {
  currentCurrency: string;
  setCurrency: (currency: string) => Promise<void>;
  formatCurrency: (amount: number) => string;
  currencies: { code: string; name: string; symbol: string }[];
};

const CurrencyContext = createContext<CurrencyContextType>({
  currentCurrency: "USD",
  setCurrency: async () => {},
  formatCurrency: (amount: number) => amount.toString(),
  currencies: [
    { code: "USD", name: "US Dollar", symbol: "$" },
    { code: "EUR", name: "Euro", symbol: "€" },
    { code: "GBP", name: "British Pound", symbol: "£" },
    { code: "JPY", name: "Japanese Yen", symbol: "¥" },
    { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  ],
});

export const CurrencyProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { currentLanguage } = useLanguage();
  const [currentCurrency, setCurrentCurrency] = useState("USD");
  const setCurrencyMutation =
    trpc.settings.dynamicPreferences.setCurrency.useMutation();
  const getCurrencyQuery =
    trpc.settings.dynamicPreferences.getCurrency.useQuery(undefined, {
      queryKey: ["settings.dynamicPreferences.getCurrency", undefined],
      initialData: "USD",
    });

  useEffect(() => {
    if (getCurrencyQuery.data) {
      setCurrentCurrency(getCurrencyQuery.data);
    }
  }, [getCurrencyQuery.data]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(currentLanguage, {
      style: "currency",
      currency: currentCurrency,
    }).format(amount);
  };

  const setCurrency = async (currency: string) => {
    try {
      await setCurrencyMutation.mutateAsync({ currency });
      setCurrentCurrency(currency);
    } catch (error) {
      console.error("Failed to set currency:", error);
    }
  };

  return (
    <CurrencyContext.Provider
      value={{
        currentCurrency,
        setCurrency,
        formatCurrency,
        currencies: [
          { code: "USD", name: "US Dollar", symbol: "$" },
          { code: "EUR", name: "Euro", symbol: "€" },
          { code: "GBP", name: "British Pound", symbol: "£" },
          { code: "JPY", name: "Japanese Yen", symbol: "¥" },
          { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
        ],
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
