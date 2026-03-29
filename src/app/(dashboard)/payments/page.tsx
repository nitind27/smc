"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useFetch } from "@/hooks/use-fetch";
import { Loader2 } from "lucide-react";

export default function PaymentsPage() {
  const { data: paymentsData, isLoading, error } = useFetch<Array<{
    id: string;
    billId: string;
    amount: number;
    status: string;
    createdAt: string;
  }>>("/api/payments");
  const payments = paymentsData ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
        <p className="text-muted-foreground">Payment processing and history</p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Payment history</CardTitle>
          <CardDescription>Processed and pending payments</CardDescription>
        </CardHeader>
        <CardContent>
          {error && <p className="text-sm text-destructive mb-4">Failed to load payments.</p>}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Bill</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No payments found.
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono text-xs">{row.id}</TableCell>
                      <TableCell>{row.billId}</TableCell>
                      <TableCell>₹{Number(row.amount).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={row.status === "completed" ? "success" : "pending"}>{row.status}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{row.createdAt.slice(0, 10)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
