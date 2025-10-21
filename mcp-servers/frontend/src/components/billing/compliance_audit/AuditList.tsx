import { DataTable } from "@/components/ui/datatable";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/componen../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { useComplianceAudit } from "@/hooks/usecompliance-audit";
import { DateRangePicker } from "@/components/ui/daterangepicker";
import {
  ComplianceAuditFilter,
  AuditAction,
} from "@/types/billing/compliance-audit.types";
import { useState } from "react";
import { Download, Filter } from "lucide-react";

const SEVERITY_COLORS = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

const columns = [
  {
    accessorKey: "occurred_at",
    header: "Timestamp",
    cell: ({ row }) => new Date(row.original.occurred_at).toLocaleString(),
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => (
      <span className="capitalize">
        {row.original.action.replace(/_/g, " ")}
      </span>
    ),
  },
  {
    accessorKey: "severity",
    header: "Severity",
    cell: ({ row }) => (
      <span
        className={`px-2 py-1 rounded-full text-xs ${SEVERITY_COLORS[row.original.severity]}`}
      >
        {row.original.severity}
      </span>
    ),
  },
  {
    accessorKey: "user_id",
    header: "User",
  },
  {
    accessorKey: "ip_address",
    header: "IP Address",
  },
  {
    accessorKey: "details",
    header: "Details",
    cell: ({ row }) => (
      <pre className="text-xs whitespace-pre-wrap max-w-xs">
        {JSON.stringify(row.original.details, null, 2)}
      </pre>
    ),
  },
];

export function AuditList() {
  const [filters, setFilters] = useState<ComplianceAuditFilter>({});
  const { audits, summary, isLoading, error, exportAudits, isExporting } =
    useComplianceAudit(filters);

  const handleDateRangeChange = (range: { from: Date; to: Date }) => {
    setFilters((f) => ({
      ...f,
      dateFrom: range.from.toISOString(),
      dateTo: range.to.toISOString(),
    }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Compliance Audit Logs</CardTitle>
            <CardDescription>
              View and export compliance audit logs
            </CardDescription>
          </div>
          <Button
            onClick={() => exportAudits(filters)}
            disabled={isExporting}
            variant="outline"
            size="sm"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap gap-4">
          <DateRangePicker onChange={handleDateRangeChange} />
          <Select
            onValueChange={(value) =>
              setFilters((f) => ({
                ...f,
                severity: value as ComplianceAuditFilter["severity"],
              }))
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="User ID"
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                userId: e.target.value,
              }))
            }
          />
          <Button variant="ghost" onClick={() => setFilters({})}>
            <Filter className="mr-2 h-4 w-4" />
            Reset Filters
          </Button>
        </div>

        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Total Audit Logs
                </CardTitle>
                <div className="text-2xl font-bold">{summary.total}</div>
              </CardHeader>
            </Card>
            {/* Add more summary cards as needed */}
          </div>
        )}

        <DataTable
          columns={columns}
          data={audits || []}
          isLoading={isLoading}
          error={error?.message}
        />
      </CardContent>
    </Card>
  );
}
