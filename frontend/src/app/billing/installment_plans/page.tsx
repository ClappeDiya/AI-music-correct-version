import { InstallmentPlanForm } from "@/app/billing/components/InstallmentPlanForm";
import { Card, CardHeader, CardTitle, CardContent } from "@/componen../ui/card";

export default function InstallmentPlansPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Installment Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <InstallmentPlanForm
            invoiceId=""
            amount={0}
            currency="USD"
            onSuccess={() => {}}
            onCancel={() => {}}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Installment Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">
            Installment plan list coming soon
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
