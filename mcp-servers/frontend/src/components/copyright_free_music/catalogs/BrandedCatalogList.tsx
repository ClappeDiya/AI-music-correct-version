import { useState } from "react";
import { useApiQuery, useApiMutation } from "@/lib/hooks/use-api-query";
import { brandedCatalogsApi } from "@/lib/api/services";
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
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { DataTableView } from "../data-table/data-table-view";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { Library, Plus, Edit, Trash, Music, Globe, Users } from "lucide-react";

interface CatalogFormData {
  name: string;
  description: string;
  branding_info: {
    logo_url?: string;
    brand_color?: string;
    contact_email?: string;
  };
}

function CatalogForm({
  initialData,
  onSubmit,
  onCancel,
}: {
  initialData?: any;
  onSubmit: (data: CatalogFormData) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<CatalogFormData>(
    initialData || {
      name: "",
      description: "",
      branding_info: {},
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
        <Label htmlFor="name">Catalog Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder="e.g., Premium Collection"
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
          placeholder="Describe your catalog..."
          required
        />
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Branding Information</h4>

        <div className="space-y-2">
          <Label htmlFor="logo_url">Logo URL</Label>
          <Input
            id="logo_url"
            value={formData.branding_info.logo_url}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                branding_info: {
                  ...prev.branding_info,
                  logo_url: e.target.value,
                },
              }))
            }
            placeholder="https://..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="brand_color">Brand Color</Label>
          <Input
            id="brand_color"
            type="color"
            value={formData.branding_info.brand_color}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                branding_info: {
                  ...prev.branding_info,
                  brand_color: e.target.value,
                },
              }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact_email">Contact Email</Label>
          <Input
            id="contact_email"
            type="email"
            value={formData.branding_info.contact_email}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                branding_info: {
                  ...prev.branding_info,
                  contact_email: e.target.value,
                },
              }))
            }
            placeholder="contact@example.com"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? "Update Catalog" : "Create Catalog"}
        </Button>
      </div>
    </form>
  );
}

export function BrandedCatalogList() {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedCatalog, setSelectedCatalog] = useState<any>(null);

  const { data, isLoading } = useApiQuery("catalogs", brandedCatalogsApi);
  const { create, update, remove } = useApiMutation(
    "catalogs",
    brandedCatalogsApi,
  );

  const handleSubmit = async (formData: CatalogFormData) => {
    if (selectedCatalog) {
      await update.mutate({ id: selectedCatalog.id, data: formData });
    } else {
      await create.mutate(formData);
    }
    setShowDialog(false);
    setSelectedCatalog(null);
  };

  const columns = [
    {
      accessorKey: "name",
      header: "Catalog Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Library className="h-4 w-4" />
          <span>{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "track_count",
      header: "Tracks",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Music className="h-4 w-4" />
          <span>{row.original.track_count}</span>
        </div>
      ),
    },
    {
      accessorKey: "regions",
      header: "Regions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <div className="flex gap-1">
            {row.original.regions.map((region: string) => (
              <Badge key={region} variant="outline">
                {region}
              </Badge>
            ))}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "subscriber_count",
      header: "Subscribers",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span>{row.original.subscriber_count}</span>
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
              setSelectedCatalog(row.original);
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
              Total Catalogs
            </CardTitle>
            <Library className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.results.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tracks</CardTitle>
            <Music className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.results.reduce(
                (sum, catalog) => sum + catalog.track_count,
                0,
              ) || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Regions
            </CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(data?.results.flatMap((catalog) => catalog.regions))
                .size || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Subscribers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.results.reduce(
                (sum, catalog) => sum + catalog.subscriber_count,
                0,
              ) || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Branded Catalogs</CardTitle>
            <CardDescription>
              Manage your branded music catalogs and collections
            </CardDescription>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Catalog
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {selectedCatalog ? "Edit Catalog" : "Create New Catalog"}
                </DialogTitle>
                <DialogDescription>
                  {selectedCatalog
                    ? "Modify the existing catalog"
                    : "Create a new branded catalog"}
                </DialogDescription>
              </DialogHeader>
              <CatalogForm
                initialData={selectedCatalog}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowDialog(false);
                  setSelectedCatalog(null);
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
            searchPlaceholder="Search catalogs..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
