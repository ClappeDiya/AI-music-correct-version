import { useState } from "react";
import { useApiQuery, useApiMutation } from "@/lib/hooks/use-api-query";
import { dynamicPricingRulesApi } from "@/lib/api/services";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { Switch } from "@/components/ui/Switch";
import { Badge } from "@/components/ui/Badge";
import { DataTableView } from "../data-table/data-table-view";
import {
  Settings,
  Plus,
  Edit,
  Trash,
  DollarSign,
  TrendingUp,
  BarChart,
} from "lucide-react";

const RULE_TYPES = [
  { id: "demand", name: "Demand-based" },
  { id: "time", name: "Time-based" },
  { id: "volume", name: "Volume-based" },
  { id: "region", name: "Region-based" },
  { id: "usage", name: "Usage-based" },
];

const RULE_CONDITIONS = [
  { id: "gt", name: "Greater than" },
  { id: "lt", name: "Less than" },
  { id: "eq", name: "Equal to" },
  { id: "between", name: "Between" },
];

interface PricingRule {
  id: string;
  name: string;
  type: string;
  condition: string;
  value: number;
  adjustment_type: "percentage" | "fixed";
  adjustment_value: number;
  is_active: boolean;
  priority: number;
}

function RuleForm({
  initialData,
  onSubmit,
  onCancel,
}: {
  initialData?: PricingRule;
  onSubmit: (data: Partial<PricingRule>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<Partial<PricingRule>>(
    initialData || {
      name: "",
      type: "",
      condition: "",
      value: 0,
      adjustment_type: "percentage",
      adjustment_value: 0,
      is_active: true,
      priority: 0,
    },
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(formData);
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="name">Rule Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder="e.g., Holiday Season Discount"
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Rule Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, type: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {RULE_TYPES.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Condition</Label>
          <Select
            value={formData.condition}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, condition: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              {RULE_CONDITIONS.map((condition) => (
                <SelectItem key={condition.id} value={condition.id}>
                  {condition.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Value</Label>
          <Input
            type="number"
            value={formData.value}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                value: Number(e.target.value),
              }))
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Priority</Label>
          <Input
            type="number"
            value={formData.priority}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                priority: Number(e.target.value),
              }))
            }
            required
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Adjustment Type</Label>
          <Select
            value={formData.adjustment_type}
            onValueChange={(value: "percentage" | "fixed") =>
              setFormData((prev) => ({ ...prev, adjustment_type: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage</SelectItem>
              <SelectItem value="fixed">Fixed Amount</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Adjustment Value</Label>
          <Input
            type="number"
            value={formData.adjustment_value}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                adjustment_value: Number(e.target.value),
              }))
            }
            required
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={formData.is_active}
          onCheckedChange={(checked) =>
            setFormData((prev) => ({ ...prev, is_active: checked }))
          }
        />
        <Label>Active</Label>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? "Update Rule" : "Create Rule"}
        </Button>
      </div>
    </form>
  );
}

export function DynamicPricingRules() {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedRule, setSelectedRule] = useState<PricingRule | null>(null);

  const { data, isLoading } = useApiQuery(
    "pricing-rules",
    dynamicPricingRulesApi,
  );
  const { create, update, remove } = useApiMutation(
    "pricing-rules",
    dynamicPricingRulesApi,
  );

  const handleSubmit = async (formData: Partial<PricingRule>) => {
    if (selectedRule) {
      await update.mutate({ id: selectedRule.id, data: formData });
    } else {
      await create.mutate(formData);
    }
    setShowDialog(false);
    setSelectedRule(null);
  };

  const columns = [
    {
      accessorKey: "name",
      header: "Rule Name",
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = RULE_TYPES.find((t) => t.id === row.original.type);
        return type?.name || row.original.type;
      },
    },
    {
      accessorKey: "adjustment_value",
      header: "Adjustment",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          <span>
            {row.original.adjustment_value}
            {row.original.adjustment_type === "percentage" ? "%" : ""}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "priority",
      header: "Priority",
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? "success" : "secondary"}>
          {row.original.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedRule(row.original);
              setShowDialog(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => remove.mutate(row.original.id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.results.filter((rule) => rule.is_active).length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Adjustment
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15.3%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Price Impact</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+8.2%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Dynamic Pricing Rules</CardTitle>
            <CardDescription>
              Manage your dynamic pricing rules and adjustments
            </CardDescription>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {selectedRule ? "Edit Rule" : "Create New Rule"}
                </DialogTitle>
                <DialogDescription>
                  {selectedRule
                    ? "Modify the existing pricing rule"
                    : "Set up a new dynamic pricing rule"}
                </DialogDescription>
              </DialogHeader>
              <RuleForm
                initialData={selectedRule || undefined}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowDialog(false);
                  setSelectedRule(null);
                }}
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <DataTableView
            columns={columns}
            data={data?.results || []}
            isLoading={isLoading}
            searchPlaceholder="Search rules..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
