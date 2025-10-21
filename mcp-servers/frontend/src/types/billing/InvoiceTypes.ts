import { BaseEntity } from "./CommonTypes";

export interface Invoice extends BaseEntity {
  stripe_invoice_id: string;
  amount_cents: number;
  currency: string;
  status: string;
  invoice_data: Record<string, any> | null;
}

export interface InvoiceCreate {
  customer_id: string;
  amount_cents: number;
  currency: string;
  description?: string;
}
