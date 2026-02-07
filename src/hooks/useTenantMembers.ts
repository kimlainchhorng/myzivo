/**
 * Tenant Members Hook
 * CRUD operations for team members
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TenantRole } from "@/contexts/TenantContext";

export interface TenantMember {
  id: string;
  userId: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: TenantRole;
  isActive: boolean;
  acceptedAt: string | null;
  createdAt: string;
}

export interface TenantInvitation {
  id: string;
  email: string;
  role: TenantRole;
  expiresAt: string;
  createdAt: string;
}

export function useTenantMembers(tenantId: string | null) {
  const queryClient = useQueryClient();

  // Fetch members
  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ["tenant-members", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from("tenant_memberships")
        .select(`
          id,
          user_id,
          role,
          is_active,
          accepted_at,
          created_at,
          profiles:user_id (
            email,
            full_name,
            avatar_url
          )
        `)
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map((m: any) => ({
        id: m.id,
        userId: m.user_id,
        email: m.profiles?.email || "Unknown",
        fullName: m.profiles?.full_name,
        avatarUrl: m.profiles?.avatar_url,
        role: m.role as TenantRole,
        isActive: m.is_active,
        acceptedAt: m.accepted_at,
        createdAt: m.created_at,
      }));
    },
    enabled: !!tenantId,
  });

  // Fetch pending invitations
  const { data: invitations = [], isLoading: invitationsLoading } = useQuery({
    queryKey: ["tenant-invitations", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from("tenant_invitations")
        .select("*")
        .eq("tenant_id", tenantId)
        .is("accepted_at", null)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map((i: any) => ({
        id: i.id,
        email: i.email,
        role: i.role as TenantRole,
        expiresAt: i.expires_at,
        createdAt: i.created_at,
      }));
    },
    enabled: !!tenantId,
  });

  // Update member role
  const updateRole = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: TenantRole }) => {
      const { error } = await supabase
        .from("tenant_memberships")
        .update({ role, updated_at: new Date().toISOString() })
        .eq("id", memberId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-members", tenantId] });
      toast.success("Role updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update role: " + error.message);
    },
  });

  // Deactivate member
  const deactivateMember = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from("tenant_memberships")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq("id", memberId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-members", tenantId] });
      toast.success("Member deactivated");
    },
    onError: (error) => {
      toast.error("Failed to deactivate member: " + error.message);
    },
  });

  // Send invitation
  const sendInvitation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: TenantRole }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("tenant_invitations")
        .insert({
          tenant_id: tenantId,
          email,
          role,
          invited_by: user?.id,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-invitations", tenantId] });
      toast.success("Invitation sent successfully");
    },
    onError: (error) => {
      toast.error("Failed to send invitation: " + error.message);
    },
  });

  // Cancel invitation
  const cancelInvitation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from("tenant_invitations")
        .delete()
        .eq("id", invitationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-invitations", tenantId] });
      toast.success("Invitation cancelled");
    },
    onError: (error) => {
      toast.error("Failed to cancel invitation: " + error.message);
    },
  });

  return {
    members,
    invitations,
    isLoading: membersLoading || invitationsLoading,
    updateRole: updateRole.mutate,
    deactivateMember: deactivateMember.mutate,
    sendInvitation: sendInvitation.mutate,
    cancelInvitation: cancelInvitation.mutate,
    isUpdating: updateRole.isPending || deactivateMember.isPending || sendInvitation.isPending,
  };
}
