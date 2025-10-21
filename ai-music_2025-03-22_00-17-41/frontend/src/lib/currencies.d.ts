declare module "@/lib/currencies" {
  export interface Currency {
    code: string;
    name: string;
    symbol: string;
  }

  export const currencies: Currency[];
}
