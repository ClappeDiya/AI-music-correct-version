import { BaseService } from "./base.service";
import {
  ComplianceAudit,
  ComplianceAuditCreate,
  ComplianceAuditFilter,
} from "@/types/billing/ComplianceAuditTypes";
import { api } from "@/lib/api";

export class ComplianceAuditService extends BaseService<
  ComplianceAudit,
  ComplianceAuditCreate
> {
  constructor() {
    super("/api/compliance-audits");
  }

  async listWithFilters(
    filters: ComplianceAuditFilter,
  ): Promise<ComplianceAudit[]> {
    const response = await api.get(this.baseUrl, { params: filters });
    return response.data;
  }

  async export(filters: ComplianceAuditFilter): Promise<Blob> {
    const response = await api.get(`${this.baseUrl}/export`, {
      params: filters,
      responseType: "blob",
    });
    return response.data;
  }

  async getAuditSummary(dateRange: { from: string; to: string }): Promise<{
    total: number;
    bySeverity: Record<string, number>;
    byAction: Record<string, number>;
  }> {
    const response = await api.get(`${this.baseUrl}/summary`, {
      params: dateRange,
    });
    return response.data;
  }
}
