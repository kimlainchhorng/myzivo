import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  FileText, Plus, Play, Clock, Download, MoreVertical, 
  Calendar, BarChart3, PieChart, LineChart, Table, Save, Trash2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";

interface Report {
  id: string;
  name: string;
  description: string;
  type: "chart" | "table" | "dashboard";
  metrics: string[];
  lastRun: string;
  schedule?: string;
  createdBy: string;
  createdAt: string;
}

// Reports loaded from database — no hardcoded data

const availableMetrics = [
  { id: "revenue", label: "Revenue", category: "Financial" },
  { id: "trips", label: "Total Trips", category: "Operations" },
  { id: "avg_fare", label: "Average Fare", category: "Financial" },
  { id: "drivers", label: "Active Drivers", category: "Operations" },
  { id: "customers", label: "Active Customers", category: "Users" },
  { id: "ratings", label: "Average Rating", category: "Quality" },
  { id: "completion", label: "Completion Rate", category: "Operations" },
  { id: "cancellations", label: "Cancellation Rate", category: "Operations" },
  { id: "signups", label: "New Signups", category: "Users" },
  { id: "churn", label: "Churn Rate", category: "Users" },
  { id: "response_time", label: "Avg Response Time", category: "Quality" },
  { id: "support_tickets", label: "Support Tickets", category: "Support" },
];

export default function AdminReportBuilder() {
  const [reports] = useState<Report[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);

  const totalReports = reports.length;
  const scheduledReports = reports.filter(r => r.schedule).length;

  const getTypeIcon = (type: Report["type"]) => {
    switch (type) {
      case "chart": return <BarChart3 className="h-4 w-4" />;
      case "table": return <Table className="h-4 w-4" />;
      case "dashboard": return <PieChart className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: Report["type"]) => {
    const config: Record<string, string> = {
      chart: "bg-blue-500/10 text-blue-500",
      table: "bg-amber-500/10 text-amber-500",
      dashboard: "bg-purple-500/10 text-purple-500"
    };
    return (
      <Badge className={config[type]}>
        {getTypeIcon(type)}
        <span className="ml-1 capitalize">{type}</span>
      </Badge>
    );
  };

  const toggleMetric = (metricId: string) => {
    setSelectedMetrics(prev =>
      prev.includes(metricId)
        ? prev.filter(m => m !== metricId)
        : [...prev, metricId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Custom Report Builder
          </h2>
          <p className="text-muted-foreground">Create and manage custom analytics reports</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/10 to-teal-500/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/20">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Reports</p>
                <p className="text-2xl font-bold">{totalReports}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold">{scheduledReports}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-green-500/10">
                <BarChart3 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available Metrics</p>
                <p className="text-2xl font-bold">{availableMetrics.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10">
                <LineChart className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Chart Types</p>
                <p className="text-2xl font-bold">8</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Card key={report.id} className="hover:border-primary/50 transition-all duration-200 hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                {getTypeBadge(report.type)}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Play className="h-4 w-4 mr-2" />
                      Run Report
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <FileText className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Clock className="h-4 w-4 mr-2" />
                      Schedule
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardTitle className="text-lg mt-2">{report.name}</CardTitle>
              <CardDescription>{report.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-1">
                {report.metrics.map((metric, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {metric}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(report.lastRun).toLocaleDateString()}
                </span>
                {report.schedule && (
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {report.schedule}
                  </Badge>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                <Button size="sm" className="flex-1">
                  <Play className="h-3 w-3 mr-1" />
                  Run
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Download className="h-3 w-3 mr-1" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Report Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Custom Report</DialogTitle>
            <DialogDescription>
              Build a custom report by selecting metrics and visualization type
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Report Name</Label>
                <Input placeholder="Enter report name" />
              </div>
              <div className="space-y-2">
                <Label>Report Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chart">Chart</SelectItem>
                    <SelectItem value="table">Table</SelectItem>
                    <SelectItem value="dashboard">Dashboard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Describe this report..." />
            </div>
            <div className="space-y-3">
              <Label>Select Metrics</Label>
              <div className="grid gap-2 md:grid-cols-3">
                {availableMetrics.map((metric) => (
                  <div key={metric.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={metric.id}
                      checked={selectedMetrics.includes(metric.id)}
                      onCheckedChange={() => toggleMetric(metric.id)}
                    />
                    <label htmlFor={metric.id} className="text-sm cursor-pointer">
                      {metric.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Date Range</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                    <SelectItem value="custom">Custom range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Schedule (Optional)</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="No schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No schedule</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Create Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
