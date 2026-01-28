import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Megaphone, Plus, Edit, Trash2, Users, Car, Store, Shield, AlertCircle, CheckCircle, Info, Zap, Bell, Calendar as CalendarIcon, Clock, Send, Eye } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format, isAfter, isBefore, parseISO } from "date-fns";

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  target_audience: string;
  is_active: boolean;
  starts_at: string;
  ends_at: string | null;
  created_at: string;
}

const typeConfig: Record<string, { icon: any; color: string; bg: string }> = {
  info: { icon: Info, color: "text-blue-500", bg: "bg-blue-500/10" },
  warning: { icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-500/10" },
  success: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
  error: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10" },
  promo: { icon: Zap, color: "text-purple-500", bg: "bg-purple-500/10" },
};

const audienceConfig: Record<string, { icon: any; label: string }> = {
  all: { icon: Users, label: "Everyone" },
  riders: { icon: Users, label: "Riders" },
  drivers: { icon: Car, label: "Drivers" },
  restaurants: { icon: Store, label: "Restaurants" },
  admins: { icon: Shield, label: "Admins" },
};

const AdminAnnouncements = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [previewAnnouncement, setPreviewAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "info",
    target_audience: "all",
    is_active: true,
    starts_at: new Date(),
    ends_at: null as Date | null,
  });
  const queryClient = useQueryClient();

  const { data: announcements, isLoading } = useQuery({
    queryKey: ["admin-announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Announcement[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("announcements").insert({
        title: data.title,
        content: data.content,
        type: data.type,
        target_audience: data.target_audience,
        is_active: data.is_active,
        starts_at: data.starts_at.toISOString(),
        ends_at: data.ends_at?.toISOString() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
      toast.success("Announcement created");
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create announcement");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Announcement> }) => {
      const { error } = await supabase.from("announcements").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
      toast.success("Announcement updated");
      setEditingAnnouncement(null);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update announcement");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("announcements").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
      toast.success("Announcement deleted");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete announcement");
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      type: "info",
      target_audience: "all",
      is_active: true,
      starts_at: new Date(),
      ends_at: null,
    });
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      target_audience: announcement.target_audience,
      is_active: announcement.is_active,
      starts_at: parseISO(announcement.starts_at),
      ends_at: announcement.ends_at ? parseISO(announcement.ends_at) : null,
    });
  };

  const handleSubmit = () => {
    if (editingAnnouncement) {
      updateMutation.mutate({ 
        id: editingAnnouncement.id, 
        data: {
          title: formData.title,
          content: formData.content,
          type: formData.type,
          target_audience: formData.target_audience,
          is_active: formData.is_active,
          starts_at: formData.starts_at.toISOString(),
          ends_at: formData.ends_at?.toISOString() || null,
        }
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getAnnouncementStatus = (announcement: Announcement) => {
    const now = new Date();
    const startsAt = parseISO(announcement.starts_at);
    const endsAt = announcement.ends_at ? parseISO(announcement.ends_at) : null;
    
    if (!announcement.is_active) {
      return { label: "Inactive", color: "bg-slate-500/10 text-slate-500" };
    }
    if (isBefore(now, startsAt)) {
      return { label: "Scheduled", color: "bg-blue-500/10 text-blue-500" };
    }
    if (endsAt && isAfter(now, endsAt)) {
      return { label: "Expired", color: "bg-amber-500/10 text-amber-500" };
    }
    return { label: "Live", color: "bg-green-500/10 text-green-500" };
  };

  const activeCount = announcements?.filter(a => a.is_active).length || 0;
  const liveCount = announcements?.filter(a => {
    const status = getAnnouncementStatus(a);
    return status.label === "Live";
  }).length || 0;
  const scheduledCount = announcements?.filter(a => {
    const status = getAnnouncementStatus(a);
    return status.label === "Scheduled";
  }).length || 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/10">
            <Megaphone className="h-6 w-6 text-rose-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Announcements</h1>
            <p className="text-muted-foreground">Broadcast messages to users</p>
          </div>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Announcement
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-500/10">
              <Megaphone className="h-5 w-5 text-rose-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-lg font-semibold">{announcements?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Send className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Live Now</p>
              <p className="text-lg font-semibold">{liveCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Clock className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Scheduled</p>
              <p className="text-lg font-semibold">{scheduledCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Zap className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Promos</p>
              <p className="text-lg font-semibold">
                {announcements?.filter(a => a.type === 'promo').length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Announcements Table */}
      <Card className="border-0 bg-card/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            All Announcements
          </CardTitle>
          <CardDescription>Manage platform-wide notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Audience</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Schedule</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                    </TableRow>
                  ))
                ) : !announcements?.length ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <Megaphone className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                      <p className="text-muted-foreground">No announcements yet</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  announcements.map((announcement) => {
                    const typeInfo = typeConfig[announcement.type] || typeConfig.info;
                    const audienceInfo = audienceConfig[announcement.target_audience] || audienceConfig.all;
                    const TypeIcon = typeInfo.icon;
                    const AudienceIcon = audienceInfo.icon;
                    const status = getAnnouncementStatus(announcement);
                    
                    return (
                      <TableRow key={announcement.id} className="group hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div>
                            <p className="font-medium">{announcement.title}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {announcement.content}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn("gap-1.5 capitalize", typeInfo.bg, typeInfo.color, "border-transparent")}>
                            <TypeIcon className="h-3 w-3" />
                            {announcement.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <AudienceIcon className="h-4 w-4" />
                            <span className="text-sm">{audienceInfo.label}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn(status.color, "border-transparent")}>
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" />
                            {format(parseISO(announcement.starts_at), "MMM d, yyyy")}
                          </div>
                          {announcement.ends_at && (
                            <div className="flex items-center gap-1 text-xs">
                              → {format(parseISO(announcement.ends_at), "MMM d")}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setPreviewAnnouncement(announcement)}
                              className="h-8 w-8"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(announcement)}
                              className="h-8 w-8"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteMutation.mutate(announcement.id)}
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={!!previewAnnouncement} onOpenChange={() => setPreviewAnnouncement(null)}>
        <DialogContent className="border-0 bg-card/95 backdrop-blur-xl max-w-md">
          <DialogHeader>
            <DialogTitle>Announcement Preview</DialogTitle>
            <DialogDescription>How users will see this announcement</DialogDescription>
          </DialogHeader>
          {previewAnnouncement && (
            <div className={cn(
              "p-4 rounded-xl border",
              typeConfig[previewAnnouncement.type]?.bg,
              "border-current/10"
            )}>
              <div className="flex items-start gap-3">
                {(() => {
                  const TypeIcon = typeConfig[previewAnnouncement.type]?.icon || Info;
                  return <TypeIcon className={cn("h-5 w-5 mt-0.5", typeConfig[previewAnnouncement.type]?.color)} />;
                })()}
                <div className="flex-1">
                  <p className="font-semibold">{previewAnnouncement.title}</p>
                  <p className="text-sm mt-1">{previewAnnouncement.content}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateOpen || !!editingAnnouncement} onOpenChange={(open) => {
        if (!open) {
          setIsCreateOpen(false);
          setEditingAnnouncement(null);
          resetForm();
        }
      }}>
        <DialogContent className="border-0 bg-card/95 backdrop-blur-xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-primary" />
              {editingAnnouncement ? "Edit Announcement" : "New Announcement"}
            </DialogTitle>
            <DialogDescription>
              {editingAnnouncement ? "Update this announcement" : "Create a new announcement for users"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Announcement title"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Content</label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Announcement content..."
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="promo">Promo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Target Audience</label>
                <Select value={formData.target_audience} onValueChange={(v) => setFormData({ ...formData, target_audience: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Everyone</SelectItem>
                    <SelectItem value="riders">Riders Only</SelectItem>
                    <SelectItem value="drivers">Drivers Only</SelectItem>
                    <SelectItem value="restaurants">Restaurants Only</SelectItem>
                    <SelectItem value="admins">Admins Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Schedule */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(formData.starts_at, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.starts_at}
                      onSelect={(date) => date && setFormData({ ...formData, starts_at: date })}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date (Optional)</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.ends_at ? format(formData.ends_at, "PPP") : "No end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.ends_at || undefined}
                      onSelect={(date) => setFormData({ ...formData, ends_at: date || null })}
                    />
                    {formData.ends_at && (
                      <div className="p-2 border-t">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full"
                          onClick={() => setFormData({ ...formData, ends_at: null })}
                        >
                          Clear end date
                        </Button>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div>
                <p className="font-medium">Active</p>
                <p className="text-sm text-muted-foreground">Show this announcement to users</p>
              </div>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateOpen(false);
              setEditingAnnouncement(null);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!formData.title || !formData.content}>
              {editingAnnouncement ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAnnouncements;
