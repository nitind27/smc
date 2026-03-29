import { api } from "./client";
import type { Complaint } from "@/types";

export const complaintsApi = {
  list: (params?: { status?: string; departmentId?: string }) => {
    const search = new URLSearchParams(params as Record<string, string>).toString();
    return api.get<Complaint[]>(`/complaints${search ? `?${search}` : ""}`);
  },
  get: (id: string) => api.get<Complaint>(`/complaints/${id}`),
  create: (data: Omit<Complaint, "id" | "createdAt" | "updatedAt">) =>
    api.post<Complaint>("/complaints", data),
  update: (id: string, data: Partial<Complaint>) =>
    api.put<Complaint>(`/complaints/${id}`, data),
};
