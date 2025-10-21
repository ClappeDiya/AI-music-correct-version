import { useState } from "react";
import { BarChart2, Download, Info, RefreshCw, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/useToast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { lyricModelVersionApi } from "@/services/lyrics-generation-api";
import type { LyricModelVersion } from "@/types/LyricsGeneration";

export function ModelVersionManager() {
  const [versions, setVersions] = useState<LyricModelVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] =
    useState<LyricModelVersion | null>(null);
  const { toast } = useToast();

  const loadVersions = async () => {
    try {
      setLoading(true);
      const data = await lyricModelVersionApi.getAll();
      setVersions(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load model versions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <p>Loading model versions...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Model Versions</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadVersions}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import Version
          </Button>
        </div>
      </div>

      <Card>
        <ScrollArea className="h-[500px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Version</TableHead>
                <TableHead>Prompt</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {versions.map((version) => (
                <TableRow key={version.id}>
                  <TableCell className="font-medium">
                    {version.model_version}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {version.prompt}
                  </TableCell>
                  <TableCell>
                    {new Date(version.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">Active</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedVersion(version)}
                      >
                        <Info className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <BarChart2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>

      <Dialog
        open={!!selectedVersion}
        onOpenChange={() => setSelectedVersion(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Model Version Details</DialogTitle>
          </DialogHeader>
          {selectedVersion && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Version</h4>
                <p>{selectedVersion.model_version}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Prompt</h4>
                <p>{selectedVersion.prompt}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Embeddings</h4>
                <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[200px]">
                  {JSON.stringify(selectedVersion.embeddings, null, 2)}
                </pre>
              </div>
              <div>
                <h4 className="font-medium mb-2">Created</h4>
                <p>{new Date(selectedVersion.created_at).toLocaleString()}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
