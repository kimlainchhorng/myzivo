import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Shield, Search, Download, Trash2, Eye, 
  Lock, FileText, Clock, CheckCircle2, AlertTriangle
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const dataRequests = [
  { id: "REQ-001", user: "john@example.com", type: "export", status: "completed", requestedAt: "2024-01-15", completedAt: "2024-01-15" },
  { id: "REQ-002", user: "sarah@example.com", type: "deletion", status: "pending", requestedAt: "2024-01-14", completedAt: null },
  { id: "REQ-003", user: "mike@example.com", type: "export", status: "processing", requestedAt: "2024-01-13", completedAt: null },
  { id: "REQ-004", user: "emma@example.com", type: "deletion", status: "completed", requestedAt: "2024-01-12", completedAt: "2024-01-14" },
  { id: "REQ-005", user: "david@example.com", type: "access", status: "completed", requestedAt: "2024-01-10", completedAt: "2024-01-10" },
];

const consentStats = [
  { type: "Marketing Emails", consented: 78000, declined: 22000 },
  { type: "Push Notifications", consented: 85000, declined: 15000 },
  { type: "Data Analytics", consented: 92000, declined: 8000 },
  { type: "Location Tracking", consented: 95000, declined: 5000 },
  { type: "Third-Party Sharing", consented: 45000, declined: 55000 },
];

export default function AdminDataPrivacy() {
  const [searchQuery, setSearchQuery] = useState("");

  const pendingRequests = 5;
  const processedThisMonth = 42;
  const avgProcessingTime = "1.2 days";
  const complianceScore = 98;

  const getTypeBadge = (type: string) => {
    const config: Record<string, { icon: React.ReactNode; class: string }> = {
      export: { icon: <Download className="h-3 w-3" />, class: "bg-blue-500/10 text-blue-500" },
      deletion: { icon: <Trash2 className="h-3 w-3" />, class: "bg-red-500/10 text-red-500" },
      access: { icon: <Eye className="h-3 w-3" />, class: "bg-purple-500/10 text-purple-500" }
    };
    return (
      <Badge className={config[type].class}>
        {config[type].icon}
        <span className="ml-1 capitalize">{type}</span>
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { icon: React.ReactNode; class: string }> = {
      pending: { icon: <Clock className="h-3 w-3" />, class: "bg-amber-500/10 text-amber-500" },
      processing: { icon: <Clock className="h-3 w-3 animate-spin" />, class: "bg-blue-500/10 text-blue-500" },
      completed: { icon: <CheckCircle2 className="h-3 w-3" />, class: "bg-green-500/10 text-green-500" }
    };
    return (
      <Badge className={config[status].class}>
        {config[status].icon}
        <span className="ml-1 capitalize">{status}</span>
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Data Privacy Center
          </h2>
          <p className="text-muted-foreground">GDPR/CCPA compliance and data requests</p>
        </div>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          Privacy Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingRequests}</p>
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
                <p className="text-sm text-muted-foreground">Processed (Month)</p>
                <p className="text-2xl font-bold">{processedThisMonth}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Processing</p>
                <p className="text-2xl font-bold">{avgProcessingTime}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Compliance</p>
                <p className="text-2xl font-bold">{complianceScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="requests">
        <TabsList>
          <TabsTrigger value="requests">Data Requests</TabsTrigger>
          <TabsTrigger value="consent">Consent Management</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Requests</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search by email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead className="w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dataRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-mono">{request.id}</TableCell>
                      <TableCell>{request.user}</TableCell>
                      <TableCell>{getTypeBadge(request.type)}</TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>{request.requestedAt}</TableCell>
                      <TableCell>{request.completedAt || "-"}</TableCell>
                      <TableCell>
                        {request.status === "pending" && (
                          <Button size="sm">Process</Button>
                        )}
                        {request.status === "completed" && request.type === "export" && (
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consent" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Consent Statistics</CardTitle>
              <CardDescription>User consent rates by category</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {consentStats.map((stat) => (
                <div key={stat.type} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{stat.type}</span>
                    <span className="text-sm text-muted-foreground">
                      {((stat.consented / (stat.consented + stat.declined)) * 100).toFixed(1)}% consent rate
                    </span>
                  </div>
                  <div className="flex h-3 rounded-full overflow-hidden bg-muted">
                    <div 
                      className="bg-green-500" 
                      style={{ width: `${(stat.consented / (stat.consented + stat.declined)) * 100}%` }}
                    />
                    <div className="bg-red-500 flex-1" />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span className="text-green-500">{stat.consented.toLocaleString()} consented</span>
                    <span className="text-red-500">{stat.declined.toLocaleString()} declined</span>
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
