import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MoreHorizontal, UserX, UserCheck, Eye, Mail, AlertCircle, Users, UserPlus, Shield, Activity, CheckSquare, Trash2, RefreshCw, Filter, Download } from "lucide-react";
import { useProfiles, useUpdateProfileStatus, Profile } from "@/hooks/useProfiles";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format, subDays, isAfter } from "date-fns";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const AdminUserManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isBulkActionDialogOpen, setIsBulkActionDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<"suspend" | "activate" | "delete" | null>(null);

  const { data: users, isLoading, error, refetch } = useProfiles();
  const updateStatus = useUpdateProfileStatus();

  // Get user roles for display
  const { data: userRoles } = useQuery({
    queryKey: ["user-roles-map"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("user_id, role");
      if (error) throw error;
      const roleMap: Record<string, string[]> = {};
      data?.forEach(r => {
        if (!roleMap[r.user_id]) roleMap[r.user_id] = [];
        roleMap[r.user_id].push(r.role);
      });
      return roleMap;
    },
  });

  const filteredUsers = users?.filter((user) => {
    const matchesSearch = 
      (user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const activeUsers = users?.filter(u => u.status === 'active')?.length || 0;
  const suspendedUsers = users?.filter(u => u.status === 'suspended')?.length || 0;
  const newTodayUsers = users?.filter(u => 
    isAfter(new Date(u.created_at), subDays(new Date(), 1))
  )?.length || 0;

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      case "suspended":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status || "Unknown"}</Badge>;
    }
  };

  const getRoleBadges = (userId: string) => {
    const roles = userRoles?.[userId] || [];
    return roles.map(role => (
      <Badge 
        key={role} 
        variant="outline" 
        className={cn(
          "text-xs",
          role === "admin" && "bg-amber-500/10 text-amber-500 border-amber-500/20",
          role === "moderator" && "bg-blue-500/10 text-blue-500 border-blue-500/20"
        )}
      >
        {role}
      </Badge>
    ));
  };

  const handleViewUser = (user: Profile) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
  };

  const handleToggleStatus = (user: Profile) => {
    const newStatus = user.status === "active" ? "suspended" : "active";
    updateStatus.mutate({ id: user.id, status: newStatus });
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedUsers.length === 0) return;
    
    try {
      for (const userId of selectedUsers) {
        if (bulkAction === "suspend") {
          await updateStatus.mutateAsync({ id: userId, status: "suspended" });
        } else if (bulkAction === "activate") {
          await updateStatus.mutateAsync({ id: userId, status: "active" });
        }
      }
      toast.success(`${bulkAction === "suspend" ? "Suspended" : "Activated"} ${selectedUsers.length} users`);
      setSelectedUsers([]);
      setIsBulkActionDialogOpen(false);
    } catch (error) {
      toast.error("Failed to perform bulk action");
    }
  };

  const handleExport = () => {
    if (!users) return;
    const csv = [
      ["Name", "Email", "Phone", "Status", "Joined"].join(","),
      ...users.map(u => [
        u.full_name || "",
        u.email || "",
        u.phone || "",
        u.status || "",
        format(new Date(u.created_at), "yyyy-MM-dd")
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-export-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    toast.success("Users exported to CSV");
  };

  if (error) {
    return (
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        <motion.div variants={item}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/10">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">User Management</h1>
              <p className="text-muted-foreground">Manage and monitor user accounts</p>
            </div>
          </div>
        </motion.div>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <p className="text-lg font-medium">Failed to load users</p>
            <p className="text-muted-foreground">{error.message}</p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">User Management</h1>
              <p className="text-muted-foreground">Manage and monitor user accounts</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-lg font-semibold">{users?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <UserCheck className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-lg font-semibold">{activeUsers}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <UserX className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Suspended</p>
              <p className="text-lg font-semibold">{suspendedUsers}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <UserPlus className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">New Today</p>
              <p className="text-lg font-semibold">{newTodayUsers}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bulk Actions Bar */}
      {selectedUsers.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10"
        >
          <Badge className="bg-primary/20 text-primary">
            {selectedUsers.length} selected
          </Badge>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSelectedUsers([])}
          >
            Clear
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setBulkAction("activate");
              setIsBulkActionDialogOpen(true);
            }}
            className="gap-2 text-green-600 hover:text-green-600"
          >
            <UserCheck className="h-4 w-4" />
            Activate All
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setBulkAction("suspend");
              setIsBulkActionDialogOpen(true);
            }}
            className="gap-2 text-destructive hover:text-destructive"
          >
            <UserX className="h-4 w-4" />
            Suspend All
          </Button>
        </motion.div>
      )}

      {/* User Table */}
      <motion.div variants={item}>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  All Users
                </CardTitle>
                <CardDescription>A list of all registered users on the platform</CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-background/50 border-border/50"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="w-12">
                      <Checkbox 
                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                        onCheckedChange={selectAllUsers}
                      />
                    </TableHead>
                    <TableHead>User</TableHead>
                    <TableHead className="hidden md:table-cell">Roles</TableHead>
                    <TableHead className="hidden md:table-cell">Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Joined</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div>
                              <Skeleton className="h-4 w-24 mb-1" />
                              <Skeleton className="h-3 w-32" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-16" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-28" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                        <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                        <p className="text-muted-foreground">
                          {searchQuery ? "No users match your search" : "No users found"}
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user, index) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className={cn(
                          "group hover:bg-muted/30 transition-colors",
                          selectedUsers.includes(user.id) && "bg-primary/5"
                        )}
                      >
                        <TableCell>
                          <Checkbox 
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={() => toggleUserSelection(user.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-background">
                              <AvatarImage src={user.avatar_url || undefined} />
                              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-blue-500/20">
                                {user.full_name?.split(" ").map(n => n[0]).join("") || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.full_name || "Unnamed User"}</p>
                              <p className="text-sm text-muted-foreground">{user.email || "No email"}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {getRoleBadges(user.id)}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          {user.phone || "—"}
                        </TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground">
                          {format(new Date(user.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => handleViewUser(user)} className="gap-2">
                                <Eye className="h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2">
                                <Mail className="h-4 w-4" />
                                Send Email
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {user.status === "active" ? (
                                <DropdownMenuItem 
                                  className="gap-2 text-destructive focus:text-destructive"
                                  onClick={() => handleToggleStatus(user)}
                                >
                                  <UserX className="h-4 w-4" />
                                  Suspend User
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem 
                                  className="gap-2 text-green-600 focus:text-green-600"
                                  onClick={() => handleToggleStatus(user)}
                                >
                                  <UserCheck className="h-4 w-4" />
                                  Activate User
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* View User Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-md border-0 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              User Details
            </DialogTitle>
            <DialogDescription>Detailed information about the user</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30">
                <Avatar className="h-16 w-16 border-2 border-primary/20">
                  <AvatarImage src={selectedUser.avatar_url || undefined} />
                  <AvatarFallback className="text-lg bg-gradient-to-br from-primary/20 to-blue-500/20">
                    {selectedUser.full_name?.split(" ").map(n => n[0]).join("") || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-lg">{selectedUser.full_name || "Unnamed User"}</p>
                  <p className="text-muted-foreground">{selectedUser.email || "No email"}</p>
                  <div className="flex gap-1 mt-2">
                    {getRoleBadges(selectedUser.id)}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">Phone</p>
                  <p className="font-medium">{selectedUser.phone || "Not provided"}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  {getStatusBadge(selectedUser.status)}
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">Member Since</p>
                  <p className="font-medium">
                    {format(new Date(selectedUser.created_at), "MMM d, yyyy")}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-xs text-muted-foreground mb-1">Last Updated</p>
                  <p className="font-medium">
                    {format(new Date(selectedUser.updated_at), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Action Confirmation Dialog */}
      <Dialog open={isBulkActionDialogOpen} onOpenChange={setIsBulkActionDialogOpen}>
        <DialogContent className="border-0 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {bulkAction === "suspend" ? (
                <UserX className="h-5 w-5 text-destructive" />
              ) : (
                <UserCheck className="h-5 w-5 text-green-500" />
              )}
              Confirm Bulk Action
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to {bulkAction} {selectedUsers.length} users?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant={bulkAction === "suspend" ? "destructive" : "default"}
              onClick={handleBulkAction}
            >
              {bulkAction === "suspend" ? "Suspend All" : "Activate All"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default AdminUserManagement;
