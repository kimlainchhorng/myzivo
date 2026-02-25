/**
 * Global Support Hook - Stub
 */
import { useQuery, useMutation } from "@tanstack/react-query";

export interface CreateTicketInput {
  subject: string;
  description: string;
  category: string;
  service: string;
  service_type?: string;
  priority?: string;
}

export const SUPPORT_CATEGORIES = [
  { value: "general", label: "General", categories: [] as string[] },
  { value: "billing", label: "Billing", categories: [] as string[] },
  { value: "technical", label: "Technical", categories: [] as string[] },
];

export function getCategoryLabel(value: string) {
  return SUPPORT_CATEGORIES.find(c => c.value === value)?.label ?? value;
}

export function useSupportTickets(_statusFilter?: string) {
  return useQuery({ queryKey: ["support-tickets", _statusFilter], queryFn: async () => [] as any[], enabled: false });
}

export function useCreateSupportTicket() {
  return useMutation({ mutationFn: async (_input: CreateTicketInput) => ({} as any) });
}
