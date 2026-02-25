import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, 
  Send, 
  Bell,
  Users,
  Search,
  User,
  Megaphone,
  Clock,
  CheckCheck,
  AlertCircle,
  FileText,
  Sparkles,
  Filter,
  Car,
  Bike,
  MapPin
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow, subDays } from "date-fns";

interface Driver {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  is_online: boolean;
  vehicle_type: string;
}

interface SentNotification {
  id: string;
  title: string;
  description: string;
  type: string;
  created_at: string;
  is_read: boolean;
  driver_id: string;
}

const messageTemplates = [
  { id: "bonus", title: "Weekend Bonus", content: "Complete 20 trips this weekend to earn an extra $50!", type: "promo" },
  { id: "docs", title: "Document Reminder", content: "Your driving documents are expiring soon. Please update them to continue driving.", type: "alert" },
  { id: "feature", title: "New Feature", content: "We've launched a new feature! Check out scheduled rides in your driver app.", type: "info" },
  { id: "safety", title: "Safety Reminder", content: "Remember to always verify passenger identity before starting the trip. Stay safe!", type: "urgent" },
];

const AdminDriverMessaging = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>([]);
  const [messageType, setMessageType] = useState<"individual" | "broadcast">("individual");
  const [messageTitle, setMessageTitle] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [notificationType, setNotificationType] = useState("info");
  const [vehicleFilter, setVehicleFilter] = useState("all");
  const [onlineFilter, setOnlineFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("compose");
  const queryClient = useQueryClient();

  // Fetch drivers
  const { data: drivers, isLoading: driversLoading } = useQuery({
    queryKey: ["messaging-drivers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("drivers")
        .select("id, full_name, email, avatar_url, is_online, vehicle_type")
        .eq("status", "verified")
        .order("full_name");

      if (error) throw error;
      return data as Driver[];
    },
  });

  // Fetch sent notifications
  const { data: sentNotifications, isLoading: notificationsLoading } = useQuery({
    queryKey: ["sent-notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("driver_notifications")
        .select("id, title, description, type, created_at, is_read, driver_id")
        .gte("created_at", subDays(new Date(), 7).toISOString())
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as SentNotification[];
    },
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      const recipients = messageType === "broadcast" 
        ? drivers?.map(d => d.id) || []
        : selectedDrivers;

      for (const driverId of recipients) {
        await supabase.from("driver_notifications").insert({
          driver_id: driverId,
          title: messageTitle,
          description: messageContent,
          type: notificationType,
          icon: notificationType === "promo" ? "gift" : notificationType === "alert" ? "alert-circle" : notificationType === "urgent" ? "alert-triangle" : "info"
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["driver-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["sent-notifications"] });
      toast.success(`Message sent to ${messageType === "broadcast" ? "all drivers" : `${selectedDrivers.length} driver(s)`}`);
      setIsSendDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error("Failed to send message");
    },
  });

  const resetForm = () => {
    setMessageTitle("");
    setMessageContent("");
    setSelectedDrivers([]);
    setNotificationType("info");
  };

  const applyTemplate = (template: typeof messageTemplates[0]) => {
    setMessageTitle(template.title);
    setMessageContent(template.content);
    setNotificationType(template.type);
    toast.success("Template applied!");
  };

  const toggleDriverSelection = (id: string) => {
    setSelectedDrivers(prev => 
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const selectAllFiltered = () => {
    if (filteredDrivers) {
      setSelectedDrivers(filteredDrivers.map(d => d.id));
    }
  };

  const clearSelection = () => {
    setSelectedDrivers([]);
  };

  const filteredDrivers = drivers?.filter(driver => {
    const matchesSearch = driver.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVehicle = vehicleFilter === "all" || driver.vehicle_type === vehicleFilter;
    const matchesOnline = onlineFilter === "all" || 
      (onlineFilter === "online" && driver.is_online) || 
      (onlineFilter === "offline" && !driver.is_online);
    return matchesSearch && matchesVehicle && matchesOnline;
  });

  const handleSend = () => {
    if (!messageTitle.trim() || !messageContent.trim()) {
      toast.error("Please fill in both title and message");
      return;
    }
    if (messageType === "individual" && selectedDrivers.length === 0) {
      toast.error("Please select at least one driver");
      return;
    }
    setIsSendDialogOpen(true);
  };

  // Stats
  const totalSent = sentNotifications?.length || 0;
  const readCount = sentNotifications?.filter(n => n.is_read).length || 0;
  const readRate = totalSent > 0 ? Math.round((readCount / totalSent) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/10 shadow-lg"
        >
          <MessageSquare className="h-6 w-6 text-blue-500" />
        </motion.div>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Driver Messaging
            <Sparkles className="h-5 w-5 text-blue-500" />
          </h1>
          <p className="text-muted-foreground">Push notifications and in-app messages</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10">
                <Send className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalSent}</p>
                <p className="text-xs text-muted-foreground">Sent (7d)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-green-500/10">
                <CheckCheck className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{readRate}%</p>
                <p className="text-xs text-muted-foreground">Read Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{drivers?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Total Drivers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10">
                <MapPin className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{drivers?.filter(d => d.is_online).length || 0}</p>
                <p className="text-xs text-muted-foreground">Online Now</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/30">
          <TabsTrigger value="compose" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Compose
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <Clock className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Compose Message */}
            <Card className="lg:col-span-2 border-0 bg-card/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-base">Compose Message</CardTitle>
                <CardDescription>Create and send notifications to drivers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Message Type */}
                <div className="flex gap-4">
                  <Button
                    variant={messageType === "individual" ? "default" : "outline"}
                    onClick={() => setMessageType("individual")}
                    className="flex-1 gap-2"
                  >
                    <User className="h-4 w-4" />
                    Individual
                  </Button>
                  <Button
                    variant={messageType === "broadcast" ? "default" : "outline"}
                    onClick={() => setMessageType("broadcast")}
                    className="flex-1 gap-2"
                  >
                    <Megaphone className="h-4 w-4" />
                    Broadcast All
                  </Button>
                </div>

                {/* Driver Selection (for individual) */}
                {messageType === "individual" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <label className="text-sm font-medium">Select Recipients</label>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={selectAllFiltered}>
                          Select All
                        </Button>
                        {selectedDrivers.length > 0 && (
                          <Button variant="ghost" size="sm" onClick={clearSelection}>
                            Clear
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* Filters */}
                    <div className="flex gap-2 flex-wrap">
                      <div className="relative flex-1 min-w-[150px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
                        <SelectTrigger className="w-28">
                          <Car className="h-4 w-4 mr-1" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="car">Car</SelectItem>
                          <SelectItem value="bike">Bike</SelectItem>
                          <SelectItem value="suv">SUV</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={onlineFilter} onValueChange={setOnlineFilter}>
                        <SelectTrigger className="w-28">
                          <Filter className="h-4 w-4 mr-1" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="online">Online</SelectItem>
                          <SelectItem value="offline">Offline</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <ScrollArea className="h-40 rounded-xl border border-border/50 p-2">
                      {driversLoading ? (
                        [...Array(4)].map((_, i) => (
                          <div key={i} className="flex items-center gap-3 p-2">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                        ))
                      ) : !filteredDrivers?.length ? (
                        <p className="text-center text-muted-foreground py-4">No drivers found</p>
                      ) : (
                        filteredDrivers.map((driver) => (
                          <div 
                            key={driver.id}
                            className={cn(
                              "flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-colors",
                              selectedDrivers.includes(driver.id) && "bg-primary/10"
                            )}
                            onClick={() => toggleDriverSelection(driver.id)}
                          >
                            <Checkbox 
                              checked={selectedDrivers.includes(driver.id)}
                              onCheckedChange={() => toggleDriverSelection(driver.id)}
                            />
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={driver.avatar_url || undefined} />
                              <AvatarFallback>{driver.full_name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{driver.full_name}</p>
                              <p className="text-xs text-muted-foreground truncate">{driver.vehicle_type}</p>
                            </div>
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              driver.is_online ? "bg-green-500" : "bg-muted-foreground"
                            )} />
                          </div>
                        ))
                      )}
                    </ScrollArea>
                    <AnimatePresence>
                      {selectedDrivers.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                        >
                          <Badge variant="secondary" className="bg-primary/10 text-primary">
                            {selectedDrivers.length} driver(s) selected
                          </Badge>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Notification Type */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Notification Type</label>
                  <Select value={notificationType} onValueChange={setNotificationType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info"><span className="flex items-center gap-2"><AlertCircle className="w-4 h-4 text-blue-500" /> Information</span></SelectItem>
                      <SelectItem value="promo"><span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-amber-500" /> Promotion</span></SelectItem>
                      <SelectItem value="alert"><span className="flex items-center gap-2"><AlertCircle className="w-4 h-4 text-orange-500" /> Alert</span></SelectItem>
                      <SelectItem value="urgent"><span className="flex items-center gap-2"><Bell className="w-4 h-4 text-red-500" /> Urgent</span></SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Message Content */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Title</label>
                  <Input
                    value={messageTitle}
                    onChange={(e) => setMessageTitle(e.target.value)}
                    placeholder="Message title..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Message</label>
                  <Textarea
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    placeholder="Write your message..."
                    rows={4}
                  />
                </div>

                <Button className="w-full gap-2" onClick={handleSend}>
                  <Send className="h-4 w-4" />
                  Send Message
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-0 bg-card/50 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Quick Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 rounded-xl bg-muted/50">
                  <p className="text-sm font-medium mb-1">Broadcast Reach</p>
                  <p className="text-2xl font-bold">{drivers?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">drivers will receive</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/50">
                  <p className="text-sm font-medium mb-1">Online Now</p>
                  <p className="text-2xl font-bold text-green-500">{drivers?.filter(d => d.is_online).length || 0}</p>
                  <p className="text-xs text-muted-foreground">instant delivery</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/50">
                  <p className="text-sm font-medium mb-1">Avg Read Time</p>
                  <p className="text-2xl font-bold">2.5h</p>
                  <p className="text-xs text-muted-foreground">for notifications</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <Card className="border-0 bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-base">Message Templates</CardTitle>
              <CardDescription>Quick templates for common notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {messageTemplates.map((template) => (
                  <motion.div
                    key={template.id}
                    whileHover={{ scale: 1.02 }}
                    className="p-4 rounded-xl border border-border/50 hover:border-primary/30 cursor-pointer transition-colors"
                    onClick={() => applyTemplate(template)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium">{template.title}</p>
                      <Badge variant="outline" className={cn(
                        "text-xs",
                        template.type === "promo" && "bg-purple-500/10 text-purple-500",
                        template.type === "alert" && "bg-amber-500/10 text-amber-500",
                        template.type === "urgent" && "bg-red-500/10 text-red-500",
                        template.type === "info" && "bg-blue-500/10 text-blue-500"
                      )}>
                        {template.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{template.content}</p>
                    <Button size="sm" variant="ghost" className="mt-3 w-full">
                      Use Template
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card className="border-0 bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-base">Recent Notifications</CardTitle>
              <CardDescription>Messages sent in the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {notificationsLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : !sentNotifications?.length ? (
                  <div className="text-center py-12">
                    <Bell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">No notifications sent recently</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sentNotifications.map((notification) => (
                      <div 
                        key={notification.id}
                        className="p-3 rounded-xl border border-border/50"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="font-medium text-sm">{notification.title}</p>
                          <div className="flex items-center gap-2">
                            {notification.is_read ? (
                              <Badge variant="outline" className="bg-green-500/10 text-green-500 text-[10px]">
                                <CheckCheck className="h-3 w-3 mr-1" />
                                Read
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-muted text-muted-foreground text-[10px]">
                                Sent
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{notification.description}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
        <DialogContent className="border-0 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Confirm Send
            </DialogTitle>
            <DialogDescription>
              Review your message before sending
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-muted/50 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Recipients</span>
                <span className="font-medium">
                  {messageType === "broadcast" 
                    ? `All ${drivers?.length || 0} drivers`
                    : `${selectedDrivers.length} driver(s)`
                  }
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Type</span>
                <Badge variant="outline">{notificationType}</Badge>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border/50">
              <p className="font-medium">{messageTitle}</p>
              <p className="text-sm text-muted-foreground mt-1">{messageContent}</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSendDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => sendMutation.mutate()}
              disabled={sendMutation.isPending}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              {sendMutation.isPending ? "Sending..." : "Send Now"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDriverMessaging;
