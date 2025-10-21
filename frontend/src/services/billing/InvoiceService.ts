import { BaseService } from "./base.service";
import { Invoice, InvoiceCreate } from "@/types/billing/InvoiceTypes";

export class InvoiceService extends BaseService<Invoice, InvoiceCreate> {
  constructor() {
    super("/api/invoices");
  }

  async downloadPdf(invoiceId: string): Promise<Blob> {
    const response = await api.get(`${this.baseUrl}/${invoiceId}/pdf`, {
      responseType: "blob",
    });
    return response.data;
  }

  async void(invoiceId: string): Promise<Invoice> {
    const response = await api.post(`${this.baseUrl}/${invoiceId}/void`);
    return response.data;
  }
}
