"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { useFetch } from "@/hooks/use-fetch";

const statusVariant: Record<string, "pending" | "approved" | "rejected" | "warning"> = {
  pending: "pending",
  approved: "approved",
  rejected: "rejected",
  under_review: "warning",
};

export default function BillsPage() {
  const { data: billsData, isLoading, error } = useFetch<Array<{
    id: string;
    title: string;
    amount: number;
    status: string;
    departmentName: string | null;
    createdAt: string;
  }>>("/api/bills");
  const bills = billsData ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bills & approval</h1>
          <p className="text-muted-foreground">Bill submission and approval workflow</p>
        </div>
        <Button asChild>
          <Link href="/bills/submit">
            <Plus className="mr-2 h-4 w-4" /> Submit bill
          </Link>
        </Button>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Bills</CardTitle>
          <CardDescription>All bills with approval status</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="text-sm text-destructive mb-4">Failed to load bills.</p>
          )}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bills.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No bills found.
                    </TableCell>
                  </TableRow>
                ) : (
                  bills.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono text-xs">{row.id}</TableCell>
                      <TableCell className="font-medium">{row.title}</TableCell>
                      <TableCell>{row.departmentName ?? "—"}</TableCell>
                      <TableCell>₹{Number(row.amount).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[row.status] ?? "secondary"}>{row.status.replace("_", " ")}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{row.createdAt.slice(0, 10)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">View</Button>
                      </TableCell>
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
