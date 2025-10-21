import { useState } from "react";
import { useApiMutation } from "@/lib/hooks/use-api-mutation";
import { LicenseAgreement } from "@/lib/api/types";
import { licenseAgreementsApi } from "@/lib/api/services";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import SignaturePad from "react-signature-canvas";
import {
  FileText,
  Download,
  Check,
  X,
  AlertTriangle,
  Clock,
  FileCheck,
  Pencil,
} from "lucide-react";
import { format } from "date-fns";

interface LicenseAgreementDialogProps {
  trackId: string;
  licenseType: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: (agreement: LicenseAgreement) => void;
}

export function LicenseAgreementDialog({
  trackId,
  licenseType,
  open,
  onOpenChange,
  onComplete,
}: LicenseAgreementDialogProps) {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [signatureMode, setSignatureMode] = useState<"draw" | "type">("type");
  const [typedSignature, setTypedSignature] = useState("");
  const [signaturePad, setSignaturePad] = useState<SignaturePad | null>(null);

  const { mutate: generateAgreement, isLoading: isGenerating } = useApiMutation(
    licenseAgreementsApi.generateAgreement,
    {
      onSuccess: (agreement) => {
        // Handle successful agreement generation
      },
    },
  );

  const { mutate: signAgreement, isLoading: isSigning } = useApiMutation(
    licenseAgreementsApi.signAgreement,
    {
      onSuccess: (agreement) => {
        onComplete?.(agreement);
        onOpenChange(false);
      },
    },
  );

  const handleSign = async () => {
    if (!termsAccepted) return;

    const signatureData =
      signatureMode === "draw" ? signaturePad?.toDataURL() : typedSignature;

    await signAgreement({
      trackId,
      licenseType,
      termsAccepted,
      signatureData,
      signatureMode,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>License Agreement</DialogTitle>
          <DialogDescription>
            Please review and sign the license agreement
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="agreement" className="flex-1">
          <TabsList>
            <TabsTrigger value="agreement">Agreement</TabsTrigger>
            <TabsTrigger value="signature">Signature</TabsTrigger>
          </TabsList>

          <TabsContent value="agreement" className="flex-1">
            <ScrollArea className="h-[60vh]">
              <Card>
                <CardHeader>
                  <CardTitle>License Terms</CardTitle>
                  <CardDescription>
                    Please read the following terms carefully
                  </CardDescription>
                </CardHeader>
                <CardContent className="prose prose-sm">
                  {/* Agreement content will be rendered here */}
                </CardContent>
                <CardFooter className="flex items-center gap-2">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(!!checked)}
                  />
                  <Label htmlFor="terms" className="text-sm">
                    I have read and agree to the terms and conditions
                  </Label>
                </CardFooter>
              </Card>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="signature" className="flex-1">
            <Card>
              <CardHeader>
                <CardTitle>Sign Agreement</CardTitle>
                <CardDescription>
                  Choose how you would like to sign
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Button
                    variant={signatureMode === "type" ? "default" : "outline"}
                    onClick={() => setSignatureMode("type")}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Type Signature
                  </Button>
                  <Button
                    variant={signatureMode === "draw" ? "default" : "outline"}
                    onClick={() => setSignatureMode("draw")}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Draw Signature
                  </Button>
                </div>

                {signatureMode === "type" ? (
                  <div className="space-y-2">
                    <Label htmlFor="signature">Type your full name</Label>
                    <Input
                      id="signature"
                      value={typedSignature}
                      onChange={(e) => setTypedSignature(e.target.value)}
                      placeholder="Your full name"
                    />
                  </div>
                ) : (
                  <div className="border rounded-md p-4">
                    <SignaturePad
                      ref={(ref) => setSignaturePad(ref)}
                      canvasProps={{
                        className: "signature-canvas w-full h-40 border",
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => signaturePad?.clear()}
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
          <Button
            onClick={handleSign}
            disabled={!termsAccepted || isGenerating || isSigning}
          >
            <FileCheck className="mr-2 h-4 w-4" />
            {isGenerating || isSigning ? "Processing..." : "Sign Agreement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function LicenseHistoryView() {
  const { data: history, isLoading } = useApiQuery(
    "license-history",
    licenseAgreementsApi.getLicenseHistory,
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Licenses
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {history?.stats.total_licenses}
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
              {history?.stats.active_licenses}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${history?.stats.total_spent.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Most Licensed Genre
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {history?.stats.most_licensed_genre}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Licenses</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="expired">Expired</TabsTrigger>
        </TabsList>

        {["active", "pending", "expired"].map((status) => (
          <TabsContent key={status} value={status}>
            <Card>
              <CardHeader>
                <CardTitle className="capitalize">{status} Licenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {history?.agreements[
                    status as keyof typeof history.agreements
                  ]?.map((agreement) => (
                    <Card key={agreement.id}>
                      <CardHeader>
                        <CardTitle>{agreement.metadata.track.title}</CardTitle>
                        <CardDescription>
                          License Type: {agreement.license_type}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-2 text-sm">
                          <div className="flex justify-between">
                            <span>Signed Date:</span>
                            <span>
                              {agreement.signed_at
                                ? format(new Date(agreement.signed_at), "PPP")
                                : "Not signed"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Expiry Date:</span>
                            <span>
                              {agreement.expires_at
                                ? format(new Date(agreement.expires_at), "PPP")
                                : "Never"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>License Fee:</span>
                            <span>
                              ${agreement.metadata.license.fee.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                        <Button variant="outline" size="sm">
                          <FileText className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
