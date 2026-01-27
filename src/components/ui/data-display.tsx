import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Info, 
  ChevronRight,
  MoreHorizontal,
  Copy,
  Check,
  ExternalLink
} from "lucide-react";
import { Badge } from "./badge";
import { Button } from "./button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./tooltip";

// Stat Card Component
interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  color?: "primary" | "green" | "red" | "amber" | "sky" | "purple";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  tooltip?: string;
  className?: string;
}

const colorConfig = {
  primary: {
    iconBg: "bg-gradient-to-br from-primary/20 to-primary/5",
    iconColor: "text-primary",
    valueTrend: "text-primary",
  },
  green: {
    iconBg: "bg-gradient-to-br from-emerald-500/20 to-emerald-500/5",
    iconColor: "text-emerald-500",
    valueTrend: "text-emerald-500",
  },
  red: {
    iconBg: "bg-gradient-to-br from-red-500/20 to-red-500/5",
    iconColor: "text-red-500",
    valueTrend: "text-red-500",
  },
  amber: {
    iconBg: "bg-gradient-to-br from-amber-500/20 to-amber-500/5",
    iconColor: "text-amber-500",
    valueTrend: "text-amber-500",
  },
  sky: {
    iconBg: "bg-gradient-to-br from-sky-500/20 to-sky-500/5",
    iconColor: "text-sky-500",
    valueTrend: "text-sky-500",
  },
  purple: {
    iconBg: "bg-gradient-to-br from-violet-500/20 to-violet-500/5",
    iconColor: "text-violet-500",
    valueTrend: "text-violet-500",
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  change,
  changeLabel,
  icon,
  trend = "neutral",
  color = "primary",
  size = "md",
  onClick,
  tooltip,
  className,
}) => {
  const config = colorConfig[color];
  
  const sizeClasses = {
    sm: "p-3",
    md: "p-4",
    lg: "p-5",
  };

  const valueSizes = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
  };

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  const content = (
    <motion.div
      whileHover={onClick ? { y: -2 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-2xl bg-gradient-to-br from-card/90 to-card border border-border/50 shadow-lg transition-all",
        onClick && "cursor-pointer hover:shadow-xl hover:border-border",
        sizeClasses[size],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {icon && (
              <div className={cn("p-2 rounded-xl", config.iconBg)}>
                <div className={config.iconColor}>{icon}</div>
              </div>
            )}
            {tooltip && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-3.5 h-3.5 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>{tooltip}</TooltipContent>
              </Tooltip>
            )}
          </div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("font-bold", valueSizes[size])}
          >
            {value}
          </motion.p>
          <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
        </div>
        
        {change !== undefined && (
          <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
            trend === "up" && "bg-emerald-500/10 text-emerald-500",
            trend === "down" && "bg-red-500/10 text-red-500",
            trend === "neutral" && "bg-muted text-muted-foreground"
          )}>
            <TrendIcon className="w-3 h-3" />
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>

      {changeLabel && (
        <p className="text-xs text-muted-foreground mt-2">{changeLabel}</p>
      )}

      {/* Decorative gradient */}
      <div className={cn(
        "absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-20 pointer-events-none",
        config.iconBg
      )} />
    </motion.div>
  );

  return content;
};

// Data List Item
interface DataListItemProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  copyable?: boolean;
  link?: string;
  badge?: string;
  badgeColor?: "default" | "green" | "red" | "amber" | "primary";
  className?: string;
}

export const DataListItem: React.FC<DataListItemProps> = ({
  label,
  value,
  icon,
  copyable,
  link,
  badge,
  badgeColor = "default",
  className,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (typeof value === "string") {
      navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const badgeColors = {
    default: "bg-muted text-muted-foreground",
    green: "bg-emerald-500/20 text-emerald-500",
    red: "bg-red-500/20 text-red-500",
    amber: "bg-amber-500/20 text-amber-500",
    primary: "bg-primary/20 text-primary",
  };

  return (
    <div className={cn(
      "flex items-center justify-between py-3 border-b border-border/50 last:border-0",
      className
    )}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground">
            {icon}
          </div>
        )}
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {badge && (
          <Badge className={cn("text-xs border-0", badgeColors[badgeColor])}>
            {badge}
          </Badge>
        )}
        <span className="text-sm font-medium">{value}</span>
        {copyable && typeof value === "string" && (
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="w-3 h-3 text-emerald-500" />
            ) : (
              <Copy className="w-3 h-3 text-muted-foreground" />
            )}
          </Button>
        )}
        {link && (
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6"
            onClick={() => window.open(link, "_blank")}
          >
            <ExternalLink className="w-3 h-3 text-muted-foreground" />
          </Button>
        )}
      </div>
    </div>
  );
};

// Info Row Component
interface InfoRowProps {
  items: {
    label: string;
    value: string | number;
    icon?: React.ReactNode;
  }[];
  variant?: "default" | "compact" | "cards";
  className?: string;
}

export const InfoRow: React.FC<InfoRowProps> = ({
  items,
  variant = "default",
  className,
}) => {
  if (variant === "cards") {
    return (
      <div className={cn("grid grid-cols-2 sm:grid-cols-4 gap-3", className)}>
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-3 rounded-xl bg-muted/30 border border-border/50 text-center"
          >
            {item.icon && (
              <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center mx-auto mb-2 text-muted-foreground">
                {item.icon}
              </div>
            )}
            <p className="text-lg font-bold">{item.value}</p>
            <p className="text-xs text-muted-foreground">{item.label}</p>
          </motion.div>
        ))}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-4 text-sm", className)}>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <div className="flex items-center gap-1.5">
              {item.icon}
              <span className="text-muted-foreground">{item.label}:</span>
              <span className="font-medium">{item.value}</span>
            </div>
            {index < items.length - 1 && (
              <span className="text-muted-foreground">•</span>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-between gap-4 p-4 rounded-xl bg-muted/30", className)}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-3">
          {item.icon && (
            <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground">
              {item.icon}
            </div>
          )}
          <div>
            <p className="text-lg font-bold">{item.value}</p>
            <p className="text-xs text-muted-foreground">{item.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// Progress List
interface ProgressItem {
  label: string;
  value: number;
  maxValue: number;
  color?: "primary" | "green" | "red" | "amber" | "sky";
}

interface ProgressListProps {
  items: ProgressItem[];
  showPercentage?: boolean;
  className?: string;
}

const progressColors = {
  primary: "bg-gradient-to-r from-primary to-teal-400",
  green: "bg-gradient-to-r from-emerald-500 to-green-400",
  red: "bg-gradient-to-r from-red-500 to-orange-500",
  amber: "bg-gradient-to-r from-amber-500 to-yellow-400",
  sky: "bg-gradient-to-r from-sky-500 to-blue-400",
};

export const ProgressList: React.FC<ProgressListProps> = ({
  items,
  showPercentage = true,
  className,
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      {items.map((item, index) => {
        const percentage = Math.min((item.value / item.maxValue) * 100, 100);
        
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium">{item.label}</span>
              <span className="text-sm text-muted-foreground">
                {item.value} / {item.maxValue}
                {showPercentage && ` (${Math.round(percentage)}%)`}
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={cn(
                  "h-full rounded-full",
                  progressColors[item.color || "primary"]
                )}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

// Comparison Card
interface ComparisonCardProps {
  title: string;
  currentValue: number;
  previousValue: number;
  unit?: string;
  prefix?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const ComparisonCard: React.FC<ComparisonCardProps> = ({
  title,
  currentValue,
  previousValue,
  unit = "",
  prefix = "",
  icon,
  className,
}) => {
  const change = previousValue !== 0 ? ((currentValue - previousValue) / previousValue) * 100 : 0;
  const isPositive = change > 0;
  const isNeutral = change === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-4 rounded-2xl bg-gradient-to-br from-card/90 to-card border border-border/50 shadow-lg",
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        {icon}
      </div>
      
      <div className="flex items-end gap-3">
        <motion.span
          key={currentValue}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-3xl font-bold"
        >
          {prefix}{currentValue.toLocaleString()}{unit}
        </motion.span>
        
        <div className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mb-1",
          isPositive && "bg-emerald-500/10 text-emerald-500",
          !isPositive && !isNeutral && "bg-red-500/10 text-red-500",
          isNeutral && "bg-muted text-muted-foreground"
        )}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : isNeutral ? <Minus className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span>{isPositive && "+"}{change.toFixed(1)}%</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-2">
        vs. previous: {prefix}{previousValue.toLocaleString()}{unit}
      </p>
    </motion.div>
  );
};

export default StatCard;
