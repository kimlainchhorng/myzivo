import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Smartphone,
  Send,
  Clock,
  Users,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Eye
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface NotificationTemplate {
  id: string;
  name: string;
  type: "push" | "email" | "sms";
  subject?: string;
  body: string;
  variables: string[];
  lastUsed: string;
  sentCount: number;
}

const templates: NotificationTemplate[] = [
  {
    id: "1",
    name: "Order Confirmation",
    type: "push",
    body: "Your order #{{order_id}} has been confirmed! Track it in the app.",
    variables: ["order_id"],
    lastUsed: "Today",
    sentCount: 12500,
  },
  {
    id: "2",
    name: "Driver Arrival",
    type: "push",
    body: "{{driver_name}} is arriving in {{eta}} minutes. Look for a {{car_color}} {{car_model}}.",
    variables: ["driver_name", "eta", "car_color", "car_model"],
    lastUsed: "Today",
    sentCount: 8200,
  },
  {
    id: "3",
    name: "Weekly Summary",
    type: "email",
    subject: "Your Weekly ZIVO Summary",
    body: "Hi {{user_name}}, here's your activity summary for the week...",
    variables: ["user_name"],
    lastUsed: "Yesterday",
    sentCount: 45000,
  },
  {
    id: "4",
    name: "Promo Code",
    type: "sms",
    body: "ZIVO: Use code {{promo_code}} for {{discount}}% off your next ride! Valid until {{expiry}}.",
    variables: ["promo_code", "discount", "expiry"],
    lastUsed: "3 days ago",
    sentCount: 25000,
  },
];

const notificationStats = {
  sentToday: 45280,
  deliveryRate: 98.5,
  openRate: 42.3,
  clickRate: 12.8,
};

const getTypeConfig = (type: string) => {
  switch (type) {
    case "push":
      return { icon: Bell, color: "text-violet-500", bg: "bg-violet-500/10" };
    case "email":
      return { icon: Mail, color: "text-blue-500", bg: "bg-blue-500/10" };
    case "sms":
      return { icon: MessageSquare, color: "text-green-500", bg: "bg-green-500/10" };
    default:
      return { icon: Bell, color: "text-primary", bg: "bg-primary/10" };
  }
};

const AdminNotificationManager = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            Notification Manager
          </h2>
          <p className="text-muted-foreground">Send and manage platform notifications</p>
        </div>
        <Button className="gap-2">
          <Send className="h-4 w-4" />
          New Notification
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 bg-gradient-to-br from-violet-500/10 to-purple-500/5">
          <CardContent className="p-4">
            <Send className="h-5 w-5 text-violet-500 mb-2" />
            <p className="text-2xl font-bold">{notificationStats.sentToday.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Sent Today</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5">
          <CardContent className="p-4">
            <CheckCircle2 className="h-5 w-5 text-green-500 mb-2" />
            <p className="text-2xl font-bold">{notificationStats.deliveryRate}%</p>
            <p className="text-xs text-muted-foreground">Delivery Rate</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/5">
          <CardContent className="p-4">
            <Eye className="h-5 w-5 text-blue-500 mb-2" />
            <p className="text-2xl font-bold">{notificationStats.openRate}%</p>
            <p className="text-xs text-muted-foreground">Open Rate</p>
          </CardContent>
        </Card>
        <Card className="border-0 bg-gradient-to-br from-amber-500/10 to-yellow-500/5">
          <CardContent className="p-4">
            <TrendingUp className="h-5 w-5 text-amber-500 mb-2" />
            <p className="text-2xl font-bold">{notificationStats.clickRate}%</p>
            <p className="text-xs text-muted-foreground">Click Rate</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="compose">Compose</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="mt-6 space-y-4">
          {templates.map((template, index) => {
            const typeConfig = getTypeConfig(template.type);
            const TypeIcon = typeConfig.icon;

            return (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={cn(
                  "border-0 bg-card/50 backdrop-blur-xl hover:shadow-lg transition-all cursor-pointer",
                  selectedTemplate === template.id && "ring-2 ring-primary"
                )}
                onClick={() => setSelectedTemplate(template.id)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", typeConfig.bg)}>
                        <TypeIcon className={cn("h-5 w-5", typeConfig.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{template.name}</h3>
                          <Badge variant="secondary" className="text-xs capitalize">
                            {template.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {template.body}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {template.lastUsed}
                          </span>
                          <span className="flex items-center gap-1">
                            <Send className="h-3 w-3" />
                            {template.sentCount.toLocaleString()} sent
                          </span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Use Template</Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </TabsContent>

        <TabsContent value="compose" className="mt-6">
          <Card className="border-0 bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-lg">Compose Notification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Notification Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="push">Push Notification</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="in-app">In-App</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Target Audience</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="active">Active Users</SelectItem>
                      <SelectItem value="dormant">Dormant Users</SelectItem>
                      <SelectItem value="premium">Premium Members</SelectItem>
                      <SelectItem value="drivers">All Drivers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input placeholder="Notification title..." />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea placeholder="Enter your message..." rows={4} />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Schedule for later</span>
                </div>
                <Switch />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline">Preview</Button>
                <Button className="gap-2">
                  <Send className="h-4 w-4" />
                  Send Notification
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="mt-6">
          <Card className="border-0 bg-card/50 backdrop-blur-xl">
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-1">No Scheduled Notifications</h3>
              <p className="text-muted-foreground text-sm">
                Schedule a notification to send at a specific time.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminNotificationManager;
