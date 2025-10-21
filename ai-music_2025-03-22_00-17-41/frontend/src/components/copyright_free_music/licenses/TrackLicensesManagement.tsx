import { useState } from "react";
import { useApiQuery, useApiMutation } from "@/lib/hooks/use-api-query";
import {
  trackLicensesApi,
  tracksApi,
  licenseTermsApi,
} from "@/lib/api/services";
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
import { Badge } from "@/components/ui/Badge";
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
import { DataTableView } from "../data-table/data-table-view";
import {
  Music,
  Plus,
  Edit,
  Trash,
  FileText,
  Calendar,
  DollarSign,
  Check,
} from "lucide-react";
import { format } from "date-fns";

interface TrackLicenseFormData {
  track_id: string;
  license_term_id: string;
  custom_price?: number;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  custom_terms?: string;
}

function TrackLicenseForm({
  initialData,
  onSubmit,
  onCancel,
}: {
  initialData?: any;
  onSubmit: (data: TrackLicenseFormData) => void;
  onCancel: () => void;
}) {
  const { data: tracks } = useApiQuery("tracks", tracksApi);
  const { data: licenseTerms } = useApiQuery("license-terms", licenseTermsApi);

  const [formData, setFormData] = useState<TrackLicenseFormData>(
    initialData || {
      track_id: "",
      license_term_id: "",
      start_date: new Date().toISOString().split("T")[0],
      is_active: true,
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
        <Label htmlFor="track_id">Track</Label>
        <Select
          value={formData.track_id}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, track_id: value }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select track" />
          </SelectTrigger>
          <SelectContent>
            {tracks?.results.map((track) => (
              <SelectItem key={track.id} value={track.id}>
                {track.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="license_term_id">License Terms</Label>
        <Select
          value={formData.license_term_id}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, license_term_id: value }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select license terms" />
          </SelectTrigger>
          <SelectContent>
            {licenseTerms?.results.map((term) => (
              <SelectItem key={term.id} value={term.id}>
                {term.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="custom_price">Custom Price (Optional)</Label>
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          <Input
            id="custom_price"
            type="number"
            min="0"
            step="0.01"
            value={formData.custom_price || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                custom_price: e.target.value
                  ? parseFloat(e.target.value)
                  : undefined,
              }))
            }
            placeholder="Leave empty for default price"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="start_date">Start Date</Label>
          <Input
            id="start_date"
            type="date"
            value={formData.start_date}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, start_date: e.target.value }))
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_date">End Date (Optional)</Label>
          <Input
            id="end_date"
            type="date"
            value={formData.end_date || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                end_date: e.target.value || undefined,
              }))
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="custom_terms">Custom Terms (Optional)</Label>
        <Input
          id="custom_terms"
          value={formData.custom_terms || ""}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              custom_terms: e.target.value || undefined,
            }))
          }
          placeholder="Any custom terms or conditions..."
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={formData.is_active}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, is_active: e.target.checked }))
          }
          className="h-4 w-4"
        />
        <Label>Active License</Label>
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

export function TrackLicensesManagement() {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<any>(null);

  const { data, isLoading } = useApiQuery("track-licenses", trackLicensesApi);
  const { create, update, remove } = useApiMutation(
    "track-licenses",
    trackLicensesApi,
  );

  const handleSubmit = async (formData: TrackLicenseFormData) => {
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
      accessorKey: "license_term.name",
      header: "License",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span>{row.original.license_term.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          <span>
            ${row.original.custom_price || row.original.license_term.price}
            {row.original.custom_price && (
              <Badge variant="secondary" className="ml-2">
                Custom
              </Badge>
            )}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "start_date",
      header: "Duration",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>
            {format(new Date(row.original.start_date), "PP")}
            {row.original.end_date &&
              ` - ${format(new Date(row.original.end_date), "PP")}`}
          </span>
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
            <CardTitle className="text-sm font-medium">Custom Priced</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.results.filter((license) => license.custom_price).length ||
                0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.results.filter((license) => {
                if (!license.end_date) return false;
                const daysUntilExpiry = Math.ceil(
                  (new Date(license.end_date).getTime() -
                    new Date().getTime()) /
                    (1000 * 60 * 60 * 24),
                );
                return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
              }).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Track Licenses</CardTitle>
            <CardDescription>
              Manage licenses assigned to specific tracks
            </CardDescription>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Track License
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {selectedLicense
                    ? "Edit Track License"
                    : "Create New Track License"}
                </DialogTitle>
                <DialogDescription>
                  {selectedLicense
                    ? "Modify the existing track license"
                    : "Assign a license to a track"}
                </DialogDescription>
              </DialogHeader>
              <TrackLicenseForm
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
            searchPlaceholder="Search track licenses..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
