import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Shield, 
  AlertTriangle, 
  MessageSquare, 
  Star, 
  Image, 
  Flag,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  TrendingUp,
  Users
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface ModerationItem {
  id: string;
  type: "review" | "message" | "photo" | "profile";
  content: string;
  reporter: string;
  reported: string;
  reason: string;
  severity: "low" | "medium" | "high" | "critical";
  timestamp: Date;
  status: "pending" | "approved" | "rejected";
}

const mockItems: ModerationItem[] = [
  {
    id: "1",
    type: "review",
    content: "This driver was extremely rude and made inappropriate comments during the ride.",
    reporter: "John D.",
    reported: "Driver #4521",
    reason: "Inappropriate behavior",
    severity: "high",
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    status: "pending",
  },
  {
    id: "2",
    type: "photo",
    content: "Profile photo flagged for potentially inappropriate content",
    reporter: "Auto-detection",
    reported: "User #8234",
    reason: "Image policy violation",
    severity: "medium",
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    status: "pending",
  },
  {
    id: "3",
    type: "message",
    content: "Driver sent promotional messages outside of the trip context",
    reporter: "Sarah M.",
    reported: "Driver #2156",
    reason: "Spam/Solicitation",
    severity: "low",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: "pending",
  },
  {
    id: "4",
    type: "review",
    content: "Review contains hate speech and discriminatory language",
    reporter: "Auto-detection",
    reported: "User #5678",
    reason: "Hate speech",
    severity: "critical",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    status: "pending",
  },
  {
    id: "5",
    type: "profile",
    content: "Profile bio contains contact information and external links",
    reporter: "Auto-detection",
    reported: "User #9012",
    reason: "Policy violation",
    severity: "low",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    status: "pending",
  },
];

const severityConfig = {
  low: { color: "text-blue-500", bg: "bg-blue-500/10", label: "Low" },
  medium: { color: "text-amber-500", bg: "bg-amber-500/10", label: "Medium" },
  high: { color: "text-orange-500", bg: "bg-orange-500/10", label: "High" },
  critical: { color: "text-red-500", bg: "bg-red-500/10", label: "Critical" },
};

const typeConfig = {
  review: { icon: Star, color: "text-amber-500", bg: "bg-amber-500/10" },
  message: { icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-500/10" },
  photo: { icon: Image, color: "text-purple-500", bg: "bg-purple-500/10" },
  profile: { icon: Users, color: "text-cyan-500", bg: "bg-cyan-500/10" },
};

const AdminContentModeration = () => {
  const [items, setItems] = useState(mockItems);
  const [activeTab, setActiveTab] = useState("all");

  const stats = {
    pending: items.filter(i => i.status === "pending").length,
    critical: items.filter(i => i.severity === "critical").length,
    todayProcessed: 47,
    avgResponseTime: "12m",
  };

  const handleAction = (id: string, action: "approve" | "reject") => {
    setItems(items.map(item => 
      item.id === id ? { ...item, status: action === "approve" ? "approved" : "rejected" } : item
    ));
  };

  const filteredItems = activeTab === "all" 
    ? items.filter(i => i.status === "pending")
    : items.filter(i => i.type === activeTab && i.status === "pending");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            Content Moderation
          </h1>
          <p className="text-muted-foreground mt-1">Review and moderate user-generated content</p>
        </div>
        <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20">
          <Flag className="h-3 w-3 mr-1" />
          {stats.pending} Pending Review
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Pending", value: stats.pending, icon: Clock, color: "amber" },
          { label: "Critical", value: stats.critical, icon: AlertTriangle, color: "red" },
          { label: "Processed Today", value: stats.todayProcessed, icon: CheckCircle, color: "green" },
          { label: "Avg Response", value: stats.avgResponseTime, icon: TrendingUp, color: "blue" },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-0 bg-card/50 backdrop-blur-xl">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    stat.color === "amber" && "bg-amber-500/10",
                    stat.color === "red" && "bg-red-500/10",
                    stat.color === "green" && "bg-green-500/10",
                    stat.color === "blue" && "bg-blue-500/10"
                  )}>
                    <stat.icon className={cn(
                      "h-5 w-5",
                      stat.color === "amber" && "text-amber-500",
                      stat.color === "red" && "text-red-500",
                      stat.color === "green" && "text-green-500",
                      stat.color === "blue" && "text-blue-500"
                    )} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Moderation Queue */}
      <Card className="border-0 bg-card/50 backdrop-blur-xl">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Flag className="h-5 w-5 text-primary" />
            Moderation Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="review">Reviews</TabsTrigger>
              <TabsTrigger value="message">Messages</TabsTrigger>
              <TabsTrigger value="photo">Photos</TabsTrigger>
              <TabsTrigger value="profile">Profiles</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {filteredItems.map((item, index) => {
                  const typeInfo = typeConfig[item.type];
                  const severityInfo = severityConfig[item.severity];
                  const TypeIcon = typeInfo.icon;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "p-4 rounded-xl border border-border/50 bg-background/50",
                        item.severity === "critical" && "border-red-500/30 bg-red-500/5"
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", typeInfo.bg)}>
                          <TypeIcon className={cn("h-5 w-5", typeInfo.color)} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <Badge variant="outline" className="capitalize text-xs">
                              {item.type}
                            </Badge>
                            <Badge className={cn("text-xs", severityInfo.bg, severityInfo.color, "border-transparent")}>
                              {severityInfo.label}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                            </span>
                          </div>

                          <p className="text-sm mb-2">{item.content}</p>

                          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-3">
                            <span>Reporter: <span className="text-foreground">{item.reporter}</span></span>
                            <span>Reported: <span className="text-foreground">{item.reported}</span></span>
                            <span>Reason: <span className="text-foreground">{item.reason}</span></span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 gap-1.5 text-green-500 hover:text-green-600 hover:bg-green-500/10"
                              onClick={() => handleAction(item.id, "approve")}
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 gap-1.5 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                              onClick={() => handleAction(item.id, "reject")}
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 gap-1.5"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {filteredItems.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No pending items in this category</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminContentModeration;
