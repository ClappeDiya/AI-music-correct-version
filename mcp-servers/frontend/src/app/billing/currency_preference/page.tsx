import { CurrencyPreferenceForm } from "@/app/billing/components/CurrencyPreferenceForm";
import { CurrencyPreferenceList } from "@/app/billing/components/CurrencyPreferenceList";
import { Card, CardHeader, CardTitle, CardContent } from "@/componen../ui/card";

export default function CurrencyPreferencePage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Set Currency Preference</CardTitle>
        </CardHeader>
        <CardContent>
          <CurrencyPreferenceForm
            userId=""
            defaultCurrency="USD"
            onSuccess={() => {}}
            onCancel={() => {}}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Currency Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <CurrencyPreferenceList />
        </CardContent>
      </Card>
    </div>
  );
}
