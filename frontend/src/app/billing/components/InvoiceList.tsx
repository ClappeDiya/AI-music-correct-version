"use client";

import { useState, useEffect } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { FileDown, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type InvoiceStatus = "paid" | "pending" | "overdue";

interface Invoice {
  id: string;
  stripe_invoice_id: string;
  amount_cents: number;
  currency: string;
  status: InvoiceStatus;
  created_at: string;
  invoice_data: {
    hosted_invoice_url?: string;
    [key: string]: any;
  };
}

const columns: ColumnDef<Invoice>[] = [
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as InvoiceStatus;
      return (
        <div className="flex items-center gap-2">
          {status === "paid" && (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          )}
          {status === "pending" && (
            <Clock className="h-4 w-4 text-yellow-500" />
          )}
          {status === "overdue" && (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
          <span className="capitalize">{status}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Date",
    cell: ({ row }) => {
      return new Date(
        row.getValue("created_at") as string,
      ).toLocaleDateString();
    },
  },
  {
    accessorKey: "amount_cents",
    header: "Amount",
    cell: ({ row }) => {
      const amount = row.getValue("amount_cents") as number;
      const currency = row.getValue("currency") as string;
      return formatCurrency(amount / 100, currency);
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const invoice = row.original;
      const stripeUrl = invoice.invoice_data?.hosted_invoice_url;

      return (
        <div className="flex items-center gap-2">
          {stripeUrl && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(stripeUrl, "_blank")}
            >
              View Invoice
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => downloadInvoice(invoice)}
          >
            <FileDown className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];

const downloadInvoice = async (invoice: Invoice) => {
  try {
    if (!invoice.invoice_data?.hosted_invoice_url) {
      throw new Error("No invoice URL available");
    }
    const response = await fetch(invoice.invoice_data.hosted_invoice_url);
    if (!response.ok) throw new Error("Failed to download invoice");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${invoice.stripe_invoice_id}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error("Error downloading invoice:", error);
    // TODO: Show error toast
  }
};

export function InvoiceList() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = async (status?: string) => {
    try {
      setLoading(true);
      setError(null);
      const url = new URL("/api/billing/invoices", window.location.origin);
      if (status && status !== "all") {
        url.searchParams.append("status", status);
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch invoices");
      }
      const data = await response.json();
      setInvoices(data.results || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch invoices");
      console.error("Error fetching invoices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const table = useReactTable({
    data: invoices,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  });

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select
          onValueChange={(value: string) => {
            table
              .getColumn("status")
              ?.setFilterValue(value === "all" ? "" : value);
            fetchInvoices(value);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Loading invoices...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No invoices found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
