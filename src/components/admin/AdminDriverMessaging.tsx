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
  AlertCircle
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";

interface Driver {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  is_online: boolean;
  vehicle_type: string;
}

interface Message {
  id: string;
  title: string;
  content: string;
  type: "individual" | "broadcast";
  recipient_count: number;
  sent_at: string;
  read_count: number;
}

const AdminDriverMessaging = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>([]);
  const [messageType, setMessageType] = useState<"individual" | "broadcast">("individual");
  const [messageTitle, setMessageTitle] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [notificationType, setNotificationType] = useState("info");
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

  // Mock message history
  const messageHistory: Message[] = [
    {
      id: "1",
      title: "Weekend Bonus Active",
      content: "Complete 20 trips this weekend to earn an extra $50!",
      type: "broadcast",
      recipient_count: 156,
      sent_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read_count: 89
    },
    {
      id: "2", 
      title: "Document Expiring Soon",
      content: "Your driver's license expires in 30 days. Please upload a new copy.",
      type: "individual",
      recipient_count: 12,
      sent_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      read_count: 8
    },
    {
      id: "3",
      title: "New Feature: Scheduled Rides",
      content: "You can now accept scheduled rides up to 7 days in advance.",
      type: "broadcast",
      recipient_count: 203,
      sent_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      read_count: 178
    }
  ];

  const sendMutation = useMutation({
    mutationFn: async () => {
      // Simulate sending messages
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, you'd insert notifications to driver_notifications table
      const recipients = messageType === "broadcast" 
        ? drivers?.map(d => d.id) || []
        : selectedDrivers;

      for (const driverId of recipients) {
        await supabase.from("driver_notifications").insert({
          driver_id: driverId,
          title: messageTitle,
          description: messageContent,
          type: notificationType,
          icon: notificationType === "promo" ? "gift" : notificationType === "alert" ? "alert-circle" : "info"
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["driver-notifications"] });
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

  const toggleDriverSelection = (id: string) => {
    setSelectedDrivers(prev => 
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const selectAllDrivers = () => {
    if (drivers) {
      setSelectedDrivers(drivers.map(d => d.id));
    }
  };

  const filteredDrivers = drivers?.filter(driver =>
    driver.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compose Message */}
        <Card className="lg:col-span-2 border-0 bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/10">
                <MessageSquare className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <CardTitle>Send Message</CardTitle>
                <CardDescription>Push notifications and in-app messages</CardDescription>
              </div>
            </div>
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
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Select Recipients</label>
                  <Button variant="ghost" size="sm" onClick={selectAllDrivers}>
                    Select All
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search drivers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <ScrollArea className="h-48 rounded-xl border border-border/50 p-2">
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
                          "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors",
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
                          <p className="text-xs text-muted-foreground truncate">{driver.email}</p>
                        </div>
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          driver.is_online ? "bg-green-500" : "bg-muted-foreground"
                        )} />
                      </div>
                    ))
                  )}
                </ScrollArea>
                {selectedDrivers.length > 0 && (
                  <Badge variant="secondary">
                    {selectedDrivers.length} driver(s) selected
                  </Badge>
                )}
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
                  <SelectItem value="info">ℹ️ Information</SelectItem>
                  <SelectItem value="promo">🎁 Promotion</SelectItem>
                  <SelectItem value="alert">⚠️ Alert</SelectItem>
                  <SelectItem value="urgent">🚨 Urgent</SelectItem>
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

        {/* Message History */}
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4" />
              Recent Messages
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {messageHistory.map((msg) => (
              <div 
                key={msg.id}
                className="p-3 rounded-xl border border-border/50 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-sm line-clamp-1">{msg.title}</p>
                  <Badge variant="outline" className={cn(
                    "text-[10px] shrink-0",
                    msg.type === "broadcast" 
                      ? "bg-purple-500/10 text-purple-500 border-purple-500/20"
                      : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                  )}>
                    {msg.type === "broadcast" ? <Megaphone className="h-3 w-3 mr-1" /> : <User className="h-3 w-3 mr-1" />}
                    {msg.type}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{msg.content}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {msg.recipient_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCheck className="h-3 w-3 text-green-500" />
                    {msg.read_count} read
                  </span>
                  <span>{formatDistanceToNow(new Date(msg.sent_at), { addSuffix: true })}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

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
