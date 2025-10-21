import { BaseService } from "./base.service";
import {
  DynamicPricingRule,
  DynamicPricingRuleCreate,
  DynamicPricingRuleUpdate,
  DynamicPricingFilter,
} from "@/types/billing/DynamicPricingTypes";
import { api } from "@/lib/api";

export class DynamicPricingService extends BaseService<
  DynamicPricingRule,
  DynamicPricingRuleCreate
> {
  constructor() {
    super("/api/dynamic-pricing-rules");
  }

  async listWithFilters(
    filters: DynamicPricingFilter,
  ): Promise<DynamicPricingRule[]> {
    const response = await api.get(this.baseUrl, { params: filters });
    return response.data;
  }

  async updateRule(
    id: string,
    data: DynamicPricingRuleUpdate,
  ): Promise<DynamicPricingRule> {
    const response = await api.patch(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  async toggleActive(id: string, active: boolean): Promise<DynamicPricingRule> {
    const response = await api.post(`${this.baseUrl}/${id}/toggle`, { active });
    return response.data;
  }

  async simulatePrice(
    id: string,
    params: Record<string, any>,
  ): Promise<{
    originalPrice: number;
    adjustedPrice: number;
    appliedRules: string[];
    currency: string;
  }> {
    const response = await api.post(`${this.baseUrl}/${id}/simulate`, params);
    return response.data;
  }
}
