import { useState } from "react";
import { useApiQuery, useApiMutation } from "@/lib/hooks/use-api-query";
import { licenseTermsApi } from "@/lib/api/services";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { Switch } from "@/components/ui/Switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { DataTableView } from "../data-table/data-table-view";
import {
  FileText,
  Plus,
  Edit,
  Trash,
  Globe,
  DollarSign,
  AlertCircle,
  Check,
} from "lucide-react";

interface LicenseFormData {
  name: string;
  description: string;
  terms_text: string;
  price: number;
  is_active: boolean;
  allowed_uses: string[];
  restrictions: string[];
  territory_restrictions: string[];
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
      terms_text: "",
      price: 0,
      is_active: true,
      allowed_uses: [],
      restrictions: [],
      territory_restrictions: [],
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
        <Label htmlFor="name">License Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder="e.g., Standard Commercial License"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="Brief description of the license..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="terms_text">Full Terms Text</Label>
        <Textarea
          id="terms_text"
          value={formData.terms_text}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, terms_text: e.target.value }))
          }
          placeholder="Full legal terms text..."
          required
          className="min-h-[200px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Base Price</Label>
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          <Input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                price: parseFloat(e.target.value),
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
        <Label>Active License</Label>
      </div>

      <div className="space-y-2">
        <Label>Allowed Uses</Label>
        <div className="flex flex-wrap gap-2">
          {formData.allowed_uses.map((use, index) => (
            <Badge
              key={index}
              variant="outline"
              className="flex items-center gap-1"
            >
              {use}
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    allowed_uses: prev.allowed_uses.filter(
                      (_, i) => i !== index,
                    ),
                  }))
                }
                className="ml-1"
              >
                ×
              </button>
            </Badge>
          ))}
          <Input
            placeholder="Add allowed use..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const input = e.currentTarget;
                if (input.value) {
                  setFormData((prev) => ({
                    ...prev,
                    allowed_uses: [...prev.allowed_uses, input.value],
                  }));
                  input.value = "";
                }
              }
            }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Restrictions</Label>
        <div className="flex flex-wrap gap-2">
          {formData.restrictions.map((restriction, index) => (
            <Badge
              key={index}
              variant="destructive"
              className="flex items-center gap-1"
            >
              {restriction}
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    restrictions: prev.restrictions.filter(
                      (_, i) => i !== index,
                    ),
                  }))
                }
                className="ml-1"
              >
                ×
              </button>
            </Badge>
          ))}
          <Input
            placeholder="Add restriction..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const input = e.currentTarget;
                if (input.value) {
                  setFormData((prev) => ({
                    ...prev,
                    restrictions: [...prev.restrictions, input.value],
                  }));
                  input.value = "";
                }
              }
            }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Territory Restrictions</Label>
        <div className="flex flex-wrap gap-2">
          {formData.territory_restrictions.map((territory, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {territory}
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    territory_restrictions: prev.territory_restrictions.filter(
                      (_, i) => i !== index,
                    ),
                  }))
                }
                className="ml-1"
              >
                ×
              </button>
            </Badge>
          ))}
          <Input
            placeholder="Add territory restriction..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const input = e.currentTarget;
                if (input.value) {
                  setFormData((prev) => ({
                    ...prev,
                    territory_restrictions: [
                      ...prev.territory_restrictions,
                      input.value,
                    ],
                  }));
                  input.value = "";
                }
              }
            }}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? "Update License" : "Create License"}
        </Button>
      </div>
    </form>
  );
}

export function LicenseTermsManagement() {
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
          <FileText className="h-4 w-4" />
          <span>{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "price",
      header: "Base Price",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
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
    {
      accessorKey: "territory_restrictions",
      header: "Territories",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <div className="flex gap-1">
            {row.original.territory_restrictions.length === 0 ? (
              <Badge variant="outline">Worldwide</Badge>
            ) : (
              row.original.territory_restrictions.map((territory: string) => (
                <Badge key={territory} variant="outline">
                  {territory}
                </Badge>
              ))
            )}
          </div>
        </div>
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
              setSelectedLicense(row.original);
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Licenses
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.results.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Licenses
            </CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.results.filter((license) => license.is_active).length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {data?.results.reduce((sum, license) => sum + license.price, 0) /
                (data?.results.length || 1) || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Restricted Territories
            </CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(
                data?.results.flatMap(
                  (license) => license.territory_restrictions,
                ),
              ).size || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>License Terms</CardTitle>
            <CardDescription>
              Manage your music license terms and conditions
            </CardDescription>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New License
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle>
                  {selectedLicense ? "Edit License" : "Create New License"}
                </DialogTitle>
                <DialogDescription>
                  {selectedLicense
                    ? "Modify the existing license terms"
                    : "Define new license terms for your music"}
                </DialogDescription>
              </DialogHeader>
              <LicenseForm
                initialData={selectedLicense}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowDialog(false);
                  setSelectedLicense(null);
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
            searchPlaceholder="Search licenses..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
