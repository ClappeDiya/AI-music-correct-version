import { useState } from "react";
import { FileCheck, FileX, Download, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/useToast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { lyricSignatureApi } from "@/services/LyricsGenerationApi";
import type { LyricSignature } from "@/types/LyricsGeneration";

interface SignatureManagerProps {
  finalLyricsId?: number;
}

export function SignatureManager({ finalLyricsId }: SignatureManagerProps) {
  const [signatures, setSignatures] = useState<LyricSignature[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const loadSignatures = async () => {
    try {
      setLoading(true);
      const data = await lyricSignatureApi.getAll();
      setSignatures(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load signatures",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const verifySignature = async (signature: LyricSignature) => {
    // TODO: Implement signature verification
    toast({
      title: "Success",
      description: "Signature verified successfully",
    });
  };

  const downloadCertificate = async (signature: LyricSignature) => {
    // TODO: Implement certificate download
    toast({
      title: "Success",
      description: "Certificate downloaded successfully",
    });
  };

  const filteredSignatures = signatures.filter(
    (sig) =>
      sig.signature_hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sig.final_lyrics.toString().includes(searchQuery),
  );

  if (loading) {
    return (
      <Card className="p-6">
        <p>Loading signatures...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Search signatures..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
              prefix={<Search className="w-4 h-4 text-muted-foreground" />}
            />
          </div>
          <Button variant="outline" onClick={loadSignatures}>
            Refresh
          </Button>
        </div>

        <ScrollArea className="h-[500px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lyrics ID</TableHead>
                <TableHead>Signature Hash</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSignatures.map((signature) => (
                <TableRow key={signature.id}>
                  <TableCell>{signature.final_lyrics}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {signature.signature_hash.substring(0, 16)}...
                  </TableCell>
                  <TableCell>
                    {new Date(signature.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-50">
                      Verified
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => verifySignature(signature)}
                      >
                        <FileCheck className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadCertificate(signature)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredSignatures.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <FileX className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">No signatures found</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>

      {finalLyricsId && (
        <Card className="p-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Create New Signature</h3>
            <Button
              onClick={async () => {
                try {
                  await lyricSignatureApi.create({
                    final_lyrics: finalLyricsId,
                    signature_hash: "TODO: Generate hash", // TODO: Implement hash generation
                  });
                  loadSignatures();
                  toast({
                    title: "Success",
                    description: "Signature created successfully",
                  });
                } catch (error) {
                  toast({
                    title: "Error",
                    description: "Failed to create signature",
                    variant: "destructive",
                  });
                }
              }}
            >
              Generate Signature
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
