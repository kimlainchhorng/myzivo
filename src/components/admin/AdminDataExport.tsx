import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Download, 
  FileSpreadsheet, 
  FileText,
  Database,
  Calendar,
  Clock,
  CheckCircle2,
  Loader2,
  FileJson,
  Users,
  Car,
  DollarSign,
  MapPin,
  Utensils,
  History,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ExportJob {
  id: string;
  name: string;
  dataType: string;
  format: "csv" | "xlsx" | "json" | "pdf";
  status: "completed" | "processing" | "queued";
  createdAt: string;
  completedAt?: string;
  fileSize?: string;
  records?: number;
}

const recentExports: ExportJob[] = [
  {
    id: "1",
    name: "Monthly Driver Report",
    dataType: "Drivers",
    format: "xlsx",
    status: "completed",
    createdAt: "2024-01-28T14:30:00",
    completedAt: "2024-01-28T14:32:00",
    fileSize: "2.4 MB",
    records: 1850,
  },
  {
    id: "2",
    name: "Q4 Revenue Analysis",
    dataType: "Transactions",
    format: "csv",
    status: "completed",
    createdAt: "2024-01-27T09:00:00",
    completedAt: "2024-01-27T09:05:00",
    fileSize: "8.1 MB",
    records: 45200,
  },
  {
    id: "3",
    name: "Customer Export",
    dataType: "Users",
    format: "json",
    status: "processing",
    createdAt: "2024-01-29T10:15:00",
    records: 12500,
  },
  {
    id: "4",
    name: "Trip History Backup",
    dataType: "Trips",
    format: "csv",
    status: "queued",
    createdAt: "2024-01-29T10:20:00",
  },
];

const dataTypes = [
  { id: "users", label: "Users & Customers", icon: Users, count: "15.2K" },
  { id: "drivers", label: "Drivers", icon: Car, count: "1.8K" },
  { id: "trips", label: "Trips & Rides", icon: MapPin, count: "125K" },
  { id: "transactions", label: "Transactions", icon: DollarSign, count: "89K" },
  { id: "orders", label: "Food Orders", icon: Utensils, count: "45K" },
  { id: "analytics", label: "Analytics Data", icon: Database, count: "250K" },
];

const formatIcons = {
  csv: FileSpreadsheet,
  xlsx: FileSpreadsheet,
  json: FileJson,
  pdf: FileText,
};

const AdminDataExport = () => {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedFormat, setSelectedFormat] = useState("csv");
  const [dateRange, setDateRange] = useState("30d");

  const toggleType = (typeId: string) => {
    setSelectedTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(t => t !== typeId)
        : [...prev, typeId]
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500">
              <Download className="h-5 w-5 text-white" />
            </div>
            Data Export Center
          </h2>
          <p className="text-muted-foreground mt-1">Export and download platform data</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Export Builder */}
        <Card className="lg:col-span-2 border-0 bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: "100ms" }}>
          <CardHeader>
            <CardTitle className="text-lg">Create Export</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Data Types */}
            <div>
              <label className="text-sm font-medium mb-3 block">Select Data Types</label>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {dataTypes.map((type, index) => {
                  const Icon = type.icon;
                  const isSelected = selectedTypes.includes(type.id);
                  return (
                    <button
                      key={type.id}
                      onClick={() => toggleType(type.id)}
                      className={cn(
                        "p-4 rounded-xl border transition-all text-left animate-in fade-in zoom-in-95 duration-200",
                        isSelected 
                          ? "border-primary bg-primary/5" 
                          : "border-border/50 hover:border-border"
                      )}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-lg",
                          isSelected ? "bg-primary/10" : "bg-muted/50"
                        )}>
                          <Icon className={cn(
                            "h-4 w-4",
                            isSelected ? "text-primary" : "text-muted-foreground"
                          )} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{type.label}</p>
                          <p className="text-xs text-muted-foreground">{type.count} records</p>
                        </div>
                        <Checkbox checked={isSelected} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Options */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Format</label>
                <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV (Comma Separated)</SelectItem>
                    <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="pdf">PDF Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Date Range</label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                    <SelectItem value="1y">Last year</SelectItem>
                    <SelectItem value="all">All time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Export Button */}
            <Button 
              className="w-full gap-2" 
              size="lg"
              disabled={selectedTypes.length === 0}
            >
              <Download className="h-4 w-4" />
              Generate Export ({selectedTypes.length} data types selected)
            </Button>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="space-y-4">
          <Card className="border-0 bg-card/50 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200" style={{ animationDelay: "50ms" }}>
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Database className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">526K</p>
                  <p className="text-xs text-muted-foreground">Total Records</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Storage Used</span>
                  <span className="font-medium">2.4 GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Backup</span>
                  <span className="font-medium">2h ago</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-card/50 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200" style={{ animationDelay: "100ms" }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <History className="h-4 w-4" />
                Recent Exports
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentExports.slice(0, 3).map((job) => {
                const FormatIcon = formatIcons[job.format];
                return (
                  <div key={job.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="p-1.5 rounded bg-muted/50">
                      <FormatIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{job.name}</p>
                      <p className="text-[10px] text-muted-foreground">{job.dataType}</p>
                    </div>
                    {job.status === "completed" && (
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Export History */}
      <Card className="border-0 bg-card/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: "200ms" }}>
        <CardHeader>
          <CardTitle className="text-lg">Export History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentExports.map((job, index) => {
              const FormatIcon = formatIcons[job.format];
              return (
                <div
                  key={job.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all animate-in fade-in slide-in-from-bottom-2 duration-200"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2.5 rounded-xl bg-muted/50">
                      <FormatIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-medium text-sm">{job.name}</h4>
                        <Badge variant="outline" className="text-xs">{job.format.toUpperCase()}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{job.dataType} • {job.records?.toLocaleString() || "—"} records</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {job.fileSize && (
                      <span className="text-sm text-muted-foreground">{job.fileSize}</span>
                    )}
                    <Badge className={cn(
                      "gap-1",
                      job.status === "completed" ? "bg-green-500/10 text-green-500" :
                      job.status === "processing" ? "bg-blue-500/10 text-blue-500" :
                      "bg-muted text-muted-foreground"
                    )}>
                      {job.status === "processing" && <Loader2 className="h-3 w-3 animate-spin" />}
                      {job.status === "completed" && <CheckCircle2 className="h-3 w-3" />}
                      {job.status === "queued" && <Clock className="h-3 w-3" />}
                      {job.status}
                    </Badge>
                    {job.status === "completed" && (
                      <Button variant="outline" size="sm" className="gap-2">
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDataExport;
