import { Metadata } from "next";
import { InvoiceList } from "../components/InvoiceList";

export const metadata: Metadata = {
  title: "Invoices",
  description: "View and manage your billing invoices",
};

export default function InvoicesPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
      </div>
      <InvoiceList />
    </div>
  );
}
