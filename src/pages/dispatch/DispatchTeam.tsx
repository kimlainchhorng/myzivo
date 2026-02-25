/**
 * Dispatch Team Page
 * Team member management for tenants
 */

import { useState } from "react";
import { useTenantOptional, TenantRole } from "@/contexts/TenantContext";
import { useTenantMembers } from "@/hooks/useTenantMembers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { UserPlus, Search, MoreVertical, Clock, Users, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";

const ROLE_LABELS: Record<TenantRole, string> = {
  owner: "Owner",
  admin: "Admin",
  dispatcher: "Dispatcher",
  support: "Support",
  finance: "Finance",
  merchant_manager: "Merchant Manager",
  viewer: "Viewer",
};

const ROLE_COLORS: Record<TenantRole, string> = {
  owner: "bg-purple-500",
  admin: "bg-blue-500",
  dispatcher: "bg-green-500",
  support: "bg-yellow-500",
  finance: "bg-pink-500",
  merchant_manager: "bg-orange-500",
  viewer: "bg-gray-500",
};

const DispatchTeam = () => {
  const tenant = useTenantOptional();
  const tenantId = tenant?.currentTenant?.id || null;
  const { members, invitations, isLoading, updateRole, deactivateMember, sendInvitation, cancelInvitation } = useTenantMembers(tenantId);
  
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TenantRole>("viewer");

  const canManageUsers = tenant?.hasPermission("tenant.manage_users") ?? false;

  const filteredMembers = members.filter((m) => {
    const matchesSearch = m.email.toLowerCase().includes(search.toLowerCase()) ||
      (m.fullName?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchesRole = roleFilter === "all" || m.role === roleFilter;
    return matchesSearch && matchesRole && m.isActive;
  });

  const handleInvite = () => {
    if (!inviteEmail) return;
    sendInvitation({ email: inviteEmail, role: inviteRole });
    setInviteEmail("");
    setInviteRole("viewer");
    setInviteOpen(false);
  };

  if (!tenant?.currentTenant) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No tenant selected</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Team</h1>
          <p className="text-muted-foreground">Manage your team members and permissions</p>
        </div>
        {canManageUsers && (
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button><UserPlus className="h-4 w-4 mr-2" /> Invite Member</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    placeholder="colleague@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as TenantRole)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(ROLE_LABELS) as TenantRole[]).filter(r => r !== "owner").map((role) => (
                        <SelectItem key={role} value={role}>{ROLE_LABELS[role]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleInvite} className="w-full">Send Invitation</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {(Object.keys(ROLE_LABELS) as TenantRole[]).map((role) => (
              <SelectItem key={role} value={role}>{ROLE_LABELS[role]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Active Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Active Members ({filteredMembers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <p className="text-muted-foreground text-center py-4">Loading...</p>
          ) : filteredMembers.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No members found</p>
          ) : (
            filteredMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={member.avatarUrl || undefined} />
                    <AvatarFallback>{(member.fullName || member.email).slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{member.fullName || member.email}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={`${ROLE_COLORS[member.role]} text-white`}>
                    {ROLE_LABELS[member.role]}
                  </Badge>
                  {canManageUsers && member.role !== "owner" && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {(Object.keys(ROLE_LABELS) as TenantRole[]).filter(r => r !== "owner" && r !== member.role).map((role) => (
                          <DropdownMenuItem key={role} onClick={() => updateRole({ memberId: member.id, role })}>
                            Change to {ROLE_LABELS[role]}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuItem onClick={() => deactivateMember(member.id)} className="text-destructive">
                          Deactivate
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Invitations ({invitations.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {invitations.map((invite) => (
              <div key={invite.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:border-primary/20 hover:shadow-sm transition-all duration-200">
                <div>
                  <p className="font-medium">{invite.email}</p>
                  <p className="text-sm text-muted-foreground">
                    Expires {formatDistanceToNow(new Date(invite.expiresAt), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{ROLE_LABELS[invite.role]}</Badge>
                  {canManageUsers && (
                    <Button variant="ghost" size="icon" onClick={() => cancelInvitation(invite.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DispatchTeam;
