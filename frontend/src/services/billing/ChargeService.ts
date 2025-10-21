import { BaseService } from "./base.service";
import {
  Charge,
  ChargeCreate,
  ChargeFilter,
} from "@/types/billing/ChargeTypes";
import { api } from "@/lib/api";

export class ChargeService extends BaseService<Charge, ChargeCreate> {
  constructor() {
    super("/api/charges");
  }

  async capture(chargeId: string, amount?: number): Promise<Charge> {
    const response = await api.post(`${this.baseUrl}/${chargeId}/capture`, {
      amount,
    });
    return response.data;
  }

  async listWithFilters(filters: ChargeFilter): Promise<Charge[]> {
    const response = await api.get(this.baseUrl, { params: filters });
    return response.data;
  }
}
