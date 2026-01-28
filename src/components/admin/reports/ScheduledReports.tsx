import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  Mail, 
  FileText,
  Play,
  Pause,
  Send,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Edit,
  Eye,
  Download,
  Settings,
  Zap,
  BarChart3,
  Users,
  Car,
  DollarSign,
  TrendingUp,
  Utensils,
  FileSpreadsheet,
  Timer,
  CalendarClock,
  History
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, addDays, addWeeks, addMonths } from "date-fns";
import { toast } from "sonner";

interface ScheduledReport {
  id: string;
  name: string;
  description: string;
  reportType: string;
  frequency: "daily" | "weekly" | "monthly" | "quarterly";
  deliveryTime: string;
  deliveryDay?: number; // 0-6 for weekly (Sunday-Saturday), 1-31 for monthly
  recipients: string[];
  format: "csv" | "pdf" | "xlsx";
  isActive: boolean;
  lastRun: Date | null;
  lastRunStatus: "success" | "failed" | null;
  nextRun: Date;
  createdAt: Date;
  metrics: string[];
  includeCharts: boolean;
  customMessage?: string;
  runCount: number;
}

const reportTypes = [
  { value: "revenue-summary", label: "Revenue Summary", icon: DollarSign, color: "text-green-500 bg-green-500/10" },
  { value: "driver-performance", label: "Driver Performance", icon: Car, color: "text-blue-500 bg-blue-500/10" },
  { value: "user-growth", label: "User Growth", icon: Users, color: "text-purple-500 bg-purple-500/10" },
  { value: "trip-analytics", label: "Trip Analytics", icon: TrendingUp, color: "text-cyan-500 bg-cyan-500/10" },
  { value: "restaurant-report", label: "Restaurant Report", icon: Utensils, color: "text-amber-500 bg-amber-500/10" },
  { value: "payout-summary", label: "Payout Summary", icon: FileSpreadsheet, color: "text-rose-500 bg-rose-500/10" },
];

const availableMetrics: Record<string, string[]> = {
  "revenue-summary": ["Total Revenue", "Revenue by Service", "Commission Earned", "Refunds", "Net Profit", "MoM Growth"],
  "driver-performance": ["Active Drivers", "New Signups", "Avg Rating", "Trip Count", "Online Hours", "Acceptance Rate"],
  "user-growth": ["Total Users", "New Registrations", "Active Users", "Retention Rate", "Churn Rate", "Lifetime Value"],
  "trip-analytics": ["Total Trips", "Completed Trips", "Cancelled Trips", "Avg Duration", "Avg Distance", "Peak Hours"],
  "restaurant-report": ["Total Orders", "Revenue", "Avg Order Value", "Top Items", "Customer Ratings", "Delivery Time"],
  "payout-summary": ["Total Payouts", "Pending Payouts", "By Driver", "By Method", "Processing Time", "Failed Payouts"],
};

const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const mockSchedules: ScheduledReport[] = [
  {
    id: "1",
    name: "Daily Revenue Summary",
    description: "Complete revenue breakdown across all services",
    reportType: "revenue-summary",
    frequency: "daily",
    deliveryTime: "08:00",
    recipients: ["admin@zivo.app", "finance@zivo.app"],
    format: "csv",
    isActive: true,
    lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000),
    lastRunStatus: "success",
    nextRun: new Date(Date.now() + 12 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    metrics: ["Total Revenue", "Revenue by Service", "Commission Earned", "Net Profit"],
    includeCharts: true,
    runCount: 28,
  },
  {
    id: "2",
    name: "Weekly Driver Performance",
    description: "Driver activity and performance metrics",
    reportType: "driver-performance",
    frequency: "weekly",
    deliveryTime: "09:00",
    deliveryDay: 1, // Monday
    recipients: ["ops@zivo.app"],
    format: "pdf",
    isActive: true,
    lastRun: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    lastRunStatus: "success",
    nextRun: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    metrics: ["Active Drivers", "Avg Rating", "Trip Count", "Online Hours", "Acceptance Rate"],
    includeCharts: true,
    runCount: 8,
  },
  {
    id: "3",
    name: "Monthly User Growth Analysis",
    description: "User acquisition and retention metrics",
    reportType: "user-growth",
    frequency: "monthly",
    deliveryTime: "10:00",
    deliveryDay: 1, // 1st of month
    recipients: ["ceo@zivo.app", "marketing@zivo.app"],
    format: "xlsx",
    isActive: false,
    lastRun: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
    lastRunStatus: "failed",
    nextRun: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    metrics: ["Total Users", "New Registrations", "Retention Rate", "Churn Rate"],
    includeCharts: false,
    runCount: 2,
  },
  {
    id: "4",
    name: "Quarterly Business Review",
    description: "Comprehensive business performance overview",
    reportType: "revenue-summary",
    frequency: "quarterly",
    deliveryTime: "08:00",
    deliveryDay: 1,
    recipients: ["executives@zivo.app", "board@zivo.app"],
    format: "pdf",
    isActive: true,
    lastRun: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    lastRunStatus: "success",
    nextRun: addMonths(new Date(), 1),
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
    metrics: ["Total Revenue", "Revenue by Service", "Commission Earned", "Net Profit", "MoM Growth"],
    includeCharts: true,
    customMessage: "Please find attached the quarterly business review. Key highlights are summarized in the executive summary section.",
    runCount: 1,
  },
];

const ScheduledReports = () => {
  const [schedules, setSchedules] = useState<ScheduledReport[]>(mockSchedules);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduledReport | null>(null);
  const [previewSchedule, setPreviewSchedule] = useState<ScheduledReport | null>(null);
  const [newSchedule, setNewSchedule] = useState<{
    name: string;
    description: string;
    reportType: string;
    frequency: "daily" | "weekly" | "monthly" | "quarterly";
    deliveryTime: string;
    deliveryDay: number;
    recipients: string;
    format: "csv" | "pdf" | "xlsx";
    metrics: string[];
    includeCharts: boolean;
    customMessage: string;
  }>({
    name: "",
    description: "",
    reportType: "",
    frequency: "weekly",
    deliveryTime: "08:00",
    deliveryDay: 1,
    recipients: "",
    format: "csv",
    metrics: [],
    includeCharts: true,
    customMessage: "",
  });

  const handleToggleActive = (id: string) => {
    setSchedules(schedules.map(s => 
      s.id === id ? { ...s, isActive: !s.isActive } : s
    ));
    const schedule = schedules.find(s => s.id === id);
    toast.success(`Schedule ${schedule?.isActive ? "paused" : "activated"}`);
  };

  const handleDelete = (id: string) => {
    setSchedules(schedules.filter(s => s.id !== id));
    toast.success("Schedule deleted");
  };

  const handleRunNow = (schedule: ScheduledReport) => {
    toast.success(`Generating "${schedule.name}"...`, {
      description: "Report will be sent to recipients shortly",
    });
    setSchedules(schedules.map(s => 
      s.id === schedule.id 
        ? { ...s, lastRun: new Date(), lastRunStatus: "success" as const, runCount: s.runCount + 1 } 
        : s
    ));
  };

  const calculateNextRun = (frequency: string, deliveryTime: string, deliveryDay: number) => {
    const now = new Date();
    const [hours, minutes] = deliveryTime.split(":").map(Number);
    
    switch (frequency) {
      case "daily":
        return addDays(now, 1);
      case "weekly":
        return addWeeks(now, 1);
      case "monthly":
        return addMonths(now, 1);
      case "quarterly":
        return addMonths(now, 3);
      default:
        return addDays(now, 1);
    }
  };

  const handleCreate = () => {
    if (!newSchedule.name || !newSchedule.reportType || !newSchedule.recipients || newSchedule.metrics.length === 0) {
      toast.error("Please fill in all required fields and select at least one metric");
      return;
    }

    const schedule: ScheduledReport = {
      id: Date.now().toString(),
      name: newSchedule.name,
      description: newSchedule.description,
      reportType: newSchedule.reportType,
      frequency: newSchedule.frequency,
      deliveryTime: newSchedule.deliveryTime,
      deliveryDay: newSchedule.deliveryDay,
      recipients: newSchedule.recipients.split(",").map(e => e.trim()),
      format: newSchedule.format,
      isActive: true,
      lastRun: null,
      lastRunStatus: null,
      nextRun: calculateNextRun(newSchedule.frequency, newSchedule.deliveryTime, newSchedule.deliveryDay),
      createdAt: new Date(),
      metrics: newSchedule.metrics,
      includeCharts: newSchedule.includeCharts,
      customMessage: newSchedule.customMessage || undefined,
      runCount: 0,
    };
    
    setSchedules([schedule, ...schedules]);
    setIsCreateOpen(false);
    resetNewSchedule();
    toast.success("Report schedule created successfully!");
  };

  const resetNewSchedule = () => {
    setNewSchedule({
      name: "",
      description: "",
      reportType: "",
      frequency: "weekly",
      deliveryTime: "08:00",
      deliveryDay: 1,
      recipients: "",
      format: "csv",
      metrics: [],
      includeCharts: true,
      customMessage: "",
    });
  };

  const toggleMetric = (metric: string) => {
    setNewSchedule(prev => ({
      ...prev,
      metrics: prev.metrics.includes(metric)
        ? prev.metrics.filter(m => m !== metric)
        : [...prev.metrics, metric],
    }));
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case "daily": return "bg-blue-500/10 text-blue-500 border-blue-500/30";
      case "weekly": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/30";
      case "monthly": return "bg-violet-500/10 text-violet-500 border-violet-500/30";
      case "quarterly": return "bg-amber-500/10 text-amber-500 border-amber-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "csv": return <FileSpreadsheet className="h-3 w-3" />;
      case "pdf": return <FileText className="h-3 w-3" />;
      case "xlsx": return <FileSpreadsheet className="h-3 w-3" />;
      default: return <FileText className="h-3 w-3" />;
    }
  };

  const getReportType = (typeValue: string) => reportTypes.find(t => t.value === typeValue);

  const activeCount = schedules.filter(s => s.isActive).length;
  const totalRecipients = schedules.reduce((acc, s) => acc + s.recipients.length, 0);
  const totalRuns = schedules.reduce((acc, s) => acc + s.runCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10">
            <CalendarClock className="h-5 w-5 text-cyan-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Scheduled Reports</h2>
            <p className="text-sm text-muted-foreground">Automate report generation and email delivery</p>
          </div>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          New Schedule
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{schedules.length}</p>
              <p className="text-xs text-muted-foreground">Total Schedules</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeCount}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Mail className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalRecipients}</p>
              <p className="text-xs text-muted-foreground">Recipients</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-card/50 backdrop-blur-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-500/10">
              <History className="h-5 w-5 text-violet-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalRuns}</p>
              <p className="text-xs text-muted-foreground">Reports Sent</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schedules List */}
      <Card className="border-0 bg-card/50 backdrop-blur-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Active Schedules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[450px] pr-4">
            <div className="space-y-3">
              {schedules.map((schedule) => {
                const reportType = getReportType(schedule.reportType);
                const Icon = reportType?.icon || FileText;
                
                return (
                  <Card key={schedule.id} className={cn(
                    "transition-all border",
                    !schedule.isActive && "opacity-50"
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div className={cn("p-2.5 rounded-xl shrink-0", reportType?.color || "bg-primary/10")}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h3 className="font-semibold truncate">{schedule.name}</h3>
                              <Badge variant="outline" className={cn("text-xs capitalize", getFrequencyColor(schedule.frequency))}>
                                {schedule.frequency}
                              </Badge>
                              <Badge variant="outline" className="text-xs uppercase gap-1">
                                {getFormatIcon(schedule.format)}
                                {schedule.format}
                              </Badge>
                              {schedule.isActive ? (
                                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-xs">
                                  Active
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs">Paused</Badge>
                              )}
                            </div>
                            
                            {schedule.description && (
                              <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                                {schedule.description}
                              </p>
                            )}
                            
                            <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                              <span className="flex items-center gap-1">
                                <Timer className="h-3 w-3" />
                                {schedule.deliveryTime}
                                {schedule.frequency === "weekly" && schedule.deliveryDay !== undefined && (
                                  <span className="text-muted-foreground/70">
                                    ({weekDays[schedule.deliveryDay]})
                                  </span>
                                )}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Next: {format(schedule.nextRun, "MMM d, h:mm a")}
                              </span>
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {schedule.recipients.length} recipient{schedule.recipients.length > 1 ? "s" : ""}
                              </span>
                              {schedule.lastRun && (
                                <span className="flex items-center gap-1">
                                  {schedule.lastRunStatus === "success" ? (
                                    <CheckCircle className="h-3 w-3 text-emerald-500" />
                                  ) : (
                                    <AlertCircle className="h-3 w-3 text-destructive" />
                                  )}
                                  Last: {format(schedule.lastRun, "MMM d")}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex flex-wrap gap-1 mt-2">
                              {schedule.metrics.slice(0, 3).map(metric => (
                                <Badge key={metric} variant="secondary" className="text-xs font-normal">
                                  {metric}
                                </Badge>
                              ))}
                              {schedule.metrics.length > 3 && (
                                <Badge variant="secondary" className="text-xs font-normal">
                                  +{schedule.metrics.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setPreviewSchedule(schedule)}
                            title="Preview"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleRunNow(schedule)}
                            title="Run now"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                          <Switch 
                            checked={schedule.isActive}
                            onCheckedChange={() => handleToggleActive(schedule.id)}
                          />
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDelete(schedule.id)}
                            className="text-destructive hover:text-destructive"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {schedules.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No scheduled reports</p>
                  <Button variant="outline" className="mt-4" onClick={() => setIsCreateOpen(true)}>
                    Create your first schedule
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (!open) resetNewSchedule(); }}>
        <DialogContent className="max-w-2xl border-0 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-primary" />
              Schedule Automated Report
            </DialogTitle>
            <DialogDescription>Configure report generation and email delivery</DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-5 py-4 pr-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Schedule Name *</Label>
                  <Input 
                    placeholder="e.g., Weekly Revenue Report"
                    value={newSchedule.name}
                    onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Report Type *</Label>
                  <Select 
                    value={newSchedule.reportType} 
                    onValueChange={(v) => setNewSchedule({ ...newSchedule, reportType: v, metrics: [] })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      {reportTypes.map(type => {
                        const Icon = type.icon;
                        return (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input 
                  placeholder="Brief description of the report"
                  value={newSchedule.description}
                  onChange={(e) => setNewSchedule({ ...newSchedule, description: e.target.value })}
                />
              </div>

              {/* Schedule */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Frequency *</Label>
                  <Select 
                    value={newSchedule.frequency} 
                    onValueChange={(v: "daily" | "weekly" | "monthly" | "quarterly") => setNewSchedule({ ...newSchedule, frequency: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {newSchedule.frequency === "weekly" && (
                  <div className="space-y-2">
                    <Label>Day of Week</Label>
                    <Select 
                      value={newSchedule.deliveryDay.toString()} 
                      onValueChange={(v) => setNewSchedule({ ...newSchedule, deliveryDay: parseInt(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {weekDays.map((day, i) => (
                          <SelectItem key={i} value={i.toString()}>{day}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {(newSchedule.frequency === "monthly" || newSchedule.frequency === "quarterly") && (
                  <div className="space-y-2">
                    <Label>Day of Month</Label>
                    <Select 
                      value={newSchedule.deliveryDay.toString()} 
                      onValueChange={(v) => setNewSchedule({ ...newSchedule, deliveryDay: parseInt(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 28 }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {i + 1}{i === 0 ? "st" : i === 1 ? "nd" : i === 2 ? "rd" : "th"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label>Delivery Time</Label>
                  <Select 
                    value={newSchedule.deliveryTime} 
                    onValueChange={(v) => setNewSchedule({ ...newSchedule, deliveryTime: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "14:00", "16:00", "18:00"].map(time => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Format & Recipients */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Export Format *</Label>
                  <Select 
                    value={newSchedule.format} 
                    onValueChange={(v: "csv" | "pdf" | "xlsx") => setNewSchedule({ ...newSchedule, format: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV (Spreadsheet)</SelectItem>
                      <SelectItem value="pdf">PDF (Document)</SelectItem>
                      <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-3 pt-7">
                  <Checkbox
                    id="includeCharts"
                    checked={newSchedule.includeCharts}
                    onCheckedChange={(checked) => setNewSchedule({ ...newSchedule, includeCharts: !!checked })}
                  />
                  <Label htmlFor="includeCharts" className="cursor-pointer">Include visual charts</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Recipients * (comma-separated emails)</Label>
                <Input 
                  placeholder="email1@example.com, email2@example.com"
                  value={newSchedule.recipients}
                  onChange={(e) => setNewSchedule({ ...newSchedule, recipients: e.target.value })}
                />
              </div>

              {/* Metrics Selection */}
              {newSchedule.reportType && (
                <div className="space-y-2">
                  <Label>Select Metrics * (at least 1)</Label>
                  <Card className="border-dashed">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {availableMetrics[newSchedule.reportType]?.map(metric => (
                          <div key={metric} className="flex items-center space-x-2">
                            <Checkbox
                              id={metric}
                              checked={newSchedule.metrics.includes(metric)}
                              onCheckedChange={() => toggleMetric(metric)}
                            />
                            <label htmlFor={metric} className="text-sm cursor-pointer">
                              {metric}
                            </label>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Custom Message */}
              <div className="space-y-2">
                <Label>Custom Email Message (optional)</Label>
                <Textarea 
                  placeholder="Add a personalized message to include in the email..."
                  value={newSchedule.customMessage}
                  onChange={(e) => setNewSchedule({ ...newSchedule, customMessage: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          </ScrollArea>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleCreate} 
              disabled={!newSchedule.name || !newSchedule.reportType || !newSchedule.recipients || newSchedule.metrics.length === 0}
              className="gap-2"
            >
              <Zap className="h-4 w-4" />
              Create Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewSchedule} onOpenChange={() => setPreviewSchedule(null)}>
        <DialogContent className="max-w-lg border-0 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Schedule Preview
            </DialogTitle>
          </DialogHeader>
          
          {previewSchedule && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3">
                {(() => {
                  const reportType = getReportType(previewSchedule.reportType);
                  const Icon = reportType?.icon || FileText;
                  return (
                    <div className={cn("p-3 rounded-xl", reportType?.color || "bg-primary/10")}>
                      <Icon className="h-6 w-6" />
                    </div>
                  );
                })()}
                <div>
                  <h3 className="font-semibold text-lg">{previewSchedule.name}</h3>
                  <p className="text-sm text-muted-foreground">{previewSchedule.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-muted-foreground text-xs mb-1">Frequency</p>
                  <p className="font-medium capitalize">{previewSchedule.frequency}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-muted-foreground text-xs mb-1">Delivery Time</p>
                  <p className="font-medium">{previewSchedule.deliveryTime}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-muted-foreground text-xs mb-1">Format</p>
                  <p className="font-medium uppercase">{previewSchedule.format}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-muted-foreground text-xs mb-1">Reports Sent</p>
                  <p className="font-medium">{previewSchedule.runCount}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Recipients</p>
                <div className="flex flex-wrap gap-2">
                  {previewSchedule.recipients.map(email => (
                    <Badge key={email} variant="secondary">{email}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Included Metrics</p>
                <div className="flex flex-wrap gap-2">
                  {previewSchedule.metrics.map(metric => (
                    <Badge key={metric} variant="outline">{metric}</Badge>
                  ))}
                </div>
              </div>

              {previewSchedule.customMessage && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Custom Message</p>
                  <p className="text-sm bg-muted/30 p-3 rounded-lg italic">
                    "{previewSchedule.customMessage}"
                  </p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewSchedule(null)}>Close</Button>
            {previewSchedule && (
              <Button onClick={() => { handleRunNow(previewSchedule); setPreviewSchedule(null); }} className="gap-2">
                <Send className="h-4 w-4" />
                Run Now
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScheduledReports;
