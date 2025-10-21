import { useState } from "react";
import { useApiQuery, useApiMutation } from "@/lib/hooks/use-api-query";
import { regionalLegalFrameworksApi } from "@/lib/api/services";
import { DataTableView } from "../data-table/data-table-view";
import { StatsCard } from "../shared/stats-card";
import { DataGridLayout } from "../shared/data-grid-layout";
import { FormLayout } from "../shared/form-layout";
import {
  InputField,
  TextAreaField,
  TagInput,
  CheckboxField,
} from "../shared/form-fields";
import { Badge } from "@/components/ui/Badge";
import { Globe, FileText, Check, AlertTriangle, Scale } from "lucide-react";

interface FrameworkFormData {
  region_name: string;
  region_code: string;
  description: string;
  requirements: string[];
  restrictions: string[];
  is_active: boolean;
}

function FrameworkForm({
  initialData,
  onSubmit,
  onCancel,
}: {
  initialData?: any;
  onSubmit: (data: FrameworkFormData) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<FrameworkFormData>(
    initialData || {
      region_name: "",
      region_code: "",
      description: "",
      requirements: [],
      restrictions: [],
      is_active: true,
    },
  );

  return (
    <FormLayout
      onSubmit={() => onSubmit(formData)}
      onCancel={onCancel}
      submitLabel={initialData ? "Update Framework" : "Create Framework"}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <InputField
          label="Region Name"
          value={formData.region_name}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, region_name: value }))
          }
          placeholder="Enter region name"
          required
        />

        <InputField
          label="Region Code"
          value={formData.region_code}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, region_code: value }))
          }
          placeholder="e.g., US, EU, UK"
          required
        />
      </div>

      <TextAreaField
        label="Description"
        value={formData.description}
        onChange={(value) =>
          setFormData((prev) => ({ ...prev, description: value }))
        }
        placeholder="Describe the legal framework..."
        required
      />

      <div className="grid gap-4 md:grid-cols-2">
        <TagInput
          label="Legal Requirements"
          value={formData.requirements}
          onChange={(value) =>
            setFormData((prev) => ({
              ...prev,
              requirements: value,
            }))
          }
          placeholder="Add requirement..."
        />

        <TagInput
          label="Legal Restrictions"
          value={formData.restrictions}
          onChange={(value) =>
            setFormData((prev) => ({
              ...prev,
              restrictions: value,
            }))
          }
          placeholder="Add restriction..."
        />
      </div>

      <CheckboxField
        label="Active Framework"
        checked={formData.is_active}
        onChange={(checked) =>
          setFormData((prev) => ({
            ...prev,
            is_active: checked,
          }))
        }
      />
    </FormLayout>
  );
}

export function RegionalLegalFrameworks() {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState<any>(null);

  const { data, isLoading } = useApiQuery(
    "regional-legal-frameworks",
    regionalLegalFrameworksApi,
  );
  const { create, update, remove } = useApiMutation(
    "regional-legal-frameworks",
    regionalLegalFrameworksApi,
  );

  const handleSubmit = async (formData: FrameworkFormData) => {
    if (selectedFramework) {
      await update.mutate({ id: selectedFramework.id, data: formData });
    } else {
      await create.mutate(formData);
    }
    setShowDialog(false);
    setSelectedFramework(null);
  };

  const columns = [
    {
      accessorKey: "region",
      header: "Region",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <span>
            {row.original.region_name} ({row.original.region_code})
          </span>
        </div>
      ),
    },
    {
      accessorKey: "requirements",
      header: "Requirements",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-2">
          {row.original.requirements.map((req: string, index: number) => (
            <Badge key={`req-${index}`} variant="outline">
              {req}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "restrictions",
      header: "Restrictions",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-2">
          {row.original.restrictions.map(
            (restriction: string, index: number) => (
              <Badge key={`restriction-${index}`} variant="destructive">
                {restriction}
              </Badge>
            ),
          )}
        </div>
      ),
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
  ];

  const activeFrameworks =
    data?.results.filter((framework) => framework.is_active).length || 0;
  const totalRequirements =
    data?.results.reduce(
      (acc, framework) => acc + framework.requirements.length,
      0,
    ) || 0;
  const totalRestrictions =
    data?.results.reduce(
      (acc, framework) => acc + framework.restrictions.length,
      0,
    ) || 0;

  const statsCards = (
    <>
      <StatsCard
        title="Total Frameworks"
        value={data?.results.length || 0}
        icon={Globe}
      />
      <StatsCard
        title="Active Frameworks"
        value={activeFrameworks}
        icon={Check}
        valueColor="var(--success)"
      />
      <StatsCard
        title="Requirements"
        value={totalRequirements}
        icon={FileText}
      />
      <StatsCard
        title="Restrictions"
        value={totalRestrictions}
        icon={AlertTriangle}
        valueColor={totalRestrictions > 0 ? "var(--warning)" : undefined}
      />
    </>
  );

  return (
    <DataGridLayout
      title="Regional Legal Frameworks"
      description="Manage regional legal frameworks and requirements"
      statsCards={statsCards}
      showDialog={showDialog}
      onDialogChange={setShowDialog}
      dialogTitle={
        selectedFramework ? "Edit Framework" : "Create New Framework"
      }
      dialogDescription={
        selectedFramework
          ? "Modify the existing legal framework"
          : "Define a new regional legal framework"
      }
      dialogContent={
        <FrameworkForm
          initialData={selectedFramework}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowDialog(false);
            setSelectedFramework(null);
          }}
        />
      }
    >
      <DataTableView
        columns={columns}
        data={data?.results || []}
        isLoading={isLoading}
        searchPlaceholder="Search frameworks..."
      />
    </DataGridLayout>
  );
}
