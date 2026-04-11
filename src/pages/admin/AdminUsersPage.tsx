/**
 * Admin Users Management Page
 * View, search, and manage all registered users
 */
import { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users, Search, Mail, Calendar, Shield, ChevronLeft, ChevronRight,
  UserCheck, UserX, Eye, BadgeCheck, ShieldCheck
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { format } from "date-fns";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import { toast } from "sonner";

const PAGE_SIZE = 20;

export default function AdminUsersPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Verify / Unverify mutation
  const verifyMutation = useMutation({
    mutationFn: async ({ userId, verified }: { userId: string; verified: boolean }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ is_verified: verified })
        .eq("id", userId);
      if (error) throw error;
    },
    onSuccess: (_, { verified }) => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(verified ? "Account verified ✓" : "Verification removed");
      if (selectedUser) {
        setSelectedUser({ ...selectedUser, is_verified: verified });
      }
    },
    onError: (err: any) => toast.error(err.message || "Failed to update verification"),
  });

  // Fetch all profiles
  const { data: profiles, isLoading } = useQuery({
    queryKey: ["admin-users", isAdmin],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1000);
      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin && !authLoading,
  });

  // Fetch user roles
  const { data: userRoles } = useQuery({
    queryKey: ["admin-user-roles", isAdmin],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("user_id, role");
      if (error) throw error;
      return data || [];
    },
    enabled: isAdmin && !authLoading,
  });

  // Fetch driver emails to exclude driver accounts (from zivodriver.com)
  const { data: driverEmails } = useQuery({
    queryKey: ["admin-driver-emails"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("drivers")
        .select("email, user_id");
      if (error) throw error;
      const emailSet = new Set<string>();
      const idSet = new Set<string>();
      (data || []).forEach((d) => {
        if (d.email) emailSet.add(d.email.toLowerCase());
        if (d.user_id) idSet.add(d.user_id);
      });
      return { emails: emailSet, ids: idSet };
    },
    enabled: isAdmin,
  });

  const roleMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    userRoles?.forEach((r) => {
      if (!map[r.user_id]) map[r.user_id] = [];
      map[r.user_id].push(r.role);
    });
    return map;
  }, [userRoles]);

  // Filter to hizivo.com customers only: exclude driver signups AND staff roles
  const customerProfiles = useMemo(() => {
    if (!profiles) return [];
    const excludedRoles = ["admin", "moderator", "super_admin", "operations", "finance", "support", "merchant", "owner", "manager"];
    return profiles.filter((p) => {
      // Exclude users with a driver record (by email or user_id)
      if (driverEmails?.ids.has(p.user_id)) return false;
      if (p.email && driverEmails?.emails.has(p.email.toLowerCase())) return false;
      // Exclude staff roles
      const roles = roleMap[p.user_id] || [];
      return !roles.some((r) => excludedRoles.includes(r));
    });
  }, [profiles, roleMap, driverEmails]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return customerProfiles;
    const q = searchQuery.toLowerCase();
    return customerProfiles.filter(
      (p) =>
        (p.full_name || "").toLowerCase().includes(q) ||
        (p.email || "").toLowerCase().includes(q) ||
        (p.phone || "").toLowerCase().includes(q) ||
        (p.user_id || "").toLowerCase().includes(q)
    );
  }, [customerProfiles, searchQuery]);

  const totalPages = Math.ceil((filtered?.length || 0) / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // Stats
  const stats = useMemo(() => {
    if (!customerProfiles.length) return { total: 0, verified: 0, setupComplete: 0 };
    return {
      total: customerProfiles.length,
      verified: customerProfiles.filter((p) => p.email_verified).length,
      setupComplete: customerProfiles.filter((p) => p.setup_complete).length,
    };
  }, [customerProfiles]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <h1 className="text-xl font-bold text-foreground mb-2">Access Denied</h1>
            <p className="text-muted-foreground">This page is restricted to administrators.</p>
            <Button onClick={() => navigate("/")} className="mt-4">Go Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <AdminLayout title="Customer Management">
      <div className="space-y-6 max-w-7xl">
        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.verified}</p>
                <p className="text-xs text-muted-foreground">Verified</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <UserX className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total - stats.setupComplete}</p>
                <p className="text-xs text-muted-foreground">Incomplete Setup</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, phone, or user ID..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
            className="pl-10 h-11 rounded-xl"
          />
        </div>

        {/* Users table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : paginated.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                {searchQuery ? "No users match your search." : "No users found."}
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">User</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Roles</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Joined</th>
                        <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.map((user) => (
                        <tr key={user.user_id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                                {(user.full_name || user.email || "?").charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1">
                                  <p className="font-medium text-foreground truncate">{user.full_name || "—"}</p>
                                  {user.is_verified && (
                                    <BadgeCheck className="w-4 h-4 text-primary shrink-0" />
                                  )}
                                </div>
                                {user.phone && <p className="text-xs text-muted-foreground">{user.phone}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground truncate max-w-[200px]">{user.email || "—"}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1.5 flex-wrap">
                              {user.email_verified ? (
                                <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-0">Verified</Badge>
                              ) : (
                                <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-500 border-0">Unverified</Badge>
                              )}
                              {user.setup_complete && (
                                <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-0">Setup Done</Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1 flex-wrap">
                              {(roleMap[user.user_id] || []).map((role) => (
                                <Badge key={role} variant="secondary" className="text-[10px] bg-violet-500/10 text-violet-500 border-0">
                                  <Shield className="w-2.5 h-2.5 mr-0.5" />{role}
                                </Badge>
                              ))}
                              {!(roleMap[user.user_id]?.length) && (
                                <span className="text-xs text-muted-foreground">user</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                            {user.created_at ? format(new Date(user.created_at), "MMM d, yyyy") : "—"}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedUser(user)}
                              className="text-xs"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1" /> View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden divide-y divide-border">
                  {paginated.map((user) => (
                    <button
                      key={user.user_id}
                      onClick={() => setSelectedUser(user)}
                      className="w-full text-left px-4 py-3 hover:bg-muted/20 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                          {(user.full_name || user.email || "?").charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm truncate">{user.full_name || "No Name"}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email || "—"}</p>
                          <div className="flex gap-1 mt-1">
                            {user.email_verified ? (
                              <Badge variant="secondary" className="text-[9px] bg-emerald-500/10 text-emerald-500 border-0 px-1.5 py-0">Verified</Badge>
                            ) : (
                              <Badge variant="secondary" className="text-[9px] bg-amber-500/10 text-amber-500 border-0 px-1.5 py-0">Unverified</Badge>
                            )}
                            {(roleMap[user.user_id] || []).map((role) => (
                              <Badge key={role} variant="secondary" className="text-[9px] bg-violet-500/10 text-violet-500 border-0 px-1.5 py-0">{role}</Badge>
                            ))}
                          </div>
                        </div>
                        <Eye className="w-4 h-4 text-muted-foreground shrink-0" />
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
                </p>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={page === 0}
                    onClick={() => setPage(page - 1)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage(page + 1)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User detail dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {(selectedUser?.full_name || selectedUser?.email || "?").charAt(0).toUpperCase()}
              </div>
              {selectedUser?.full_name || "User Details"}
            </DialogTitle>
            <DialogDescription>User profile information</DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <DetailItem label="Email" value={selectedUser.email} />
                <DetailItem label="Phone" value={selectedUser.phone} />
                <DetailItem label="User ID" value={selectedUser.user_id} mono />
                <DetailItem label="Joined" value={selectedUser.created_at ? format(new Date(selectedUser.created_at), "MMM d, yyyy h:mm a") : "—"} />
                <DetailItem label="Email Verified" value={selectedUser.email_verified ? "Yes" : "No"} />
                <DetailItem label="Setup Complete" value={selectedUser.setup_complete ? "Yes" : "No"} />
                <DetailItem label="Country" value={selectedUser.country || "—"} />
                <DetailItem label="City" value={selectedUser.city || "—"} />
              </div>

              {/* Roles */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Roles</p>
                <div className="flex gap-1.5 flex-wrap">
                  {(roleMap[selectedUser.user_id] || []).length > 0 ? (
                    roleMap[selectedUser.user_id].map((role: string) => (
                      <Badge key={role} className="bg-violet-500/10 text-violet-500 border-0">
                        <Shield className="w-3 h-3 mr-1" />{role}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">Regular user (no special roles)</span>
                  )}
                </div>
              </div>

              {/* Verify action */}
              <div className="pt-2 border-t border-border">
                <p className="text-xs font-medium text-muted-foreground mb-2">Account Verification</p>
                <Button
                  variant={selectedUser.is_verified ? "outline" : "default"}
                  size="sm"
                  className="gap-2"
                  disabled={verifyMutation.isPending}
                  onClick={() => verifyMutation.mutate({ userId: selectedUser.id || selectedUser.user_id, verified: !selectedUser.is_verified })}
                >
                  {selectedUser.is_verified ? (
                    <>
                      <ShieldCheck className="w-4 h-4 text-primary" />
                      Verified — Remove Badge
                    </>
                  ) : (
                    <>
                      <BadgeCheck className="w-4 h-4" />
                      Verify Account
                    </>
                  )}
                </Button>
                {selectedUser.is_verified && (
                  <p className="text-[10px] text-muted-foreground mt-1.5">This account has been verified by an admin.</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

function DetailItem({ label, value, mono }: { label: string; value?: string | null; mono?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className={cn("text-sm text-foreground truncate", mono && "font-mono text-xs")}>{value || "—"}</p>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
