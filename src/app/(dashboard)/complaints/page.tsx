"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Filter,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  TrendingUp,
  Calendar,
  User,
  Tag,
  ArrowUpRight,
  X,
  Eye,
  MessageSquare,
  BarChart3,
  LayoutGrid,
  List,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useFetch } from "@/hooks/use-fetch";

const statusConfig = {
  submitted: {
    label: "Submitted",
    icon: Clock,
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-500/10",
    textColor: "text-blue-600",
    borderColor: "border-blue-500/20",
  },
  assigned: {
    label: "Assigned",
    icon: User,
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-500/10",
    textColor: "text-purple-600",
    borderColor: "border-purple-500/20",
  },
  in_progress: {
    label: "In Progress",
    icon: TrendingUp,
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-500/10",
    textColor: "text-amber-600",
    borderColor: "border-amber-500/20",
  },
  resolved: {
    label: "Resolved",
    icon: CheckCircle2,
    color: "from-emerald-500 to-green-600",
    bgColor: "bg-emerald-500/10",
    textColor: "text-emerald-600",
    borderColor: "border-emerald-500/20",
  },
  closed: {
    label: "Closed",
    icon: FileText,
    color: "from-gray-500 to-gray-600",
    bgColor: "bg-gray-500/10",
    textColor: "text-gray-600",
    borderColor: "border-gray-500/20",
  },
  rejected: {
    label: "Rejected",
    icon: AlertCircle,
    color: "from-red-500 to-red-600",
    bgColor: "bg-red-500/10",
    textColor: "text-red-600",
    borderColor: "border-red-500/20",
  },
};

const priorityConfig = {
  high: {
    label: "High",
    icon: AlertCircle,
    color: "from-red-500 to-red-600",
    bgColor: "bg-red-500/10",
    textColor: "text-red-600",
  },
  urgent: {
    label: "Urgent",
    icon: AlertCircle,
    color: "from-red-600 to-red-700",
    bgColor: "bg-red-600/10",
    textColor: "text-red-600",
  },
  medium: {
    label: "Medium",
    icon: Clock,
    color: "from-amber-500 to-amber-600",
    bgColor: "bg-amber-500/10",
    textColor: "text-amber-600",
  },
  low: {
    label: "Low",
    icon: CheckCircle2,
    color: "from-emerald-500 to-emerald-600",
    bgColor: "bg-emerald-500/10",
    textColor: "text-emerald-600",
  },
};

export default function ComplaintsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const {
    data: complaintsData,
    isLoading,
    error,
  } = useFetch<
    Array<{
      id: string;
      title: string;
      category: string;
      status: string;
      priority: string;
      createdAt: string;
      description?: string;
    }>
  >("/api/complaints");

  const complaints = complaintsData ?? [];

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return complaints.filter((c) => {
      const matchSearch =
        !query ||
        c.title.toLowerCase().includes(query) ||
        c.id.toLowerCase().includes(query);
      const matchStatus = statusFilter === "all" || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [complaints, search, statusFilter]);

  const stats = useMemo(() => {
    const total = complaints.length;
    const resolved = complaints.filter(c => c.status === "resolved").length;
    const pending = complaints.filter(c => ["submitted", "assigned", "in_progress"].includes(c.status)).length;
    const resolutionRate = total > 0 ? ((resolved / total) * 100).toFixed(0) : 0;
    const avgResponseTime = "2.3 days";
    
    return { total, resolved, pending, resolutionRate, avgResponseTime };
  }, [complaints]);

  const dateStr = (s: string) => s.slice(0, 10);

  const formatStatusLabel = (status: string) => {
    const withSpaces = status.replace(/_/g, " ");
    return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1).toLowerCase();
  };

  const getStatusConfig = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.submitted;
  };

  const getPriorityConfig = (priority: string) => {
    const key = priority.toLowerCase() as keyof typeof priorityConfig;
    return priorityConfig[key] || priorityConfig.medium;
  };

  const statCards = [
    {
      label: "Total Complaints",
      value: stats.total,
      icon: MessageSquare,
      gradient: "from-blue-500 to-cyan-600",
      bgGradient: "from-blue-500/10 to-cyan-600/5",
      iconBg: "bg-blue-500/20",
      change: "+12%",
      trend: "up",
    },
    {
      label: "Resolved",
      value: stats.resolved,
      icon: CheckCircle2,
      gradient: "from-emerald-500 to-green-600",
      bgGradient: "from-emerald-500/10 to-green-600/5",
      iconBg: "bg-emerald-500/20",
      change: "+8%",
      trend: "up",
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: Clock,
      gradient: "from-amber-500 to-orange-600",
      bgGradient: "from-amber-500/10 to-orange-600/5",
      iconBg: "bg-amber-500/20",
      change: "-5%",
      trend: "down",
    },
    {
      label: "Resolution Rate",
      value: `${stats.resolutionRate}%`,
      icon: BarChart3,
      gradient: "from-violet-500 to-purple-600",
      bgGradient: "from-violet-500/10 to-purple-600/5",
      iconBg: "bg-violet-500/20",
      change: "+3%",
      trend: "up",
    },
  ];

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setSelectedStatus(null);
  };

  const hasActiveFilters = search !== "" || statusFilter !== "all";

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
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-primary to-primary/70 rounded-xl shadow-lg">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                    Complaints Management
                  </h1>
                  <p className="text-muted-foreground text-sm mt-1">
                    Track, manage, and resolve citizen complaints efficiently
                  </p>
                </div>
              </div>
            </div>
            <Button 
              asChild
              className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Link href="/complaints/submit">
                <Plus className="h-4 w-4" />
                Submit Complaint
              </Link>
            </Button>
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
                      <Badge variant="outline" className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                        {card.trend === "up" ? "↑" : "↓"} {card.change}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-2xl md:text-3xl font-bold tracking-tight">{card.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Filters and Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-semibold">Filters & Search</h3>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === "table" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("table")}
                      className="gap-1"
                    >
                      <List className="h-4 w-4" />
                      Table
                    </Button>
                    <Button
                      variant={viewMode === "grid" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className="gap-1"
                    >
                      <LayoutGrid className="h-4 w-4" />
                      Grid
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search by ID, title, or description..."
                      className="pl-9 h-11 bg-white dark:bg-gray-800 border-2 hover:border-primary/50 transition-colors"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[200px] h-11 bg-white dark:bg-gray-800 border-2">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      {Object.entries(statusConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <config.icon className="h-3 w-3" />
                            {config.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-muted-foreground hover:text-destructive gap-1"
                    >
                      <X className="h-3 w-3" />
                      Clear filters
                    </Button>
                  )}
                </div>

                {/* Active Filters Display */}
                {hasActiveFilters && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {search && (
                      <Badge variant="secondary" className="gap-1">
                        Search: {search}
                        <X 
                          className="h-3 w-3 cursor-pointer hover:text-destructive" 
                          onClick={() => setSearch("")}
                        />
                      </Badge>
                    )}
                    {statusFilter !== "all" && (
                      <Badge variant="secondary" className="gap-1">
                        Status: {statusConfig[statusFilter as keyof typeof statusConfig]?.label}
                        <X 
                          className="h-3 w-3 cursor-pointer hover:text-destructive" 
                          onClick={() => setStatusFilter("all")}
                        />
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Complaints List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold">All Complaints</CardTitle>
                  <CardDescription className="mt-1">
                    {filtered.length} complaint{filtered.length !== 1 ? "s" : ""} found
                  </CardDescription>
                </div>
                {filtered.length > 0 && (
                  <Badge variant="secondary" className="gap-1">
                    <Calendar className="h-3 w-3" />
                    Latest updates
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
                  <p className="text-sm text-destructive">Failed to load complaints. Please try again.</p>
                </div>
              )}
              
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Loading complaints...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4">
                  <div className="p-4 bg-muted/30 rounded-full">
                    <MessageSquare className="h-12 w-12 opacity-30" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-medium">No complaints found</p>
                    <p className="text-sm mt-1">Try adjusting your filters or submit a new complaint</p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="gap-2 mt-2"
                    asChild
                  >
                    <Link href="/complaints/submit">
                      <Plus className="h-4 w-4" /> Submit First Complaint
                    </Link>
                  </Button>
                </div>
              ) : viewMode === "table" ? (
                <div className="overflow-x-auto rounded-xl">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableHead className="font-semibold">ID</TableHead>
                        <TableHead className="font-semibold">Title</TableHead>
                        <TableHead className="font-semibold">Category</TableHead>
                        <TableHead className="font-semibold">Priority</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Date</TableHead>
                        <TableHead className="w-[80px] font-semibold">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {filtered.map((row, index) => {
                          const StatusIcon = getStatusConfig(row.status).icon;
                          const PriorityIcon = getPriorityConfig(row.priority).icon;
                          const statusConfig_ = getStatusConfig(row.status);
                          const priorityConfig_ = getPriorityConfig(row.priority);
                          
                          return (
                            <motion.tr
                              key={row.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.03 }}
                              className="group hover:bg-muted/20 transition-colors duration-200"
                            >
                              <TableCell className="font-mono text-xs font-medium">
                                #{row.id.slice(0, 8)}
                              </TableCell>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 bg-primary/5 rounded-lg group-hover:bg-primary/10 transition-colors">
                                    <FileText className="h-3 w-3 text-primary" />
                                  </div>
                                  <span>{row.title}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Tag className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-sm">{row.category}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={`gap-1 ${priorityConfig_.bgColor} ${priorityConfig_.textColor} border-0`}
                                >
                                  <PriorityIcon className="h-3 w-3" />
                                  {priorityConfig_.label}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={`gap-1 ${statusConfig_.bgColor} ${statusConfig_.textColor} border-0`}
                                >
                                  <StatusIcon className="h-3 w-3" />
                                  {statusConfig_.label}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground text-sm">
                                {dateStr(row.createdAt)}
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm" asChild className="gap-1 group">
                                  <Link href={`/complaints/${row.id}`}>
                                    <Eye className="h-3 w-3 group-hover:scale-110 transition-transform" />
                                    View
                                  </Link>
                                </Button>
                              </TableCell>
                            </motion.tr>
                          );
                        })}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <AnimatePresence>
                    {filtered.map((row, index) => {
                      const StatusIcon = getStatusConfig(row.status).icon;
                      const PriorityIcon = getPriorityConfig(row.priority).icon;
                      const statusConfig_ = getStatusConfig(row.status);
                      const priorityConfig_ = getPriorityConfig(row.priority);
                      
                      return (
                        <motion.div
                          key={row.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Link href={`/complaints/${row.id}`}>
                            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
                              <CardContent className="p-5">
                                <div className="flex items-start justify-between mb-3">
                                  <Badge
                                    className={`gap-1 ${priorityConfig_.bgColor} ${priorityConfig_.textColor} border-0`}
                                  >
                                    <PriorityIcon className="h-3 w-3" />
                                    {priorityConfig_.label}
                                  </Badge>
                                  <Badge
                                    className={`gap-1 ${statusConfig_.bgColor} ${statusConfig_.textColor} border-0`}
                                  >
                                    <StatusIcon className="h-3 w-3" />
                                    {statusConfig_.label}
                                  </Badge>
                                </div>
                                
                                <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                                  {row.title}
                                </h3>
                                
                                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                  {row.description || "No description provided"}
                                </p>
                                
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Tag className="h-3 w-3" />
                                    {row.category}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {dateStr(row.createdAt)}
                                  </div>
                                </div>
                                
                                <div className="mt-3 flex items-center justify-between">
                                  <span className="font-mono text-xs text-muted-foreground">
                                    #{row.id.slice(0, 8)}
                                  </span>
                                  <ArrowUpRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}