/**
 * Admin Renter Invites Module
 * Manage renter beta waitlist and invites
 */

import { useState } from "react";
import { format, parseISO } from "date-fns";
import {
  Users, Mail, Clock, CheckCircle, Send, Copy, Trash2, Lock,
  Plus, RefreshCw, Loader2, ExternalLink, Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { toast } from "sonner";
import { useRenterBetaSettings, useUpdateRenterBetaSetting } from "@/hooks/useRenterBetaSettings";
import { useAdminWaitlist, useWaitlistStats, type WaitlistEntry } from "@/hooks/useRenterWaitlist";
import {
  useAdminInvites, useCreateRenterInvite, useSendInviteEmail,
  useRevokeInvite, useInviteStats, type RenterInvite
} from "@/hooks/useRenterInvites";

export default function AdminRenterInvitesModule() {
  const { data: betaSettings, isLoading: loadingSettings } = useRenterBetaSettings();
  const updateSetting = useUpdateRenterBetaSetting();
  
  const [waitlistFilter, setWaitlistFilter] = useState<string>("all");
  const { data: waitlist = [], isLoading: loadingWaitlist, refetch: refetchWaitlist } = useAdminWaitlist(waitlistFilter);
  const { data: waitlistStats } = useWaitlistStats();
  
  const [inviteFilter, setInviteFilter] = useState<"all" | "used" | "unused">("all");
  const { data: invites = [], isLoading: loadingInvites, refetch: refetchInvites } = useAdminInvites(inviteFilter);
  const { data: inviteStats } = useInviteStats();
  
  const createInvite = useCreateRenterInvite();
  const sendEmail = useSendInviteEmail();
  const revokeInvite = useRevokeInvite();
  
  // Settings state
  const [betaCityInput, setBetaCityInput] = useState(betaSettings?.betaCity || "");
  const [betaMessageInput, setBetaMessageInput] = useState(betaSettings?.betaMessage || "");
  
  // Manual invite dialog
  const [manualInviteOpen, setManualInviteOpen] = useState(false);
  const [manualEmail, setManualEmail] = useState("");
  const [expiresInDays, setExpiresInDays] = useState<string>("7");

  const handleToggleBetaMode = async (enabled: boolean) => {
    await updateSetting.mutateAsync({ key: "p2p_renter_beta_mode", value: enabled });
  };

  const handleSaveCity = async () => {
    if (betaCityInput !== betaSettings?.betaCity) {
      await updateSetting.mutateAsync({ key: "p2p_renter_beta_city", value: betaCityInput });
    }
  };

  const handleSaveMessage = async () => {
    if (betaMessageInput !== betaSettings?.betaMessage) {
      await updateSetting.mutateAsync({ key: "p2p_renter_beta_message", value: betaMessageInput });
    }
  };

  const handleCreateInvite = async (email: string, waitlistId?: string) => {
    const invite = await createInvite.mutateAsync({
      email,
      expiresInDays: expiresInDays ? parseInt(expiresInDays) : undefined,
      waitlistId,
    });
    return invite;
  };

  const handleSendInviteFromWaitlist = async (entry: WaitlistEntry) => {
    const invite = await handleCreateInvite(entry.email, entry.id);
    await sendEmail.mutateAsync({ inviteId: invite.id });
  };

  const handleCreateManualInvite = async () => {
    if (!manualEmail) return;
    const invite = await handleCreateInvite(manualEmail);
    await sendEmail.mutateAsync({ inviteId: invite.id });
    setManualInviteOpen(false);
    setManualEmail("");
  };

  const copyInviteLink = (code: string) => {
    const link = `${window.location.origin}/verify/driver?invite=${code}`;
    navigator.clipboard.writeText(link);
    toast.success("Invite link copied!");
  };

  const statusBadge = (status: WaitlistEntry["status"]) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      invited: "default",
      joined: "default",
      expired: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Renter Invites</h1>
          <p className="text-muted-foreground">
            Manage beta waitlist and send invites
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => { refetchWaitlist(); refetchInvites(); }}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={manualInviteOpen} onOpenChange={setManualInviteOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Manual Invite
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Manual Invite</DialogTitle>
                <DialogDescription>
                  Send an invite to someone not on the waitlist
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    placeholder="user@example.com"
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Expires In</Label>
                  <Select value={expiresInDays} onValueChange={setExpiresInDays}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 days</SelectItem>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setManualInviteOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateManualInvite}
                  disabled={!manualEmail || createInvite.isPending || sendEmail.isPending}
                >
                  {(createInvite.isPending || sendEmail.isPending) && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Create & Send
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Beta Mode Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Renter Beta Mode
          </CardTitle>
          <CardDescription>
            Control renter access during beta launch
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Invite-Only Mode</Label>
              <p className="text-sm text-muted-foreground">
                When enabled, only invited users can book cars
              </p>
            </div>
            <Switch
              checked={betaSettings?.betaMode ?? true}
              onCheckedChange={handleToggleBetaMode}
              disabled={loadingSettings || updateSetting.isPending}
            />
          </div>
          
          {betaSettings?.betaMode && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label>Beta City</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Los Angeles"
                    value={betaCityInput}
                    onChange={(e) => setBetaCityInput(e.target.value)}
                  />
                  <Button 
                    variant="outline"
                    onClick={handleSaveCity}
                    disabled={updateSetting.isPending}
                  >
                    Save
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Waitlist Message</Label>
                <Textarea
                  placeholder="Custom message for waitlist page..."
                  value={betaMessageInput}
                  onChange={(e) => setBetaMessageInput(e.target.value)}
                  rows={3}
                />
                <Button 
                  variant="outline"
                  onClick={handleSaveMessage}
                  disabled={updateSetting.isPending}
                  className="mt-2"
                >
                  Save Message
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Users className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{waitlistStats?.pending ?? 0}</p>
                <p className="text-sm text-muted-foreground">Waiting</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inviteStats?.total ?? 0}</p>
                <p className="text-sm text-muted-foreground">Invites Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inviteStats?.used ?? 0}</p>
                <p className="text-sm text-muted-foreground">Invites Used</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-500/10">
                <Clock className="w-5 h-5 text-violet-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{waitlistStats?.joined ?? 0}</p>
                <p className="text-sm text-muted-foreground">Beta Renters</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="waitlist">
        <TabsList>
          <TabsTrigger value="waitlist">
            Waitlist ({waitlistStats?.total ?? 0})
          </TabsTrigger>
          <TabsTrigger value="invites">
            Invites ({inviteStats?.total ?? 0})
          </TabsTrigger>
        </TabsList>

        {/* Waitlist Tab */}
        <TabsContent value="waitlist" className="space-y-4">
          <div className="flex items-center gap-2">
            <Select value={waitlistFilter} onValueChange={setWaitlistFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="invited">Invited</SelectItem>
                <SelectItem value="joined">Joined</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingWaitlist ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : waitlist.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No entries found
                    </TableCell>
                  </TableRow>
                ) : (
                  waitlist.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.full_name}</TableCell>
                      <TableCell>{entry.email}</TableCell>
                      <TableCell>{entry.city}</TableCell>
                      <TableCell>
                        {format(parseISO(entry.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>{statusBadge(entry.status)}</TableCell>
                      <TableCell className="text-right">
                        {entry.status === "pending" && (
                          <Button
                            size="sm"
                            onClick={() => handleSendInviteFromWaitlist(entry)}
                            disabled={createInvite.isPending || sendEmail.isPending}
                          >
                            {(createInvite.isPending || sendEmail.isPending) ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Send className="w-4 h-4 mr-1" />
                                Invite
                              </>
                            )}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Invites Tab */}
        <TabsContent value="invites" className="space-y-4">
          <div className="flex items-center gap-2">
            <Select value={inviteFilter} onValueChange={(v) => setInviteFilter(v as typeof inviteFilter)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unused">Unused</SelectItem>
                <SelectItem value="used">Used</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Invite Code</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Used</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingInvites ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : invites.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No invites found
                    </TableCell>
                  </TableRow>
                ) : (
                  invites.map((invite) => (
                    <TableRow key={invite.id}>
                      <TableCell>{invite.email}</TableCell>
                      <TableCell>
                        <code className="bg-muted px-2 py-1 rounded text-sm">
                          {invite.invite_code}
                        </code>
                      </TableCell>
                      <TableCell>
                        {invite.expires_at 
                          ? format(parseISO(invite.expires_at), "MMM d, yyyy")
                          : "Never"
                        }
                      </TableCell>
                      <TableCell>
                        {invite.used ? (
                          <Badge variant="default" className="bg-emerald-500">Yes</Badge>
                        ) : (
                          <Badge variant="secondary">No</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(parseISO(invite.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => copyInviteLink(invite.invite_code)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          {!invite.used && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={() => revokeInvite.mutate({ inviteId: invite.id })}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
