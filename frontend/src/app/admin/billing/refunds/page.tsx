import { Metadata } from "next";
import { RefundManagement } from "@/app/admin/components/RefundManagement";

export const metadata: Metadata = {
  title: "Refund Management",
  description: "Process refunds and manage billing adjustments",
};

export default function RefundsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Refund Management</h2>
      </div>
      <RefundManagement />
    </div>
  );
}
