import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";

interface ScheduledReport {
  id: string;
  name: string;
  reportType: string;
  frequency: "daily" | "weekly" | "monthly";
  recipients: string[];
  format: "csv" | "pdf" | "xlsx";
  isActive: boolean;
  lastRun: Date | null;
  nextRun: Date;
  createdAt: Date;
}

const mockSchedules: ScheduledReport[] = [
  {
    id: "1",
    name: "Daily Revenue Summary",
    reportType: "revenue-summary",
    frequency: "daily",
    recipients: ["admin@zivo.app", "finance@zivo.app"],
    format: "csv",
    isActive: true,
    lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000),
    nextRun: new Date(Date.now() + 12 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  },
  {
    id: "2",
    name: "Weekly Driver Performance",
    reportType: "driver-performance",
    frequency: "weekly",
    recipients: ["ops@zivo.app"],
    format: "pdf",
    isActive: true,
    lastRun: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    nextRun: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
  },
  {
    id: "3",
    name: "Monthly User Growth",
    reportType: "user-growth",
    frequency: "monthly",
    recipients: ["ceo@zivo.app", "marketing@zivo.app"],
    format: "xlsx",
    isActive: false,
    lastRun: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
    nextRun: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
  },
];

const reportTypes = [
  { value: "revenue-summary", label: "Revenue Summary" },
  { value: "driver-performance", label: "Driver Performance" },
  { value: "user-growth", label: "User Growth" },
  { value: "trip-analytics", label: "Trip Analytics" },
  { value: "restaurant-report", label: "Restaurant Report" },
  { value: "payout-summary", label: "Payout Summary" },
];

const ScheduledReports = () => {
  const [schedules, setSchedules] = useState<ScheduledReport[]>(mockSchedules);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newSchedule, setNewSchedule] = useState<{
    name: string;
    reportType: string;
    frequency: "daily" | "weekly" | "monthly";
    recipients: string;
    format: "csv" | "pdf" | "xlsx";
  }>({
    name: "",
    reportType: "",
    frequency: "weekly",
    recipients: "",
    format: "csv",
  });

  const handleToggleActive = (id: string) => {
    setSchedules(schedules.map(s => 
      s.id === id ? { ...s, isActive: !s.isActive } : s
    ));
    toast.success("Schedule updated");
  };

  const handleDelete = (id: string) => {
    setSchedules(schedules.filter(s => s.id !== id));
    toast.success("Schedule deleted");
  };

  const handleRunNow = (schedule: ScheduledReport) => {
    toast.success(`Running ${schedule.name}...`);
  };

  const handleCreate = () => {
    const schedule: ScheduledReport = {
      id: Date.now().toString(),
      name: newSchedule.name,
      reportType: newSchedule.reportType,
      frequency: newSchedule.frequency,
      recipients: newSchedule.recipients.split(",").map(e => e.trim()),
      format: newSchedule.format,
      isActive: true,
      lastRun: null,
      nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    };
    setSchedules([schedule, ...schedules]);
    setIsCreateOpen(false);
    setNewSchedule({ name: "", reportType: "", frequency: "weekly", recipients: "", format: "csv" });
    toast.success("Schedule created");
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case "daily": return "bg-blue-500/10 text-blue-500";
      case "weekly": return "bg-green-500/10 text-green-500";
      case "monthly": return "bg-purple-500/10 text-purple-500";
      default: return "bg-slate-500/10 text-slate-500";
    }
  };

  const activeCount = schedules.filter(s => s.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10">
            <Calendar className="h-5 w-5 text-cyan-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Scheduled Reports</h2>
            <p className="text-sm text-muted-foreground">Automate report generation and delivery</p>
          </div>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          New Schedule
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-muted/30 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-500/10">
            <CheckCircle className="h-4 w-4 text-green-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-xl font-bold">{activeCount}</p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-muted/30 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10">
            <Pause className="h-4 w-4 text-amber-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Paused</p>
            <p className="text-xl font-bold">{schedules.length - activeCount}</p>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-muted/30 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <FileText className="h-4 w-4 text-blue-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-xl font-bold">{schedules.length}</p>
          </div>
        </div>
      </div>

      {/* Schedules List */}
      <div className="space-y-3">
        {schedules.map((schedule) => (
          <Card key={schedule.id} className={cn(
            "border-0 bg-card/50 backdrop-blur-xl transition-opacity",
            !schedule.isActive && "opacity-60"
          )}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-2 rounded-lg",
                    schedule.isActive ? "bg-primary/10" : "bg-muted"
                  )}>
                    <FileText className={cn(
                      "h-5 w-5",
                      schedule.isActive ? "text-primary" : "text-muted-foreground"
                    )} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{schedule.name}</h3>
                      <Badge className={cn("text-xs capitalize", getFrequencyColor(schedule.frequency))}>
                        {schedule.frequency}
                      </Badge>
                      <Badge variant="outline" className="text-xs uppercase">
                        {schedule.format}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                          <RefreshCw className="h-3 w-3" />
                          Last: {format(schedule.lastRun, "MMM d")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRunNow(schedule)}
                    className="gap-1"
                  >
                    <Send className="h-4 w-4" />
                    Run Now
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
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

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

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="border-0 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Schedule Report
            </DialogTitle>
            <DialogDescription>Set up automatic report generation</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Schedule Name</Label>
              <Input 
                placeholder="e.g., Weekly Revenue Report"
                value={newSchedule.name}
                onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select 
                value={newSchedule.reportType} 
                onValueChange={(v) => setNewSchedule({ ...newSchedule, reportType: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select 
                  value={newSchedule.frequency} 
                  onValueChange={(v: "daily" | "weekly" | "monthly") => setNewSchedule({ ...newSchedule, frequency: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Format</Label>
                <Select 
                  value={newSchedule.format} 
                  onValueChange={(v: "csv" | "pdf" | "xlsx") => setNewSchedule({ ...newSchedule, format: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="xlsx">Excel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Recipients (comma-separated emails)</Label>
              <Input 
                placeholder="email1@example.com, email2@example.com"
                value={newSchedule.recipients}
                onChange={(e) => setNewSchedule({ ...newSchedule, recipients: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleCreate} 
              disabled={!newSchedule.name || !newSchedule.reportType || !newSchedule.recipients}
            >
              Create Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScheduledReports;
