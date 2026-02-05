/**
 * Invite Management Page
 * Admin-only page to manage signup allowlist
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Trash2, RefreshCw, Mail, AlertTriangle, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface AllowlistEntry {
  id: string;
  email: string;
  invited_by: string | null;
  created_at: string;
  used_at: string | null;
}

const InviteManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newEmail, setNewEmail] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Fetch allowlist entries
  const { data: entries = [], isLoading, error, refetch } = useQuery({
    queryKey: ["signup-allowlist"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("signup_allowlist")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as AllowlistEntry[];
    },
  });

  // Add new invite
  const addMutation = useMutation({
    mutationFn: async (email: string) => {
      const normalizedEmail = email.toLowerCase().trim();
      
      const { error } = await supabase
        .from("signup_allowlist")
        .insert({
          email: normalizedEmail,
          invited_by: user?.email || "admin",
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["signup-allowlist"] });
      setNewEmail("");
      setIsAdding(false);
      toast({
        title: "Invite added",
        description: "The email has been added to the allowlist.",
      });
    },
    onError: (error: any) => {
      const message = error.message?.includes("duplicate")
        ? "This email is already on the allowlist."
        : "Failed to add invite.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  // Delete invite
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("signup_allowlist")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["signup-allowlist"] });
      toast({
        title: "Invite removed",
        description: "The email has been removed from the allowlist.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove invite.",
        variant: "destructive",
      });
    },
  });

  // Reset used_at (re-invite)
  const resetMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("signup_allowlist")
        .update({ used_at: null })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["signup-allowlist"] });
      toast({
        title: "Invite reset",
        description: "The user can now sign up again with this email.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reset invite.",
        variant: "destructive",
      });
    },
  });

  const handleAddEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail.trim())) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    addMutation.mutate(newEmail);
  };

  const usedCount = entries.filter((e) => e.used_at).length;
  const pendingCount = entries.length - usedCount;

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error loading allowlist</AlertTitle>
          <AlertDescription>
            {(error as Error).message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Invite Management</h1>
        <p className="text-muted-foreground">
          Manage the signup allowlist. Only emails on this list can create accounts.
        </p>
      </div>

      {/* Warning if empty */}
      {entries.length === 0 && !isLoading && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No invites configured</AlertTitle>
          <AlertDescription>
            The allowlist is empty. All sign-ups are currently blocked. Add at least one email below to allow registrations.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Invites</CardDescription>
            <CardTitle className="text-3xl">{entries.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-3xl text-muted-foreground">{pendingCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Used</CardDescription>
            <CardTitle className="text-3xl text-primary">{usedCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Add New Invite */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Invite
          </CardTitle>
          <CardDescription>
            Add an email to the allowlist to permit signup.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddEmail} className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="email" className="sr-only">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                disabled={addMutation.isPending}
              />
            </div>
            <Button type="submit" disabled={addMutation.isPending || !newEmail.trim()}>
              {addMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Mail className="h-4 w-4 mr-2" />
              )}
              Add to Allowlist
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Allowlist Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Allowlist</CardTitle>
              <CardDescription>
                Emails permitted to create accounts
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No invites yet. Add one above to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Invited By</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.email}</TableCell>
                    <TableCell>
                      {entry.used_at ? (
                        <Badge variant="default" className="bg-primary">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Used
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {entry.invited_by || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(entry.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {entry.used_at && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => resetMutation.mutate(entry.id)}
                            disabled={resetMutation.isPending}
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Reset
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove invite?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove <strong>{entry.email}</strong> from the allowlist.
                                {entry.used_at
                                  ? " The user has already signed up, so this won't affect their existing account."
                                  : " They will no longer be able to sign up."}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMutation.mutate(entry.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteManagement;
