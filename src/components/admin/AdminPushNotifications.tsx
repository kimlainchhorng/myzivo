import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Bell, Send, Users, Clock, BarChart3, CheckCircle2, 
  Smartphone, Globe, Target
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const recentNotifications = [
  { id: "1", title: "Flash Sale 50% Off!", sent: 45000, opened: 18000, clicked: 5400, sentAt: "2 hours ago" },
  { id: "2", title: "Your ride is arriving", sent: 12000, opened: 10800, clicked: 8640, sentAt: "3 hours ago" },
  { id: "3", title: "New restaurant in your area", sent: 28000, opened: 8400, clicked: 2520, sentAt: "5 hours ago" },
  { id: "4", title: "Complete your booking", sent: 5000, opened: 2500, clicked: 1250, sentAt: "1 day ago" },
];

export default function AdminPushNotifications() {
  const [scheduleEnabled, setScheduleEnabled] = useState(false);

  const totalSent = 320000;
  const avgOpenRate = 42;
  const avgCTR = 12;
  const activeDevices = 156000;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            Push Notifications
          </h2>
          <p className="text-muted-foreground">Send and manage push notifications</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Send className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Sent</p>
                <p className="text-2xl font-bold">{(totalSent / 1000).toFixed(0)}k</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Open Rate</p>
                <p className="text-2xl font-bold">{avgOpenRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <BarChart3 className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Click Rate</p>
                <p className="text-2xl font-bold">{avgCTR}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Smartphone className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Devices</p>
                <p className="text-2xl font-bold">{(activeDevices / 1000).toFixed(0)}k</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Compose Notification</CardTitle>
            <CardDescription>Create and send a new push notification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input placeholder="Notification title..." />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea placeholder="Notification message..." rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Target Audience</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="active">Active Users (7 days)</SelectItem>
                  <SelectItem value="inactive">Inactive Users</SelectItem>
                  <SelectItem value="riders">Riders Only</SelectItem>
                  <SelectItem value="drivers">Drivers Only</SelectItem>
                  <SelectItem value="premium">Premium Members</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch checked={scheduleEnabled} onCheckedChange={setScheduleEnabled} />
                <Label>Schedule for later</Label>
              </div>
              {scheduleEnabled && (
                <Input type="datetime-local" className="w-auto" />
              )}
            </div>
            <Button className="w-full">
              <Send className="h-4 w-4 mr-2" />
              {scheduleEnabled ? "Schedule Notification" : "Send Now"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
            <CardDescription>Performance of recent campaigns</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentNotifications.map((notif) => (
              <div key={notif.id} className="p-3 rounded-lg bg-muted/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{notif.title}</span>
                  <span className="text-xs text-muted-foreground">{notif.sentAt}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Send className="h-3 w-3" />
                    {notif.sent.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    {((notif.opened / notif.sent) * 100).toFixed(0)}% opened
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    {((notif.clicked / notif.sent) * 100).toFixed(0)}% CTR
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
