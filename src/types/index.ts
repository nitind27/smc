export type UserRole =
  | "admin"
  | "department_head"
  | "staff"
  | "auditor"
  | "public"
  | "po"          // Post Office / Ward Officer
  | "collector"   // District Collector
  | "dc";         // Deputy Commissioner

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId?: string;
  avatar?: string;
}

export type ComplaintStatus =
  | "submitted"
  | "assigned"
  | "in_progress"
  | "forwarded"
  | "resolved"
  | "closed"
  | "rejected";

export type ApprovalStatus = "pending" | "approved" | "rejected" | "under_review";

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  status: ComplaintStatus;
  priority: "low" | "medium" | "high" | "urgent";
  submittedBy: string;
  assignedTo?: string;
  departmentId?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
  location?: string;
  attachments?: string[];
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "review" | "done";
  priority: "low" | "medium" | "high";
  assigneeId?: string;
  dueDate?: string;
  projectId?: string;
}

export interface Meeting {
  id: string;
  title: string;
  agenda: string;
  date: string;
  time: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  participants: string[];
  departmentId?: string;
}

export interface Bill {
  id: string;
  title: string;
  amount: number;
  status: ApprovalStatus;
  submittedBy: string;
  approvedBy?: string;
  departmentId?: string;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  headId?: string;
  staffCount: number;
}
