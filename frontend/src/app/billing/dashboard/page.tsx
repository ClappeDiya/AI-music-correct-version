import { Metadata } from "next";
import { BillingDashboard } from "@/app/billing/components/BillingDashboard";

export const metadata: Metadata = {
  title: "Billing Dashboard",
  description: "View your billing summary and manage payments",
};

export default function BillingDashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Billing Dashboard</h2>
      </div>
      <BillingDashboard />
    </div>
  );
}
