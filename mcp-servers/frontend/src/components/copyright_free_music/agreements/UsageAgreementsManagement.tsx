import { useState } from "react";
import { useApiQuery, useApiMutation } from "@/lib/hooks/use-api-query";
import { usageAgreementsApi, tracksApi } from "@/lib/api/services";
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
  FileText,
  Plus,
  Edit,
  Trash,
  Music,
  Calendar,
  Globe,
  User,
  Check,
} from "lucide-react";
import { format } from "date-fns";

interface AgreementFormData {
  track_id: string;
  user_id: string;
  usage_type: string;
  territory: string;
  start_date: string;
  end_date?: string;
  terms: string;
  restrictions: string[];
  is_active: boolean;
}

function AgreementForm({
  initialData,
  onSubmit,
  onCancel,
}: {
  initialData?: any;
  onSubmit: (data: AgreementFormData) => void;
  onCancel: () => void;
}) {
  const { data: tracks } = useApiQuery("tracks", tracksApi);

  const [formData, setFormData] = useState<AgreementFormData>(
    initialData || {
      track_id: "",
      user_id: "",
      usage_type: "",
      territory: "",
      start_date: new Date().toISOString().split("T")[0],
      terms: "",
      restrictions: [],
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
        <Label htmlFor="usage_type">Usage Type</Label>
        <Select
          value={formData.usage_type}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, usage_type: value }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select usage type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="commercial">Commercial</SelectItem>
            <SelectItem value="broadcast">Broadcast</SelectItem>
            <SelectItem value="streaming">Streaming</SelectItem>
            <SelectItem value="sync">Synchronization</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="territory">Territory</Label>
        <Select
          value={formData.territory}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, territory: value }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select territory" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="worldwide">Worldwide</SelectItem>
            <SelectItem value="na">North America</SelectItem>
            <SelectItem value="eu">Europe</SelectItem>
            <SelectItem value="asia">Asia</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
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
        <Label htmlFor="terms">Terms</Label>
        <Textarea
          id="terms"
          value={formData.terms}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, terms: e.target.value }))
          }
          placeholder="Enter agreement terms..."
          required
          className="min-h-[100px]"
        />
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

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={formData.is_active}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, is_active: e.target.checked }))
          }
          className="h-4 w-4"
        />
        <Label>Active Agreement</Label>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? "Update Agreement" : "Create Agreement"}
        </Button>
      </div>
    </form>
  );
}

export function UsageAgreementsManagement() {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedAgreement, setSelectedAgreement] = useState<any>(null);

  const { data, isLoading } = useApiQuery(
    "usage-agreements",
    usageAgreementsApi,
  );
  const { create, update, remove } = useApiMutation(
    "usage-agreements",
    usageAgreementsApi,
  );

  const handleSubmit = async (formData: AgreementFormData) => {
    if (selectedAgreement) {
      await update.mutate({ id: selectedAgreement.id, data: formData });
    } else {
      await create.mutate(formData);
    }
    setShowDialog(false);
    setSelectedAgreement(null);
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
      accessorKey: "user.name",
      header: "User",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span>{row.original.user.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "usage_type",
      header: "Usage Type",
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.usage_type}</Badge>
      ),
    },
    {
      accessorKey: "territory",
      header: "Territory",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <span>{row.original.territory}</span>
        </div>
      ),
    },
    {
      accessorKey: "duration",
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
              setSelectedAgreement(row.original);
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
              Total Agreements
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
              Active Agreements
            </CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.results.filter((agreement) => agreement.is_active)
                .length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usage Types</CardTitle>
            <Music className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(data?.results.map((agreement) => agreement.usage_type))
                .size || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Territories</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(data?.results.map((agreement) => agreement.territory))
                .size || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Usage Agreements</CardTitle>
            <CardDescription>
              Manage music usage agreements and terms
            </CardDescription>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Agreement
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle>
                  {selectedAgreement
                    ? "Edit Agreement"
                    : "Create New Agreement"}
                </DialogTitle>
                <DialogDescription>
                  {selectedAgreement
                    ? "Modify the existing usage agreement"
                    : "Create a new usage agreement for a track"}
                </DialogDescription>
              </DialogHeader>
              <AgreementForm
                initialData={selectedAgreement}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowDialog(false);
                  setSelectedAgreement(null);
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
            searchPlaceholder="Search agreements..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
