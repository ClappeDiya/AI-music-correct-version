import { DataTable } from "@/components/ui/datatable";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
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
import { useDynamicPricing } from "@/hooks/usedynamic-pricing";
import { DynamicPricingFilter } from "@/types/billing/dynamic-pricing.types";
import { useState } from "react";
import { Plus, Filter } from "lucide-react";

const columns = [
  {
    accessorKey: "name",
    header: "Rule Name",
  },
  {
    accessorKey: "priority",
    header: "Priority",
  },
  {
    accessorKey: "conditions",
    header: "Conditions",
    cell: ({ row }) => (
      <div className="space-y-1">
        {row.original.conditions.map((condition, index) => (
          <div key={index} className="text-sm">
            {condition.type}: {condition.operator}{" "}
            {JSON.stringify(condition.value)}
          </div>
        ))}
      </div>
    ),
  },
  {
    accessorKey: "adjustments",
    header: "Adjustments",
    cell: ({ row }) => (
      <div className="space-y-1">
        {row.original.adjustments.map((adjustment, index) => (
          <div key={index} className="text-sm">
            {adjustment.type}: {adjustment.value}
            {adjustment.currency && ` ${adjustment.currency}`}
          </div>
        ))}
      </div>
    ),
  },
  {
    accessorKey: "active",
    header: "Status",
    cell: ({ row }) => (
      <Switch
        checked={row.original.active}
        onCheckedChange={(checked) => row.original.onToggle(checked)}
        aria-label="Toggle rule status"
      />
    ),
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => row.original.onEdit()}
        >
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => row.original.onSimulate()}
        >
          Simulate
        </Button>
      </div>
    ),
  },
];

export function RuleList() {
  const [filters, setFilters] = useState<DynamicPricingFilter>({});
  const { rules, isLoading, error, toggleRule } = useDynamicPricing(filters);

  const enhancedRules = rules?.map((rule) => ({
    ...rule,
    onToggle: (active: boolean) => toggleRule({ id: rule.id, active }),
    onEdit: () => {
      /* Handle edit */
    },
    onSimulate: () => {
      /* Handle simulate */
    },
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Dynamic Pricing Rules</CardTitle>
            <CardDescription>
              Manage and configure pricing rules
            </CardDescription>
          </div>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Rule
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap gap-4">
          <Select
            onValueChange={(value) =>
              setFilters((f) => ({
                ...f,
                type: value,
              }))
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="time">Time-based</SelectItem>
              <SelectItem value="volume">Volume-based</SelectItem>
              <SelectItem value="user_segment">User Segment</SelectItem>
              <SelectItem value="location">Location-based</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
          <Select
            onValueChange={(value) =>
              setFilters((f) => ({
                ...f,
                active: value === "true",
              }))
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" onClick={() => setFilters({})}>
            <Filter className="mr-2 h-4 w-4" />
            Reset Filters
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={enhancedRules || []}
          isLoading={isLoading}
          error={error?.message}
        />
      </CardContent>
    </Card>
  );
}
