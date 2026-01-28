import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Shield, ShieldCheck, ShieldAlert, UserCog, Plus, Trash2, Crown, Users, Car, Store, Check, X, Lock, History } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import AdminRoleAuditTrail from "./AdminRoleAuditTrail";

type AppRole = 'admin' | 'moderator' | 'user';

interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
  profile?: {
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  };
}

const roleConfig = {
  admin: { icon: Crown, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", label: "Admin" },
  moderator: { icon: ShieldCheck, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", label: "Moderator" },
  user: { icon: Users, color: "text-slate-500", bg: "bg-slate-500/10", border: "border-slate-500/20", label: "User" },
};

// Permission matrix
const permissions = {
  admin: {
    users: { view: true, create: true, edit: true, delete: true },
    drivers: { view: true, create: true, edit: true, delete: true, verify: true },
    trips: { view: true, create: true, edit: true, delete: true, assign: true },
    pricing: { view: true, create: true, edit: true, delete: true },
    reports: { view: true, export: true },
    settings: { view: true, edit: true },
    roles: { view: true, assign: true, remove: true },
  },
  moderator: {
    users: { view: true, create: false, edit: true, delete: false },
    drivers: { view: true, create: false, edit: true, delete: false, verify: true },
    trips: { view: true, create: false, edit: true, delete: false, assign: true },
    pricing: { view: true, create: false, edit: false, delete: false },
    reports: { view: true, export: true },
    settings: { view: true, edit: false },
    roles: { view: true, assign: false, remove: false },
  },
  user: {
    users: { view: false, create: false, edit: false, delete: false },
    drivers: { view: false, create: false, edit: false, delete: false, verify: false },
    trips: { view: false, create: false, edit: false, delete: false, assign: false },
    pricing: { view: false, create: false, edit: false, delete: false },
    reports: { view: false, export: false },
    settings: { view: false, edit: false },
    roles: { view: false, assign: false, remove: false },
  },
};

const AdminRoleManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState<AppRole>("moderator");
  const [activeTab, setActiveTab] = useState("roles");
  const queryClient = useQueryClient();

  const { data: userRoles, isLoading } = useQuery({
    queryKey: ["admin-user-roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select(`
          *,
          profile:profiles!user_roles_user_id_fkey(full_name, email, avatar_url)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as unknown as UserRole[];
    },
  });

  const { data: allProfiles } = useQuery({
    queryKey: ["all-profiles-for-roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url")
        .order("full_name");
      
      if (error) throw error;
      return data;
    },
  });

  const { data: driversCount } = useQuery({
    queryKey: ["drivers-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("drivers")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: restaurantsCount } = useQuery({
    queryKey: ["restaurants-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("restaurants")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const addRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user-roles"] });
      toast.success("Role assigned successfully");
      setIsAddDialogOpen(false);
      setSelectedUserId("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to assign role");
    },
  });

  const removeRoleMutation = useMutation({
    mutationFn: async (roleId: string) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("id", roleId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user-roles"] });
      toast.success("Role removed successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to remove role");
    },
  });

  const filteredRoles = userRoles?.filter(
    (role) =>
      role.profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.profile?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.role.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const adminCount = userRoles?.filter(r => r.role === 'admin').length || 0;
  const moderatorCount = userRoles?.filter(r => r.role === 'moderator').length || 0;

  const RoleBadge = ({ role }: { role: AppRole }) => {
    const config = roleConfig[role];
    const Icon = config.icon;
    return (
      <Badge className={cn("gap-1.5", config.bg, config.color, config.border)}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const PermissionCell = ({ allowed }: { allowed: boolean }) => (
    <div className={cn(
      "w-6 h-6 rounded-full flex items-center justify-center",
      allowed ? "bg-green-500/10" : "bg-red-500/10"
    )}>
      {allowed ? (
        <Check className="h-3.5 w-3.5 text-green-500" />
      ) : (
        <X className="h-3.5 w-3.5 text-red-500" />
      )}
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10">
          <Shield className="h-6 w-6 text-amber-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Role Management</h1>
          <p className="text-muted-foreground">Assign and manage user roles and permissions</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Crown className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Admins</p>
              <p className="text-lg font-semibold">{adminCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <ShieldCheck className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Moderators</p>
              <p className="text-lg font-semibold">{moderatorCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Car className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Drivers</p>
              <p className="text-lg font-semibold">{driversCount || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-500/10">
              <Store className="h-5 w-5 text-rose-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Partners</p>
              <p className="text-lg font-semibold">{restaurantsCount || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-card/50">
          <TabsTrigger value="roles" className="gap-2">
            <UserCog className="h-4 w-4" />
            User Roles
          </TabsTrigger>
          <TabsTrigger value="permissions" className="gap-2">
            <Lock className="h-4 w-4" />
            Permissions
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2">
            <History className="h-4 w-4" />
            Audit Trail
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles">
          {/* Role Table */}
          <Card className="border-0 bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <UserCog className="h-5 w-5 text-primary" />
                    User Roles
                  </CardTitle>
                  <CardDescription>Manage role assignments for all users</CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search roles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 bg-background/50 border-border/50"
                    />
                  </div>
                  <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Assign Role
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="hidden md:table-cell">Assigned</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      [...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Skeleton className="h-10 w-10 rounded-full" />
                              <div>
                                <Skeleton className="h-4 w-24 mb-1" />
                                <Skeleton className="h-3 w-32" />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                          <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                        </TableRow>
                      ))
                    ) : filteredRoles.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-12">
                          <Shield className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                          <p className="text-muted-foreground">No roles assigned yet</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRoles.map((role) => (
                        <TableRow key={role.id} className="group hover:bg-muted/30 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 border-2 border-background">
                                <AvatarImage src={role.profile?.avatar_url || undefined} />
                                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-amber-500/20">
                                  {role.profile?.full_name?.split(" ").map(n => n[0]).join("") || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{role.profile?.full_name || "Unknown User"}</p>
                                <p className="text-sm text-muted-foreground">{role.profile?.email || "No email"}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <RoleBadge role={role.role} />
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground">
                            {new Date(role.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeRoleMutation.mutate(role.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions">
          <Card className="border-0 bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Permission Matrix
              </CardTitle>
              <CardDescription>View permissions for each role</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="w-full">
                <div className="rounded-xl border border-border/50 overflow-hidden min-w-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableHead className="w-40">Resource</TableHead>
                        <TableHead className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Crown className="h-4 w-4 text-amber-500" />
                            Admin
                          </div>
                        </TableHead>
                        <TableHead className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-blue-500" />
                            Moderator
                          </div>
                        </TableHead>
                        <TableHead className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Users className="h-4 w-4 text-slate-500" />
                            User
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(permissions.admin).map(([resource, perms]) => (
                        <TableRow key={resource}>
                          <TableCell className="font-medium capitalize">{resource}</TableCell>
                          <TableCell>
                            <div className="flex justify-center gap-1">
                              {Object.entries(perms).map(([action, allowed]) => (
                                <div key={action} className="group relative">
                                  <PermissionCell allowed={allowed} />
                                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs bg-popover text-popover-foreground rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                    {action}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-center gap-1">
                              {Object.entries(permissions.moderator[resource as keyof typeof permissions.moderator] || {}).map(([action, allowed]) => (
                                <div key={action} className="group relative">
                                  <PermissionCell allowed={allowed as boolean} />
                                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs bg-popover text-popover-foreground rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                    {action}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-center gap-1">
                              {Object.entries(permissions.user[resource as keyof typeof permissions.user] || {}).map(([action, allowed]) => (
                                <div key={action} className="group relative">
                                  <PermissionCell allowed={allowed as boolean} />
                                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs bg-popover text-popover-foreground rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                    {action}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <AdminRoleAuditTrail />
        </TabsContent>
      </Tabs>

      {/* Add Role Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="border-0 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-primary" />
              Assign Role
            </DialogTitle>
            <DialogDescription>Select a user and assign them a role</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">User</label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {allProfiles?.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.full_name || profile.email || "Unknown"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as AppRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <span className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-amber-500" />
                      Admin
                    </span>
                  </SelectItem>
                  <SelectItem value="moderator">
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-blue-500" />
                      Moderator
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Role Description */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
              <p className="font-medium mb-2">
                {selectedRole === "admin" ? "Admin Permissions" : "Moderator Permissions"}
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {selectedRole === "admin" ? (
                  <>
                    <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-500" /> Full access to all features</li>
                    <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-500" /> Manage users and roles</li>
                    <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-500" /> Configure system settings</li>
                    <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-500" /> Access all reports and analytics</li>
                  </>
                ) : (
                  <>
                    <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-500" /> View and edit users</li>
                    <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-500" /> Verify drivers and documents</li>
                    <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-500" /> Monitor and assign trips</li>
                    <li className="flex items-center gap-2"><X className="h-3 w-3 text-red-500" /> Cannot manage roles or settings</li>
                  </>
                )}
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => addRoleMutation.mutate({ userId: selectedUserId, role: selectedRole })}
              disabled={!selectedUserId || addRoleMutation.isPending}
            >
              Assign Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRoleManagement;
