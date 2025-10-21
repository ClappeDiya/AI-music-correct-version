import { useState } from "react";
import { useApiQuery, useApiMutation } from "@/lib/hooks/use-api-query";
import {
  trackLegalMappingsApi,
  tracksApi,
  regionalLegalFrameworksApi,
} from "@/lib/api/services";
import { DataTableView } from "../data-table/data-table-view";
import { StatsCard } from "../shared/stats-card";
import { DataGridLayout } from "../shared/data-grid-layout";
import { FormLayout } from "../shared/form-layout";
import {
  SelectField,
  TextAreaField,
  TagInput,
  CheckboxField,
} from "../shared/form-fields";
import { Badge } from "@/components/ui/Badge";
import {
  Globe,
  Music,
  Scale,
  AlertTriangle,
  Check,
  FileText,
} from "lucide-react";

interface MappingFormData {
  track_id: string;
  framework_id: string;
  compliance_status: "compliant" | "pending" | "non_compliant";
  override_restrictions: string[];
  additional_requirements: string;
  notes: string;
  is_active: boolean;
}

function MappingForm({
  initialData,
  onSubmit,
  onCancel,
}: {
  initialData?: any;
  onSubmit: (data: MappingFormData) => void;
  onCancel: () => void;
}) {
  const { data: tracks } = useApiQuery("tracks", tracksApi);
  const { data: frameworks } = useApiQuery(
    "regional-legal-frameworks",
    regionalLegalFrameworksApi,
  );

  const [formData, setFormData] = useState<MappingFormData>(
    initialData || {
      track_id: "",
      framework_id: "",
      compliance_status: "pending",
      override_restrictions: [],
      additional_requirements: "",
      notes: "",
      is_active: true,
    },
  );

  return (
    <FormLayout
      onSubmit={() => onSubmit(formData)}
      onCancel={onCancel}
      submitLabel={initialData ? "Update Mapping" : "Create Mapping"}
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

      <SelectField
        label="Legal Framework"
        value={formData.framework_id}
        onChange={(value) =>
          setFormData((prev) => ({ ...prev, framework_id: value }))
        }
        options={
          frameworks?.results.map((framework) => ({
            value: framework.id,
            label: `${framework.region_name} (${framework.region_code})`,
          })) || []
        }
        placeholder="Select framework"
        required
      />

      <SelectField
        label="Compliance Status"
        value={formData.compliance_status}
        onChange={(value: any) =>
          setFormData((prev) => ({
            ...prev,
            compliance_status: value,
          }))
        }
        options={[
          { value: "compliant", label: "Compliant" },
          { value: "pending", label: "Pending Review" },
          { value: "non_compliant", label: "Non-Compliant" },
        ]}
        required
      />

      <TagInput
        value={formData.override_restrictions}
        onChange={(value) =>
          setFormData((prev) => ({
            ...prev,
            override_restrictions: value,
          }))
        }
        placeholder="Add override restriction..."
      />

      <TextAreaField
        label="Additional Requirements"
        value={formData.additional_requirements}
        onChange={(value) =>
          setFormData((prev) => ({
            ...prev,
            additional_requirements: value,
          }))
        }
        placeholder="Specify any additional legal requirements..."
      />

      <TextAreaField
        label="Notes"
        value={formData.notes}
        onChange={(value) =>
          setFormData((prev) => ({
            ...prev,
            notes: value,
          }))
        }
        placeholder="Add any relevant notes..."
      />

      <CheckboxField
        label="Active Mapping"
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

export function TrackLegalMappings() {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedMapping, setSelectedMapping] = useState<any>(null);

  const { data, isLoading } = useApiQuery(
    "track-legal-mappings",
    trackLegalMappingsApi,
  );
  const { create, update, remove } = useApiMutation(
    "track-legal-mappings",
    trackLegalMappingsApi,
  );

  const handleSubmit = async (formData: MappingFormData) => {
    if (selectedMapping) {
      await update.mutate({ id: selectedMapping.id, data: formData });
    } else {
      await create.mutate(formData);
    }
    setShowDialog(false);
    setSelectedMapping(null);
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
      accessorKey: "framework.region_name",
      header: "Region",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <div>
            <div>{row.original.framework.region_name}</div>
            <div className="text-sm text-muted-foreground">
              {row.original.framework.region_code}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "compliance_status",
      header: "Status",
      cell: ({ row }) => {
        const statusColors = {
          compliant: "success",
          pending: "warning",
          non_compliant: "destructive",
        };
        const statusLabels = {
          compliant: "Compliant",
          pending: "Pending Review",
          non_compliant: "Non-Compliant",
        };
        return (
          <Badge
            variant={
              statusColors[
                row.original.compliance_status as keyof typeof statusColors
              ]
            }
          >
            {
              statusLabels[
                row.original.compliance_status as keyof typeof statusLabels
              ]
            }
          </Badge>
        );
      },
    },
    {
      accessorKey: "override_restrictions",
      header: "Overrides",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.override_restrictions.map(
            (restriction: string, index: number) => (
              <Badge key={index} variant="outline">
                {restriction}
              </Badge>
            ),
          )}
        </div>
      ),
    },
    {
      accessorKey: "is_active",
      header: "Active",
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? "success" : "secondary"}>
          {row.original.is_active ? "Yes" : "No"}
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
              setSelectedMapping(row.original);
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

  const totalMappings = data?.results.length || 0;
  const compliantMappings =
    data?.results.filter((mapping) => mapping.compliance_status === "compliant")
      .length || 0;
  const nonCompliantMappings =
    data?.results.filter(
      (mapping) => mapping.compliance_status === "non_compliant",
    ).length || 0;

  const statsCards = (
    <>
      <StatsCard title="Total Mappings" value={totalMappings} icon={FileText} />
      <StatsCard
        title="Compliant"
        value={compliantMappings}
        icon={Check}
        valueColor="var(--success)"
      />
      <StatsCard
        title="Non-Compliant"
        value={nonCompliantMappings}
        icon={AlertTriangle}
        valueColor="var(--destructive)"
      />
      <StatsCard
        title="Compliance Rate"
        value={`${totalMappings ? ((compliantMappings / totalMappings) * 100).toFixed(1) : 0}%`}
        icon={Scale}
      />
    </>
  );

  return (
    <DataGridLayout
      title="Track Legal Mappings"
      description="Manage track compliance with regional legal frameworks"
      statsCards={statsCards}
      showDialog={showDialog}
      onDialogChange={setShowDialog}
      dialogTitle={selectedMapping ? "Edit Mapping" : "Create New Mapping"}
      dialogDescription={
        selectedMapping
          ? "Modify the existing legal mapping"
          : "Create a new track-to-framework legal mapping"
      }
      dialogContent={
        <MappingForm
          initialData={selectedMapping}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowDialog(false);
            setSelectedMapping(null);
          }}
        />
      }
    >
      <DataTableView
        columns={columns}
        data={data?.results || []}
        isLoading={isLoading}
        searchPlaceholder="Search mappings..."
      />
    </DataGridLayout>
  );
}
