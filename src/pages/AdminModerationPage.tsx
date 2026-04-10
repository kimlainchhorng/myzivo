import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowLeft, Shield, Users, Flag, AlertTriangle, CheckCircle, XCircle,
  Search, Eye, Ban, BarChart3, TrendingUp, Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface Report {
  id: string;
  type: "post" | "comment" | "user" | "marketplace";
  reason: string;
  reporter: string;
  reported: string;
  content: string;
  status: "pending" | "resolved" | "dismissed";
  createdAt: string;
  severity: "low" | "medium" | "high";
}

const MOCK_REPORTS: Report[] = [
  { id: "1", type: "post", reason: "Spam", reporter: "User123", reported: "SpamBot99", content: "Buy followers cheap...", status: "pending", createdAt: "10m ago", severity: "high" },
  { id: "2", type: "comment", reason: "Harassment", reporter: "Sarah K.", reported: "TrollUser", content: "Offensive comment...", status: "pending", createdAt: "1h ago", severity: "high" },
  { id: "3", type: "user", reason: "Fake Account", reporter: "Mike R.", reported: "FakeProfile", content: "Impersonating a public figure", status: "pending", createdAt: "2h ago", severity: "medium" },
  { id: "4", type: "marketplace", reason: "Scam Listing", reporter: "Alex M.", reported: "ScamSeller", content: "Fake product listing", status: "pending", createdAt: "3h ago", severity: "high" },
  { id: "5", type: "post", reason: "Inappropriate", reporter: "Luna", reported: "User456", content: "Violates community guidelines", status: "resolved", createdAt: "1d ago", severity: "medium" },
  { id: "6", type: "comment", reason: "Hate Speech", reporter: "Tom L.", reported: "BadActor", content: "Discriminatory language", status: "resolved", createdAt: "2d ago", severity: "high" },
];

const STATS = [
  { label: "Pending Reports", value: "24", icon: Clock, color: "text-yellow-500" },
  { label: "Resolved Today", value: "18", icon: CheckCircle, color: "text-green-500" },
  { label: "Active Users", value: "12.4k", icon: Users, color: "text-primary" },
  { label: "Flagged Content", value: "7", icon: AlertTriangle, color: "text-red-500" },
];

export default function AdminModerationPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState(MOCK_REPORTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("reports");

  const pendingReports = reports.filter(r => r.status === "pending");
  const resolvedReports = reports.filter(r => r.status !== "pending");

  const handleAction = (id: string, action: "resolved" | "dismissed") => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: action } : r));
  };

  const severityColor = (s: string) => s === "high" ? "destructive" : s === "medium" ? "default" : "secondary";

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 safe-area-top z-10 bg-background/95 backdrop-blur-sm border-b border-border p-4">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Shield className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Admin & Moderation</h1>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 p-4">
        {STATS.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4">
        <TabsList className="w-full">
          <TabsTrigger value="reports" className="flex-1 gap-1">
            <Flag className="h-3 w-3" /> Reports {pendingReports.length > 0 && <Badge variant="destructive" className="text-xs ml-1">{pendingReports.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="users" className="flex-1 gap-1">
            <Users className="h-3 w-3" /> Users
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex-1 gap-1">
            <BarChart3 className="h-3 w-3" /> Overview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="mt-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search reports..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>

          <h3 className="text-sm font-semibold text-muted-foreground">Pending ({pendingReports.length})</h3>
          {pendingReports.map((report) => (
            <Card key={report.id} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant={severityColor(report.severity)} className="text-xs">{report.severity}</Badge>
                  <Badge variant="outline" className="text-xs">{report.type}</Badge>
                </div>
                <span className="text-xs text-muted-foreground">{report.createdAt}</span>
              </div>
              <p className="text-sm font-medium text-foreground mb-1">{report.reason}</p>
              <p className="text-xs text-muted-foreground mb-1">Reported: <span className="text-foreground">{report.reported}</span> by {report.reporter}</p>
              <p className="text-xs text-muted-foreground italic mb-3">"{report.content}"</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => handleAction(report.id, "resolved")}>
                  <CheckCircle className="h-3 w-3" /> Resolve
                </Button>
                <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => handleAction(report.id, "dismissed")}>
                  <XCircle className="h-3 w-3" /> Dismiss
                </Button>
                <Button size="sm" variant="destructive" className="gap-1">
                  <Ban className="h-3 w-3" /> Ban
                </Button>
              </div>
            </Card>
          ))}

          {resolvedReports.length > 0 && (
            <>
              <h3 className="text-sm font-semibold text-muted-foreground mt-6">Resolved ({resolvedReports.length})</h3>
              {resolvedReports.map((report) => (
                <Card key={report.id} className="p-4 opacity-60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{report.type}</Badge>
                      <span className="text-sm text-foreground">{report.reason}</span>
                    </div>
                    <Badge variant={report.status === "resolved" ? "default" : "secondary"} className="text-xs">{report.status}</Badge>
                  </div>
                </Card>
              ))}
            </>
          )}
        </TabsContent>

        <TabsContent value="users" className="mt-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search users..." className="pl-9" />
          </div>
          {["Alex Morgan", "Sarah Kim", "Mike Ross", "DJ Nova", "Priya S."].map((name, i) => (
            <Card key={i} className="p-3 flex items-center gap-3">
              <Avatar><AvatarFallback className="bg-primary/20 text-primary">{name[0]}</AvatarFallback></Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{name}</p>
                <p className="text-xs text-muted-foreground">Active · 0 reports</p>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost"><Eye className="h-3 w-3" /></Button>
                <Button size="sm" variant="ghost"><Ban className="h-3 w-3" /></Button>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="analytics" className="mt-4 space-y-4">
          <Card className="p-4">
            <CardHeader className="p-0 pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Platform Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-3">
              {[
                { label: "Total Users", value: "12,450", change: "+8.2%" },
                { label: "Active Today", value: "3,240", change: "+12.1%" },
                { label: "Posts Created", value: "1,890", change: "+5.4%" },
                { label: "Reports Rate", value: "0.3%", change: "-15.2%" },
                { label: "Avg Session", value: "14m", change: "+3.1%" },
              ].map((metric) => (
                <div key={metric.label} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{metric.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{metric.value}</span>
                    <span className={`text-xs ${metric.change.startsWith("+") ? "text-green-500" : "text-red-500"}`}>{metric.change}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
