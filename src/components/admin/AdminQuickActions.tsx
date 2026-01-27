import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Zap,
  Send,
  Bell,
  DollarSign,
  UserPlus,
  Shield,
  AlertTriangle,
  Megaphone,
  Settings,
  Download,
  RefreshCw,
  Ban,
  CheckCircle
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  action: () => void;
  requiresConfirm?: boolean;
}

const AdminQuickActions = () => {
  const queryClient = useQueryClient();
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    content: "",
    type: "info",
    target_audience: "all"
  });

  const createAnnouncement = useMutation({
    mutationFn: async (data: typeof announcementForm) => {
      const { error } = await supabase.from("announcements").insert({
        ...data,
        is_active: true
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Announcement created successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
      setActiveDialog(null);
      setAnnouncementForm({ title: "", content: "", type: "info", target_audience: "all" });
    },
    onError: (error) => {
      toast.error("Failed to create announcement");
    }
  });

  const processAllPayouts = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("payouts")
        .update({ status: "processing" })
        .eq("status", "pending");
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("All pending payouts are now processing");
      queryClient.invalidateQueries({ queryKey: ["admin-payouts"] });
      setActiveDialog(null);
    }
  });

  const quickActions: QuickAction[] = [
    {
      id: "announcement",
      label: "Send Announcement",
      description: "Broadcast to all users",
      icon: Megaphone,
      color: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
      action: () => setActiveDialog("announcement")
    },
    {
      id: "payouts",
      label: "Process Payouts",
      description: "Approve all pending",
      icon: DollarSign,
      color: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
      action: () => setActiveDialog("payouts"),
      requiresConfirm: true
    },
    {
      id: "maintenance",
      label: "Toggle Maintenance",
      description: "Enable/disable mode",
      icon: Settings,
      color: "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20",
      action: () => toast.info("Maintenance mode toggle coming soon")
    },
    {
      id: "cache",
      label: "Clear Cache",
      description: "Refresh all data",
      icon: RefreshCw,
      color: "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20",
      action: () => {
        queryClient.invalidateQueries();
        toast.success("Cache cleared successfully");
      }
    },
    {
      id: "export",
      label: "Export Data",
      description: "Download reports",
      icon: Download,
      color: "bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20",
      action: () => toast.info("Export functionality coming soon")
    },
    {
      id: "security",
      label: "Security Audit",
      description: "Run security check",
      icon: Shield,
      color: "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20",
      action: () => toast.info("Security audit coming soon")
    }
  ];

  return (
    <>
      <Card className="border-0 bg-card/50 backdrop-blur-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <CardTitle>Quick Actions</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                className={`h-auto p-4 flex flex-col items-center gap-2 ${action.color} border-0`}
                onClick={action.action}
              >
                <action.icon className="h-5 w-5" />
                <div className="text-center">
                  <p className="text-xs font-medium">{action.label}</p>
                  <p className="text-[10px] text-muted-foreground">{action.description}</p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Announcement Dialog */}
      <Dialog open={activeDialog === "announcement"} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="border-0 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-blue-500" />
              Create Announcement
            </DialogTitle>
            <DialogDescription>
              Send a broadcast message to platform users
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={announcementForm.title}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                placeholder="Announcement title"
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Message</Label>
              <Textarea
                id="content"
                value={announcementForm.content}
                onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                placeholder="Write your announcement..."
                className="bg-background/50 min-h-[100px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={announcementForm.type}
                  onValueChange={(value) => setAnnouncementForm({ ...announcementForm, type: value })}
                >
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="promo">Promotion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Audience</Label>
                <Select
                  value={announcementForm.target_audience}
                  onValueChange={(value) => setAnnouncementForm({ ...announcementForm, target_audience: value })}
                >
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="customers">Customers</SelectItem>
                    <SelectItem value="drivers">Drivers</SelectItem>
                    <SelectItem value="restaurants">Restaurants</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveDialog(null)}>Cancel</Button>
            <Button 
              onClick={() => createAnnouncement.mutate(announcementForm)}
              disabled={createAnnouncement.isPending || !announcementForm.title || !announcementForm.content}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              Send Announcement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payouts Confirmation Dialog */}
      <Dialog open={activeDialog === "payouts"} onOpenChange={() => setActiveDialog(null)}>
        <DialogContent className="border-0 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              Process All Payouts
            </DialogTitle>
            <DialogDescription>
              This will mark all pending payouts as processing
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-500">Confirm Action</p>
                <p className="text-sm text-muted-foreground">
                  This will begin processing all pending payouts. Make sure you have reviewed them before proceeding.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveDialog(null)}>Cancel</Button>
            <Button 
              onClick={() => processAllPayouts.mutate()}
              disabled={processAllPayouts.isPending}
              className="gap-2 bg-green-500 hover:bg-green-600"
            >
              <CheckCircle className="h-4 w-4" />
              Confirm Processing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminQuickActions;
