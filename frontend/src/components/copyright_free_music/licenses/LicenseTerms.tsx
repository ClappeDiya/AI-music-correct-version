import { useState } from "react";
import { useApiQuery, useApiMutation } from "@/lib/hooks/use-api-query";
import { licenseTermsApi } from "@/lib/api/services";
import { DataTableView } from "../data-table/data-table-view";
import { StatsCard } from "../shared/stats-card";
import { DataGridLayout } from "../shared/data-grid-layout";
import { FormLayout } from "../shared/form-layout";
import {
  InputField,
  TextAreaField,
  CheckboxField,
  TagInput,
} from "../shared/form-fields";
import { Badge } from "@/components/ui/Badge";
import { FileText, Check, AlertTriangle, Scroll, Scale } from "lucide-react";

interface LicenseFormData {
  name: string;
  description: string;
  terms: string[];
  restrictions: string[];
  price: number;
  is_active: boolean;
}

function LicenseForm({
  initialData,
  onSubmit,
  onCancel,
}: {
  initialData?: any;
  onSubmit: (data: LicenseFormData) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<LicenseFormData>(
    initialData || {
      name: "",
      description: "",
      terms: [],
      restrictions: [],
      price: 0,
      is_active: true,
    },
  );

  return (
    <FormLayout
      onSubmit={() => onSubmit(formData)}
      onCancel={onCancel}
      submitLabel={initialData ? "Update License" : "Create License"}
    >
      <InputField
        label="License Name"
        value={formData.name}
        onChange={(value) => setFormData((prev) => ({ ...prev, name: value }))}
        placeholder="Enter license name"
        required
      />

      <TextAreaField
        label="Description"
        value={formData.description}
        onChange={(value) =>
          setFormData((prev) => ({ ...prev, description: value }))
        }
        placeholder="Describe the license terms..."
        required
      />

      <div className="grid gap-4 md:grid-cols-2">
        <TagInput
          label="License Terms"
          value={formData.terms}
          onChange={(value) =>
            setFormData((prev) => ({
              ...prev,
              terms: value,
            }))
          }
          placeholder="Add license term..."
        />

        <TagInput
          label="Restrictions"
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

      <InputField
        label="Price"
        type="number"
        value={formData.price}
        onChange={(value) =>
          setFormData((prev) => ({
            ...prev,
            price: parseFloat(value),
          }))
        }
        required
      />

      <CheckboxField
        label="Active License"
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

export function LicenseTerms() {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<any>(null);

  const { data, isLoading } = useApiQuery("license-terms", licenseTermsApi);
  const { create, update, remove } = useApiMutation(
    "license-terms",
    licenseTermsApi,
  );

  const handleSubmit = async (formData: LicenseFormData) => {
    if (selectedLicense) {
      await update.mutate({ id: selectedLicense.id, data: formData });
    } else {
      await create.mutate(formData);
    }
    setShowDialog(false);
    setSelectedLicense(null);
  };

  const columns = [
    {
      accessorKey: "name",
      header: "License Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Scroll className="h-4 w-4" />
          <span>{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "terms",
      header: "Terms & Restrictions",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-2">
          {row.original.terms.map((term: string, index: number) => (
            <Badge key={`term-${index}`} variant="outline">
              {term}
            </Badge>
          ))}
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
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Scale className="h-4 w-4" />
          <span>${row.original.price}</span>
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

  const activeLicenses =
    data?.results.filter((license) => license.is_active).length || 0;
  const paidLicenses =
    data?.results.filter((license) => license.price > 0).length || 0;
  const freeLicenses =
    data?.results.filter((license) => license.price === 0).length || 0;

  const statsCards = (
    <>
      <StatsCard
        title="Total Licenses"
        value={data?.results.length || 0}
        icon={FileText}
      />
      <StatsCard
        title="Active Licenses"
        value={activeLicenses}
        icon={Check}
        valueColor="var(--success)"
      />
      <StatsCard title="Paid Licenses" value={paidLicenses} icon={Scale} />
      <StatsCard
        title="Free Licenses"
        value={freeLicenses}
        icon={AlertTriangle}
        valueColor={freeLicenses === 0 ? "var(--warning)" : undefined}
      />
    </>
  );

  return (
    <DataGridLayout
      title="License Terms"
      description="Manage license terms and conditions"
      statsCards={statsCards}
      showDialog={showDialog}
      onDialogChange={setShowDialog}
      dialogTitle={selectedLicense ? "Edit License" : "Create New License"}
      dialogDescription={
        selectedLicense
          ? "Modify the existing license terms"
          : "Define a new license with terms and restrictions"
      }
      dialogContent={
        <LicenseForm
          initialData={selectedLicense}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowDialog(false);
            setSelectedLicense(null);
          }}
        />
      }
    >
      <DataTableView
        columns={columns}
        data={data?.results || []}
        isLoading={isLoading}
        searchPlaceholder="Search licenses..."
      />
    </DataGridLayout>
  );
}
