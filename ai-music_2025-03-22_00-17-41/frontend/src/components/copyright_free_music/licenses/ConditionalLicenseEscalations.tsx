import { useState } from "react";
import { useApiQuery, useApiMutation } from "@/lib/hooks/use-api-query";
import {
  conditionalLicenseEscalationsApi,
  tracksApi,
  licenseTermsApi,
} from "@/lib/api/services";
import { DataTableView } from "../data-table/data-table-view";
import { StatsCard } from "../shared/stats-card";
import { DataGridLayout } from "../shared/data-grid-layout";
import { FormLayout } from "../shared/form-layout";
import { SelectField, InputField, CheckboxField } from "../shared/form-fields";
import { Badge } from "@/components/ui/Badge";
import {
  ArrowUpRight,
  Music,
  FileText,
  TrendingUp,
  AlertTriangle,
  Activity,
  Scale,
} from "lucide-react";

interface EscalationFormData {
  track_id: string;
  from_license_id: string;
  to_license_id: string;
  condition_type: "revenue" | "usage" | "views" | "downloads" | "time";
  condition_value: number;
  notification_threshold?: number;
  is_automatic: boolean;
  is_active: boolean;
}

function EscalationForm({
  initialData,
  onSubmit,
  onCancel,
}: {
  initialData?: any;
  onSubmit: (data: EscalationFormData) => void;
  onCancel: () => void;
}) {
  const { data: tracks } = useApiQuery("tracks", tracksApi);
  const { data: licenses } = useApiQuery("license-terms", licenseTermsApi);

  const [formData, setFormData] = useState<EscalationFormData>(
    initialData || {
      track_id: "",
      from_license_id: "",
      to_license_id: "",
      condition_type: "revenue",
      condition_value: 0,
      is_automatic: true,
      is_active: true,
    },
  );

  return (
    <FormLayout
      onSubmit={() => onSubmit(formData)}
      onCancel={onCancel}
      submitLabel={initialData ? "Update Rule" : "Create Rule"}
    >
      <SelectField
        label="Track"
        value={formData.track_id}
        onChange={(value) =>
          setFormData((prev) => ({ ...prev, track_id: value }))
        }
        options={
          tracks?.results.map((track) => ({
            value: track.id,
            label: track.title,
          })) || []
        }
        placeholder="Select track"
        required
      />

      <div className="grid gap-4 md:grid-cols-2">
        <SelectField
          label="From License"
          value={formData.from_license_id}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, from_license_id: value }))
          }
          options={
            licenses?.results.map((license) => ({
              value: license.id,
              label: license.name,
            })) || []
          }
          placeholder="Select initial license"
          required
        />

        <SelectField
          label="To License"
          value={formData.to_license_id}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, to_license_id: value }))
          }
          options={
            licenses?.results.map((license) => ({
              value: license.id,
              label: license.name,
            })) || []
          }
          placeholder="Select target license"
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SelectField
          label="Condition Type"
          value={formData.condition_type}
          onChange={(
            value: "revenue" | "usage" | "views" | "downloads" | "time",
          ) => setFormData((prev) => ({ ...prev, condition_type: value }))}
          options={[
            { value: "revenue", label: "Revenue Threshold" },
            { value: "usage", label: "Usage Count" },
            { value: "views", label: "View Count" },
            { value: "downloads", label: "Download Count" },
            { value: "time", label: "Time Period (Days)" },
          ]}
          placeholder="Select condition type"
          required
        />

        <InputField
          label="Threshold Value"
          type="number"
          value={formData.condition_value}
          onChange={(value) =>
            setFormData((prev) => ({
              ...prev,
              condition_value: parseFloat(value),
            }))
          }
          required
        />
      </div>

      <InputField
        label="Notification Threshold"
        type="number"
        value={formData.notification_threshold || ""}
        onChange={(value) =>
          setFormData((prev) => ({
            ...prev,
            notification_threshold: value ? parseFloat(value) : undefined,
          }))
        }
        placeholder="Notify before escalation at this threshold"
      />

      <div className="grid gap-4 md:grid-cols-2">
        <CheckboxField
          label="Automatic Escalation"
          checked={formData.is_automatic}
          onChange={(checked) =>
            setFormData((prev) => ({
              ...prev,
              is_automatic: checked,
            }))
          }
        />

        <CheckboxField
          label="Active Rule"
          checked={formData.is_active}
          onChange={(checked) =>
            setFormData((prev) => ({
              ...prev,
              is_active: checked,
            }))
          }
        />
      </div>
    </FormLayout>
  );
}

export function ConditionalLicenseEscalations() {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedRule, setSelectedRule] = useState<any>(null);

  const { data, isLoading } = useApiQuery(
    "conditional-license-escalations",
    conditionalLicenseEscalationsApi,
  );
  const { create, update, remove } = useApiMutation(
    "conditional-license-escalations",
    conditionalLicenseEscalationsApi,
  );

  const handleSubmit = async (formData: EscalationFormData) => {
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
      accessorKey: "track.title",
      header: "Track",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Music className="h-4 w-4" />
          <span>{row.original.track.title}</span>
        </div>
      ),
    },
    {
      accessorKey: "licenses",
      header: "License Escalation",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Scale className="h-4 w-4" />
          <span>
            {row.original.from_license.name}
            <ArrowUpRight className="inline-block h-4 w-4 mx-1" />
            {row.original.to_license.name}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "condition",
      header: "Condition",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          <span>
            {row.original.condition_type}: {row.original.condition_value}
            {row.original.current_value !== undefined && (
              <Badge variant="outline" className="ml-2">
                Current: {row.original.current_value}
              </Badge>
            )}
            {row.original.notification_threshold && (
              <Badge variant="outline" className="ml-2">
                Notify at {row.original.notification_threshold}
              </Badge>
            )}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const isNearThreshold =
          row.original.current_value >=
          (row.original.notification_threshold || row.original.condition_value);
        return (
          <div className="flex items-center gap-2">
            <Badge
              variant={row.original.is_automatic ? "default" : "secondary"}
            >
              {row.original.is_automatic ? "Automatic" : "Manual"}
            </Badge>
            <Badge variant={row.original.is_active ? "success" : "secondary"}>
              {row.original.is_active ? "Active" : "Inactive"}
            </Badge>
            {isNearThreshold && (
              <Badge variant="warning">Pending Escalation</Badge>
            )}
          </div>
        );
      },
    },
  ];

  const activeRules =
    data?.results.filter((rule) => rule.is_active).length || 0;
  const automaticRules =
    data?.results.filter((rule) => rule.is_automatic).length || 0;
  const pendingEscalations =
    data?.results.filter((rule) => {
      const currentValue = rule.current_value || 0;
      return (
        currentValue >= (rule.notification_threshold || rule.condition_value)
      );
    }).length || 0;

  const statsCards = (
    <>
      <StatsCard
        title="Total Rules"
        value={data?.results.length || 0}
        icon={FileText}
      />
      <StatsCard
        title="Active Rules"
        value={activeRules}
        icon={Activity}
        valueColor="var(--success)"
      />
      <StatsCard
        title="Automatic Rules"
        value={automaticRules}
        icon={TrendingUp}
      />
      <StatsCard
        title="Pending Escalations"
        value={pendingEscalations}
        icon={AlertTriangle}
        valueColor={pendingEscalations > 0 ? "var(--warning)" : undefined}
      />
    </>
  );

  return (
    <DataGridLayout
      title="License Escalation Rules"
      description="Manage conditional license escalation rules"
      statsCards={statsCards}
      showDialog={showDialog}
      onDialogChange={setShowDialog}
      dialogTitle={
        selectedRule ? "Edit Escalation Rule" : "Create New Escalation Rule"
      }
      dialogDescription={
        selectedRule
          ? "Modify the existing escalation rule"
          : "Define conditions for automatic license escalation"
      }
      dialogContent={
        <EscalationForm
          initialData={selectedRule}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowDialog(false);
            setSelectedRule(null);
          }}
        />
      }
    >
      <DataTableView
        columns={columns}
        data={data?.results || []}
        isLoading={isLoading}
        searchPlaceholder="Search escalation rules..."
      />
    </DataGridLayout>
  );
}
