import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  Send, 
  Users,
  Car,
  Utensils,
  Megaphone,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Info,
  Plus,
  Filter,
  Search,
  Mail,
  Smartphone,
  Globe,
  Target,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "promo";
  channel: "push" | "email" | "sms" | "in-app";
  audience: string;
  sentAt: string;
  delivered: number;
  opened: number;
  status: "sent" | "scheduled" | "draft";
}

const notifications: Notification[] = [
  {
    id: "1",
    title: "Weekend Surge Alert",
    message: "Higher demand expected this weekend. Go online to earn more!",
    type: "promo",
    channel: "push",
    audience: "All Drivers",
    sentAt: "2024-01-28T10:00:00",
    delivered: 1250,
    opened: 892,
    status: "sent",
  },
  {
    id: "2",
    title: "New Restaurant Partner",
    message: "Check out our new partner restaurants with exclusive discounts",
    type: "info",
    channel: "push",
    audience: "Active Customers",
    sentAt: "2024-01-27T14:30:00",
    delivered: 8500,
    opened: 3420,
    status: "sent",
  },
  {
    id: "3",
    title: "System Maintenance",
    message: "Scheduled maintenance tonight from 2-4 AM EST",
    type: "warning",
    channel: "email",
    audience: "All Users",
    sentAt: "2024-01-29T08:00:00",
    delivered: 0,
    opened: 0,
    status: "scheduled",
  },
  {
    id: "4",
    title: "Referral Bonus Increased",
    message: "Refer a friend and earn $50! Limited time offer.",
    type: "promo",
    channel: "push",
    audience: "All Drivers",
    sentAt: "",
    delivered: 0,
    opened: 0,
    status: "draft",
  },
];

const typeConfig = {
  info: { icon: Info, color: "text-blue-500", bg: "bg-blue-500/10" },
  warning: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10" },
  success: { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
  promo: { icon: Megaphone, color: "text-violet-500", bg: "bg-violet-500/10" },
};

const channelIcons = {
  push: Smartphone,
  email: Mail,
  sms: Smartphone,
  "in-app": Globe,
};

const AdminNotificationHub = () => {
  const [selectedAudience, setSelectedAudience] = useState("all");

  const stats = [
    { label: "Sent Today", value: "2,450", icon: Send, color: "text-primary" },
    { label: "Open Rate", value: "68%", icon: CheckCircle2, color: "text-green-500" },
    { label: "Scheduled", value: "5", icon: Clock, color: "text-amber-500" },
    { label: "Drafts", value: "3", icon: Bell, color: "text-blue-500" },
  ];

  const audiences = [
    { id: "all", label: "All Users", icon: Users, count: 15200 },
    { id: "customers", label: "Customers", icon: Users, count: 12500 },
    { id: "drivers", label: "Drivers", icon: Car, count: 1850 },
    { id: "restaurants", label: "Restaurants", icon: Utensils, count: 420 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500">
              <Bell className="h-5 w-5 text-white" />
            </div>
            Notification Hub
          </h2>
          <p className="text-muted-foreground mt-1">Manage push notifications, emails, and in-app messages</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Notification
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card 
            key={stat.label}
            className="border-0 bg-card/50 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-300"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn("p-2.5 rounded-xl", stat.color.replace("text-", "bg-") + "/10")}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Compose Panel */}
        <Card className="lg:col-span-1 border-0 bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: "200ms" }}>
          <CardHeader>
            <CardTitle className="text-lg">Quick Compose</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Title</label>
              <Input placeholder="Notification title..." />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Message</label>
              <Textarea placeholder="Write your message..." rows={4} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Audience</label>
              <div className="grid grid-cols-2 gap-2">
                {audiences.map((audience) => {
                  const Icon = audience.icon;
                  return (
                    <button
                      key={audience.id}
                      onClick={() => setSelectedAudience(audience.id)}
                      className={cn(
                        "p-3 rounded-xl border transition-all text-left",
                        selectedAudience === audience.id
                          ? "border-primary bg-primary/5"
                          : "border-border/50 hover:border-border"
                      )}
                    >
                      <Icon className={cn(
                        "h-4 w-4 mb-1",
                        selectedAudience === audience.id ? "text-primary" : "text-muted-foreground"
                      )} />
                      <p className="text-xs font-medium">{audience.label}</p>
                      <p className="text-[10px] text-muted-foreground">{audience.count.toLocaleString()}</p>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Channels</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(channelIcons).map(([channel, Icon]) => (
                  <Button key={channel} variant="outline" size="sm" className="gap-2">
                    <Icon className="h-4 w-4" />
                    {channel}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button className="flex-1 gap-2">
                <Send className="h-4 w-4" />
                Send Now
              </Button>
              <Button variant="outline" className="gap-2">
                <Clock className="h-4 w-4" />
                Schedule
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification History */}
        <Card className="lg:col-span-2 border-0 bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: "250ms" }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Notifications</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.map((notification, index) => {
                const config = typeConfig[notification.type];
                const TypeIcon = config.icon;
                const ChannelIcon = channelIcons[notification.channel];

                return (
                  <div
                    key={notification.id}
                    className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all animate-in fade-in slide-in-from-bottom-2 duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn("p-2 rounded-lg shrink-0", config.bg)}>
                        <TypeIcon className={cn("h-4 w-4", config.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          <Badge variant="outline" className="text-[10px] gap-1">
                            <ChannelIcon className="h-3 w-3" />
                            {notification.channel}
                          </Badge>
                          <Badge className={cn(
                            "text-[10px]",
                            notification.status === "sent" ? "bg-green-500/10 text-green-500" :
                            notification.status === "scheduled" ? "bg-amber-500/10 text-amber-500" :
                            "bg-muted text-muted-foreground"
                          )}>
                            {notification.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{notification.message}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {notification.audience}
                          </span>
                          {notification.status === "sent" && (
                            <>
                              <span>Delivered: {notification.delivered.toLocaleString()}</span>
                              <span className="text-green-500">
                                Opened: {Math.round((notification.opened / notification.delivered) * 100)}%
                              </span>
                            </>
                          )}
                          {notification.status === "scheduled" && notification.sentAt && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(notification.sentAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminNotificationHub;
