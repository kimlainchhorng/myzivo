import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  RefreshCw, 
  Download, 
  Calendar,
  TrendingUp,
  ChevronDown
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface AdminDashboardHeaderProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  actions?: React.ReactNode;
  stats?: {
    label: string;
    value: string | number;
    trend?: "up" | "down" | "neutral";
    trendValue?: string;
  }[];
  showDateFilter?: boolean;
  dateRange?: string;
  onDateRangeChange?: (range: string) => void;
  showExport?: boolean;
  onExport?: (format: "csv" | "pdf" | "xlsx") => void;
}

const AdminDashboardHeader = ({
  title,
  description,
  icon,
  gradient,
  onRefresh,
  isRefreshing,
  actions,
  stats,
  showDateFilter = true,
  dateRange = "7d",
  onDateRangeChange,
  showExport = true,
  onExport
}: AdminDashboardHeaderProps) => {
  const [selectedRange, setSelectedRange] = useState(dateRange);

  const handleRangeChange = (value: string) => {
    setSelectedRange(value);
    onDateRangeChange?.(value);
  };

  const handleExport = (format: "csv" | "pdf" | "xlsx") => {
    onExport?.(format);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
            {icon}
          </div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {title}
              <Badge variant="outline" className="ml-2 text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Badge>
            </h1>
            <p className="text-muted-foreground">{description}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {showDateFilter && (
            <Select value={selectedRange} onValueChange={handleRangeChange}>
              <SelectTrigger className="w-[130px] bg-background/50 border-border/50">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
          )}

          {onRefresh && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefresh}
              disabled={isRefreshing}
              className="gap-2 bg-background/50 border-border/50"
            >
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
              Refresh
            </Button>
          )}
          
          {showExport && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-background/50 border-border/50">
                  <Download className="h-4 w-4" />
                  Export
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleExport("csv")}>
                  <Download className="h-4 w-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("pdf")}>
                  <Download className="h-4 w-4 mr-2" />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("xlsx")}>
                  <Download className="h-4 w-4 mr-2" />
                  Export as Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {actions}
        </div>
      </div>

      {stats && stats.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-border transition-colors"
            >
              <span className="text-sm text-muted-foreground">{stat.label}:</span>
              <span className="text-sm font-semibold">{stat.value}</span>
              {stat.trend && stat.trendValue && (
                <span className={cn(
                  "text-xs flex items-center gap-0.5 px-1.5 py-0.5 rounded-full",
                  stat.trend === 'up' ? 'text-green-500 bg-green-500/10' : 
                  stat.trend === 'down' ? 'text-red-500 bg-red-500/10' : 'text-muted-foreground bg-muted'
                )}>
                  <TrendingUp className={cn("h-3 w-3", stat.trend === 'down' && "rotate-180")} />
                  {stat.trendValue}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboardHeader;
