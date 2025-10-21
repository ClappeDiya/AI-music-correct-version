import { Metadata } from "next";
import { SubscriptionDetails } from "../components/SubscriptionDetails";
import { ChargeHistory } from "../components/ChargeHistory";

export const metadata: Metadata = {
  title: "Subscriptions & Charges",
  description: "Manage your subscriptions and view charge history",
};

export default function SubscriptionsPage() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Subscriptions & Charges
        </h2>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <SubscriptionDetails />
        <ChargeHistory />
      </div>
    </div>
  );
}
