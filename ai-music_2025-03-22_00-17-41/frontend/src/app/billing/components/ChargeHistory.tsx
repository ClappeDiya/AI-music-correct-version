"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { formatCurrency } from "@/lib/utils";
import { Tag, Receipt } from "lucide-react";

interface Charge {
  id: string;
  stripe_charge_id: string;
  amount_cents: number;
  currency: string;
  charge_data: {
    receipt_url?: string;
    payment_method_details?: {
      type: string;
      card?: {
        brand: string;
        last4: string;
      };
    };
    metadata?: {
      promo_code?: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
  created_at: string;
}

export function ChargeHistory() {
  const [charges, setCharges] = useState<Charge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCharges();
  }, []);

  const fetchCharges = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/billing/charges");
      if (!response.ok) {
        throw new Error("Failed to fetch charges");
      }
      const data = await response.json();
      setCharges(data.results || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch charges");
      console.error("Error fetching charges:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading charge history...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription className="text-red-500">{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Charge History</CardTitle>
        <CardDescription>
          View your recent charges and payment details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {charges.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No charges found
                </TableCell>
              </TableRow>
            ) : (
              charges.map((charge) => (
                <TableRow key={charge.id}>
                  <TableCell>
                    {new Date(charge.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(charge.amount_cents / 100, charge.currency)}
                  </TableCell>
                  <TableCell>
                    {charge.charge_data.payment_method_details?.card && (
                      <span className="flex items-center gap-1">
                        {charge.charge_data.payment_method_details.card.brand}{" "}
                        ••••{" "}
                        {charge.charge_data.payment_method_details.card.last4}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {charge.charge_data.metadata?.promo_code && (
                        <div className="flex items-center gap-1 text-sm text-green-600">
                          <Tag className="h-4 w-4" />
                          {charge.charge_data.metadata.promo_code}
                        </div>
                      )}
                      {charge.charge_data.receipt_url && (
                        <a
                          href={charge.charge_data.receipt_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Receipt className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
