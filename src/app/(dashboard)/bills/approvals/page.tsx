"use client";

import { useState, useMemo } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useFetch } from "@/hooks/use-fetch";
import { useAuth } from "@/providers/auth-provider";
import { 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  IndianRupee,
  Building2,
  Calendar,
  FileText,
  TrendingUp,
  AlertCircle,
  Search,
  Filter,
  Eye,
  ChevronRight,
  Download,
  User,
  Mail,
  Phone,
  MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ROLE_TO_USER_ID: Record<string, string> = {
  admin: "user-admin",
  department_head: "user-head-1",
  staff: "user-staff-1",
  auditor: "user-admin",
  public: "user-admin",
};

const statusConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-500/10",
    textColor: "text-amber-600",
    borderColor: "border-amber-500/20",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle2,
    color: "from-emerald-500 to-green-600",
    bgColor: "bg-emerald-500/10",
    textColor: "text-emerald-600",
    borderColor: "border-emerald-500/20",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    color: "from-red-500 to-red-600",
    bgColor: "bg-red-500/10",
    textColor: "text-red-600",
    borderColor: "border-red-500/20",
  },
};

export default function BillApprovalsPage() {
  const { user } = useAuth();
  const { data: billsData, isLoading, error, refetch } = useFetch<Array<{
    id: string;
    title: string;
    amount: number;
    status: string;
    departmentName: string | null;
    createdAt: string;
    description?: string;
    vendor?: string;
    invoiceNumber?: string;
  }>>("/api/bills");
  
  const [acting, setActing] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [filterAmount, setFilterAmount] = useState<string>("all");
  
  const bills = billsData ?? [];
  const pending = bills.filter((b) => b.status === "pending");

  // Get unique departments for filter
  const departments = useMemo(() => {
    const depts = new Set(bills.map(b => b.departmentName).filter(Boolean));
    return Array.from(depts);
  }, [bills]);

  // Filter bills
  const filteredBills = useMemo(() => {
    let filtered = pending;
    
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(b => 
        b.id.toLowerCase().includes(searchLower) ||
        b.title.toLowerCase().includes(searchLower) ||
        b.departmentName?.toLowerCase().includes(searchLower)
      );
    }
    
    // Department filter
    if (filterDepartment !== "all") {
      filtered = filtered.filter(b => b.departmentName === filterDepartment);
    }
    
    // Amount filter
    if (filterAmount !== "all") {
      filtered = filtered.filter(b => {
        if (filterAmount === "high") return b.amount >= 50000;
        if (filterAmount === "medium") return b.amount >= 10000 && b.amount < 50000;
        if (filterAmount === "low") return b.amount < 10000;
        return true;
      });
    }
    
    return filtered;
  }, [pending, search, filterDepartment, filterAmount]);

  const stats = useMemo(() => {
    const totalAmount = pending.reduce((sum, b) => sum + b.amount, 0);
    const averageAmount = pending.length > 0 ? totalAmount / pending.length : 0;
    const highValueBills = pending.filter(b => b.amount >= 50000).length;
    const mediumValueBills = pending.filter(b => b.amount >= 10000 && b.amount < 50000).length;
    const lowValueBills = pending.filter(b => b.amount < 10000).length;
    
    return {
      totalPending: pending.length,
      totalAmount,
      averageAmount,
      highValueBills,
      mediumValueBills,
      lowValueBills,
    };
  }, [pending]);

  const approvedBy = user ? (ROLE_TO_USER_ID[user.role] ?? user.id) : "";

  const handleApprove = async (id: string, approved: boolean, reason?: string) => {
    setActionError(null);
    setActing(id);
    try {
      const res = await fetch(`/api/bills/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved, approvedBy, reason }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        refetch();
        setShowDetailsDialog(false);
      } else {
        setActionError(data.error ?? "Failed to update bill.");
      }
    } catch {
      setActionError("Failed to update bill.");
    } finally {
      setActing(null);
    }
  };

  const handleViewDetails = (bill: any) => {
    setSelectedBill(bill);
    setShowDetailsDialog(true);
  };

  const clearFilters = () => {
    setSearch("");
    setFilterDepartment("all");
    setFilterAmount("all");
  };

  const hasActiveFilters = search !== "" || filterDepartment !== "all" || filterAmount !== "all";

  const statCards = [
    {
      label: "Pending Bills",
      value: stats.totalPending,
      icon: Clock,
      gradient: "from-amber-500 to-orange-600",
      bgGradient: "from-amber-500/10 to-orange-600/5",
      iconBg: "bg-amber-500/20",
      description: "Awaiting approval",
    },
    {
      label: "Total Amount",
      value: `₹${stats.totalAmount.toLocaleString("en-IN")}`,
      icon: IndianRupee,
      gradient: "from-blue-500 to-cyan-600",
      bgGradient: "from-blue-500/10 to-cyan-600/5",
      iconBg: "bg-blue-500/20",
      description: "Pending disbursement",
    },
    {
      label: "Average Bill",
      value: `₹${Math.round(stats.averageAmount).toLocaleString("en-IN")}`,
      icon: TrendingUp,
      gradient: "from-violet-500 to-purple-600",
      bgGradient: "from-violet-500/10 to-purple-600/5",
      iconBg: "bg-violet-500/20",
      description: "Per bill average",
    },
    {
      label: "High Value",
      value: stats.highValueBills,
      icon: AlertCircle,
      gradient: "from-red-500 to-red-600",
      bgGradient: "from-red-500/10 to-red-600/5",
      iconBg: "bg-red-500/20",
      description: "Bills ≥ ₹50,000",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8 space-y-8">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-3xl blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-primary to-primary/70 rounded-xl shadow-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                  Bill Approvals
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Review, approve, or reject pending bills and financial requests
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`relative overflow-hidden bg-gradient-to-br ${card.bgGradient} border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}>
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.gradient} opacity-10 rounded-full blur-2xl`} />
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-3 rounded-xl ${card.iconBg} backdrop-blur-sm`}>
                        <Icon className={`h-6 w-6 bg-gradient-to-br ${card.gradient} bg-clip-text text-transparent`} />
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl md:text-3xl font-bold tracking-tight">{card.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
                      <p className="text-xs text-muted-foreground/70 mt-0.5">{card.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-semibold">Filters & Search</h3>
                  </div>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-muted-foreground hover:text-destructive gap-1"
                    >
                      Clear filters
                    </Button>
                  )}
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search by ID, title, or department..."
                      className="pl-9 h-11 bg-white dark:bg-gray-800 border-2 hover:border-primary/50 transition-colors"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>

                  <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                    <SelectTrigger className="w-full sm:w-[180px] h-11 bg-white dark:bg-gray-800 border-2">
                      <Building2 className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept!}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterAmount} onValueChange={setFilterAmount}>
                    <SelectTrigger className="w-full sm:w-[150px] h-11 bg-white dark:bg-gray-800 border-2">
                      <IndianRupee className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Amount" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Amounts</SelectItem>
                      <SelectItem value="high">High (≥ ₹50K)</SelectItem>
                      <SelectItem value="medium">Medium (₹10K-50K)</SelectItem>
                      <SelectItem value="low">Low (&lt; ₹10K)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Active Filters Display */}
                {hasActiveFilters && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {search && (
                      <Badge variant="secondary" className="gap-1">
                        Search: {search}
                      </Badge>
                    )}
                    {filterDepartment !== "all" && (
                      <Badge variant="secondary" className="gap-1">
                        Dept: {filterDepartment}
                      </Badge>
                    )}
                    {filterAmount !== "all" && (
                      <Badge variant="secondary" className="gap-1">
                        Amount: {filterAmount === "high" ? "High" : filterAmount === "medium" ? "Medium" : "Low"}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bills Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold">Pending Approvals</CardTitle>
                  <CardDescription className="mt-1">
                    {filteredBills.length} bill{filteredBills.length !== 1 ? "s" : ""} awaiting your review
                  </CardDescription>
                </div>
                {filteredBills.length > 0 && (
                  <Badge variant="secondary" className="gap-1">
                    <Calendar className="h-3 w-3" />
                    Requires action
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
                  <p className="text-sm text-destructive">Failed to load bills. Please try again.</p>
                </div>
              )}
              
              {actionError && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
                  <p className="text-sm text-destructive">{actionError}</p>
                </div>
              )}
              
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Loading bills...</p>
                </div>
              ) : filteredBills.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4">
                  <div className="p-4 bg-muted/30 rounded-full">
                    <CheckCircle2 className="h-12 w-12 opacity-30" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-medium">No pending bills</p>
                    <p className="text-sm mt-1">All bills have been processed</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableHead className="font-semibold">Bill ID</TableHead>
                        <TableHead className="font-semibold">Title</TableHead>
                        <TableHead className="font-semibold">Department</TableHead>
                        <TableHead className="font-semibold text-right">Amount</TableHead>
                        <TableHead className="font-semibold">Submitted</TableHead>
                        <TableHead className="font-semibold text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {filteredBills.map((row, index) => {
                          const amountCategory = row.amount >= 50000 ? "high" : row.amount >= 10000 ? "medium" : "low";
                          const amountColor = amountCategory === "high" ? "text-red-600" : amountCategory === "medium" ? "text-amber-600" : "text-emerald-600";
                          
                          return (
                            <motion.tr
                              key={row.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="group hover:bg-muted/20 transition-colors duration-200"
                            >
                              <TableCell className="font-mono text-xs font-medium">
                                #{row.id.slice(0, 8)}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 bg-primary/5 rounded-lg group-hover:bg-primary/10 transition-colors">
                                    <FileText className="h-3 w-3 text-primary" />
                                  </div>
                                  <span className="font-medium">{row.title}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Building2 className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-sm">{row.departmentName ?? "—"}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <span className={`font-bold ${amountColor}`}>
                                  ₹{Number(row.amount).toLocaleString("en-IN")}
                                </span>
                              </TableCell>
                              <TableCell className="text-muted-foreground text-sm">
                                {new Date(row.createdAt).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2 justify-center">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleViewDetails(row)}
                                    className="gap-1"
                                  >
                                    <Eye className="h-3 w-3" />
                                    View
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="default"
                                    disabled={acting === row.id}
                                    onClick={() => handleApprove(row.id, true)}
                                    className="gap-1 bg-emerald-600 hover:bg-emerald-700"
                                  >
                                    {acting === row.id && <Loader2 className="h-3 w-3 animate-spin" />}
                                    <CheckCircle2 className="h-3 w-3" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={acting === row.id}
                                    onClick={() => handleApprove(row.id, false)}
                                    className="gap-1 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                  >
                                    <XCircle className="h-3 w-3" />
                                    Reject
                                  </Button>
                                </div>
                              </TableCell>
                            </motion.tr>
                          );
                        })}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Bill Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="sm:max-w-lg border-0 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Bill Details</DialogTitle>
              <DialogDescription>
                Review the complete bill information before making a decision
              </DialogDescription>
            </DialogHeader>
            
            {selectedBill && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Bill ID</p>
                    <p className="font-mono text-sm font-medium">#{selectedBill.id}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge className="gap-1 bg-amber-500/10 text-amber-600 border-0 w-fit">
                      <Clock className="h-3 w-3" />
                      Pending
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Title</p>
                  <p className="font-medium">{selectedBill.title}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Department</p>
                    <div className="flex items-center gap-1">
                      <Building2 className="h-3 w-3 text-muted-foreground" />
                      <span>{selectedBill.departmentName ?? "—"}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Amount</p>
                    <p className="text-xl font-bold text-green-600">
                      ₹{Number(selectedBill.amount).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Submitted Date</p>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span>{new Date(selectedBill.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Vendor</p>
                    <div className="flex items-center gap-1">
                      <Building2 className="h-3 w-3 text-muted-foreground" />
                      <span>{selectedBill.vendor || "—"}</span>
                    </div>
                  </div>
                </div>

                {selectedBill.description && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Description</p>
                    <div className="bg-muted/30 rounded-lg p-3">
                      <p className="text-sm">{selectedBill.description}</p>
                    </div>
                  </div>
                )}

                {selectedBill.invoiceNumber && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Invoice Number</p>
                    <p className="font-mono text-sm">{selectedBill.invoiceNumber}</p>
                  </div>
                )}

                <DialogFooter className="gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowDetailsDialog(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleApprove(selectedBill.id, true)}
                    disabled={acting === selectedBill.id}
                    className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700"
                  >
                    {acting === selectedBill.id && <Loader2 className="h-4 w-4 animate-spin" />}
                    <CheckCircle2 className="h-4 w-4" />
                    Approve Bill
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleApprove(selectedBill.id, false)}
                    disabled={acting === selectedBill.id}
                    className="flex-1 gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject Bill
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}