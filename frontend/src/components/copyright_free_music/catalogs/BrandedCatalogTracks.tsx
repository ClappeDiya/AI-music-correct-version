import { useState } from "react";
import { useApiQuery, useApiMutation } from "@/lib/hooks/use-api-query";
import { brandedCatalogTracksApi, tracksApi } from "@/lib/api/services";
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
  Trash,
  Play,
  Pause,
  Clock,
  Tag,
  DollarSign,
} from "lucide-react";

interface BrandedCatalogTracksProps {
  catalogId: string;
}

export function BrandedCatalogTracks({ catalogId }: BrandedCatalogTracksProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);

  const { data: catalogTracks, isLoading } = useApiQuery(
    ["catalog-tracks", catalogId],
    brandedCatalogTracksApi,
    { catalog: catalogId },
  );

  const { data: availableTracks } = useApiQuery("tracks", tracksApi);
  const { create, remove } = useApiMutation(
    "catalog-tracks",
    brandedCatalogTracksApi,
  );

  const handleAddTracks = async () => {
    await Promise.all(
      selectedTracks.map((trackId) =>
        create.mutate({
          catalog: catalogId,
          track: trackId,
        }),
      ),
    );
    setShowDialog(false);
    setSelectedTracks([]);
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
      accessorKey: "track.duration",
      header: "Duration",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>{row.original.track.duration}</span>
        </div>
      ),
    },
    {
      accessorKey: "track.genre",
      header: "Genre",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4" />
          <Badge variant="outline">{row.original.track.genre}</Badge>
        </div>
      ),
    },
    {
      accessorKey: "track.pricing.price",
      header: "Price",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          <span>
            {row.original.track.pricing.price}{" "}
            {row.original.track.pricing.currency}
          </span>
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Play className="h-4 w-4" />
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

  const availableTracksColumns = [
    {
      accessorKey: "title",
      header: "Track",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Music className="h-4 w-4" />
          <span>{row.original.title}</span>
        </div>
      ),
    },
    {
      accessorKey: "genre",
      header: "Genre",
      cell: ({ row }) => <Badge variant="outline">{row.original.genre}</Badge>,
    },
    {
      id: "select",
      header: "Select",
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={selectedTracks.includes(row.original.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedTracks((prev) => [...prev, row.original.id]);
            } else {
              setSelectedTracks((prev) =>
                prev.filter((id) => id !== row.original.id),
              );
            }
          }}
          className="h-4 w-4"
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tracks</CardTitle>
            <Music className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {catalogTracks?.results.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Duration
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {/* Calculate total duration */}
              2h 45m
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {/* Calculate total value */}
              $1,234
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Catalog Tracks</CardTitle>
            <CardDescription>
              Manage tracks in this branded catalog
            </CardDescription>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Tracks
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle>Add Tracks to Catalog</DialogTitle>
                <DialogDescription>
                  Select tracks to add to this catalog
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <DataTableView
                  columns={availableTracksColumns}
                  data={availableTracks?.results || []}
                  isLoading={false}
                  searchPlaceholder="Search tracks..."
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddTracks}
                    disabled={selectedTracks.length === 0}
                  >
                    Add Selected ({selectedTracks.length})
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <DataTableView
            columns={columns}
            data={catalogTracks?.results || []}
            isLoading={isLoading}
            searchPlaceholder="Search catalog tracks..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
