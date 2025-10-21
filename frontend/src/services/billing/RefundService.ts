import { BaseService } from "./base.service";
import {
  Refund,
  RefundCreate,
  RefundFilter,
} from "@/types/billing/RefundTypes";
import { api } from "@/lib/api";

export class RefundService extends BaseService<Refund, RefundCreate> {
  constructor() {
    super("/api/refunds");
  }

  async listWithFilters(filters: RefundFilter): Promise<Refund[]> {
    const response = await api.get(this.baseUrl, { params: filters });
    return response.data;
  }

  async cancel(refundId: string): Promise<Refund> {
    const response = await api.post(`${this.baseUrl}/${refundId}/cancel`);
    return response.data;
  }
}
