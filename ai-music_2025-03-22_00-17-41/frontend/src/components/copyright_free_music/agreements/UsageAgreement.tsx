import { useState } from "react";
import { useApiMutation } from "@/lib/hooks/use-api-query";
import { usageAgreementsApi } from "@/lib/api/services";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Label } from "@/components/ui/Label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileCheck, CheckCircle, AlertCircle } from "lucide-react";
import type { Track } from "@/lib/api/types";

interface UsageAgreementProps {
  track: Track;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function UsageAgreement({
  track,
  onSuccess,
  onCancel,
}: UsageAgreementProps) {
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const { create: createAgreement } = useApiMutation(
    "agreements",
    usageAgreementsApi,
    {
      onSuccess,
      successMessage: "Usage agreement accepted successfully",
    },
  );

  const handleAccept = async () => {
    if (!agreedToTerms) return;

    await createAgreement.mutate({
      track: track.id,
      agreement_details: {
        accepted_at: new Date().toISOString(),
        license_version: track.license.id,
        terms_snapshot: track.license.base_conditions,
      },
    });
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCheck className="h-5 w-5" />
          Usage Agreement
        </CardTitle>
        <CardDescription>
          Please review and accept the usage terms for "{track.title}"
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">License Information</h3>
            <p className="text-sm text-muted-foreground">
              {track.license.description}
            </p>
          </div>

          <ScrollArea className="h-48 rounded-md border p-4">
            <div className="space-y-4">
              <section>
                <h4 className="font-semibold mb-2">1. Usage Rights</h4>
                <div className="space-y-2">
                  {Object.entries(track.license.base_conditions || {}).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center gap-2 text-sm"
                      >
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>
                          {key.replace("_", " ")}: {String(value)}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </section>

              <section>
                <h4 className="font-semibold mb-2">
                  2. Attribution Requirements
                </h4>
                <p className="text-sm text-muted-foreground">
                  When using this track, proper attribution must be provided as
                  follows: "{track.title}" by {track.user.username}
                </p>
              </section>

              <section>
                <h4 className="font-semibold mb-2">3. Restrictions</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>You may not claim ownership of the track</li>
                  <li>You may not sublicense the track to third parties</li>
                  <li>
                    Usage must comply with all applicable laws and regulations
                  </li>
                </ul>
              </section>

              <section>
                <h4 className="font-semibold mb-2">4. Term and Termination</h4>
                <p className="text-sm text-muted-foreground">
                  This agreement remains in effect as long as you comply with
                  all terms. Any violation may result in immediate termination
                  of usage rights.
                </p>
              </section>
            </div>
          </ScrollArea>

          <div className="flex items-center gap-2 p-4 bg-yellow-50 rounded-lg">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <p className="text-sm text-yellow-700">
              Please read the agreement carefully before accepting. This is a
              legally binding agreement.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) =>
                setAgreedToTerms(checked as boolean)
              }
            />
            <Label htmlFor="terms" className="text-sm">
              I have read and agree to the usage terms and conditions
            </Label>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={handleAccept}
          disabled={!agreedToTerms || createAgreement.isLoading}
        >
          {createAgreement.isLoading ? (
            "Processing..."
          ) : (
            <>
              <FileCheck className="h-4 w-4 mr-2" />
              Accept Agreement
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
