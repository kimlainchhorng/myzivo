import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Clock, MapPin, Package, Utensils, Car, Plane, Hotel, AlertCircle, Loader2 } from "lucide-react";

// Status Step for Linear Progress
interface StatusStep {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  time?: string;
}

interface StatusTrackerProps {
  steps: StatusStep[];
  currentStep: number;
  color?: "rides" | "eats" | "sky" | "amber" | "primary";
  orientation?: "horizontal" | "vertical";
  animated?: boolean;
}

export const StatusTracker: React.FC<StatusTrackerProps> = ({
  steps,
  currentStep,
  color = "primary",
  orientation = "horizontal",
  animated = true,
}) => {
  const colorClasses = {
    rides: { active: "bg-rides", text: "text-rides", glow: "shadow-[0_0_12px_hsl(var(--rides)/0.5)]" },
    eats: { active: "bg-eats", text: "text-eats", glow: "shadow-[0_0_12px_hsl(var(--eats)/0.5)]" },
    sky: { active: "bg-sky-500", text: "text-sky-400", glow: "shadow-[0_0_12px_rgb(56,189,248,0.5)]" },
    amber: { active: "bg-amber-500", text: "text-amber-400", glow: "shadow-[0_0_12px_rgb(251,191,36,0.5)]" },
    primary: { active: "bg-primary", text: "text-primary", glow: "shadow-[0_0_12px_hsl(var(--primary)/0.5)]" },
  };

  const colors = colorClasses[color];

  if (orientation === "vertical") {
    return (
      <div className="space-y-0">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isPending = index > currentStep;

          return (
            <div key={step.id} className="flex gap-4">
              {/* Line and dot */}
              <div className="flex flex-col items-center">
                <motion.div
                  initial={animated ? { scale: 0 } : false}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1, type: "spring" }}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300",
                    isCompleted && cn(colors.active, "text-white", colors.glow),
                    isCurrent && cn(colors.active, "text-white", colors.glow, "ring-4 ring-white/10"),
                    isPending && "bg-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : isCurrent ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    step.icon || <span className="text-sm font-bold">{index + 1}</span>
                  )}
                </motion.div>
                {index < steps.length - 1 && (
                  <div className="w-0.5 h-12 bg-muted relative overflow-hidden">
                    <motion.div
                      initial={{ height: "0%" }}
                      animate={{ height: isCompleted ? "100%" : "0%" }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className={cn("absolute top-0 left-0 right-0", colors.active)}
                    />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="pb-8">
                <p className={cn(
                  "font-semibold transition-colors",
                  (isCompleted || isCurrent) ? "text-foreground" : "text-muted-foreground"
                )}>
                  {step.label}
                </p>
                {step.description && (
                  <p className="text-sm text-muted-foreground mt-0.5">{step.description}</p>
                )}
                {step.time && (
                  <p className={cn("text-xs mt-1", colors.text)}>{step.time}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Horizontal orientation
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isPending = index > currentStep;

        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center gap-2">
              <motion.div
                initial={animated ? { scale: 0 } : false}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1, type: "spring" }}
                className={cn(
                  "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300",
                  isCompleted && cn(colors.active, "text-white", colors.glow),
                  isCurrent && cn(colors.active, "text-white", colors.glow, "ring-4 ring-white/10"),
                  isPending && "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : isCurrent ? (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {step.icon || <span className="text-sm font-bold">{index + 1}</span>}
                  </motion.div>
                ) : (
                  step.icon || <span className="text-sm font-bold">{index + 1}</span>
                )}
              </motion.div>
              <div className="text-center">
                <p className={cn(
                  "text-xs sm:text-sm font-medium transition-colors",
                  (isCompleted || isCurrent) ? "text-foreground" : "text-muted-foreground"
                )}>
                  {step.label}
                </p>
                {step.time && isCurrent && (
                  <p className={cn("text-xs", colors.text)}>{step.time}</p>
                )}
              </div>
            </div>

            {index < steps.length - 1 && (
              <div className="flex-1 h-1 mx-2 bg-muted rounded-full relative overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: isCompleted ? "100%" : isCurrent ? "50%" : "0%" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={cn("absolute top-0 left-0 bottom-0 rounded-full", colors.active)}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// Live Location Pulse
interface LivePulseProps {
  color?: "rides" | "eats" | "sky" | "amber" | "primary";
  size?: "sm" | "md" | "lg";
  label?: string;
}

export const LivePulse: React.FC<LivePulseProps> = ({
  color = "primary",
  size = "md",
  label,
}) => {
  const colorClasses = {
    rides: "bg-rides",
    eats: "bg-eats",
    sky: "bg-sky-500",
    amber: "bg-amber-500",
    primary: "bg-primary",
  };

  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  return (
    <div className="flex items-center gap-2">
      <span className="relative flex">
        <motion.span
          animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0, 0.7] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className={cn(
            "absolute inline-flex rounded-full",
            colorClasses[color],
            sizeClasses[size]
          )}
        />
        <span className={cn(
          "relative inline-flex rounded-full",
          colorClasses[color],
          sizeClasses[size]
        )} />
      </span>
      {label && (
        <span className="text-sm font-medium text-foreground">{label}</span>
      )}
    </div>
  );
};

// ETA Display
interface ETADisplayProps {
  minutes: number;
  label?: string;
  color?: "rides" | "eats" | "sky" | "amber" | "primary";
  showProgress?: boolean;
  totalMinutes?: number;
}

export const ETADisplay: React.FC<ETADisplayProps> = ({
  minutes,
  label = "Arriving in",
  color = "primary",
  showProgress = false,
  totalMinutes,
}) => {
  const colorClasses = {
    rides: "text-rides",
    eats: "text-eats",
    sky: "text-sky-400",
    amber: "text-amber-400",
    primary: "text-primary",
  };

  const bgClasses = {
    rides: "bg-rides",
    eats: "bg-eats",
    sky: "bg-sky-500",
    amber: "bg-amber-500",
    primary: "bg-primary",
  };

  const progress = totalMinutes ? ((totalMinutes - minutes) / totalMinutes) * 100 : 0;

  return (
    <div className="glass-card p-4 rounded-2xl">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Clock className={cn("w-5 h-5", colorClasses[color])} />
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
        <LivePulse color={color} size="sm" label="Live" />
      </div>
      <motion.p
        key={minutes}
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={cn("text-3xl font-bold font-display", colorClasses[color])}
      >
        {minutes} <span className="text-lg font-normal text-muted-foreground">min</span>
      </motion.p>
      {showProgress && totalMinutes && (
        <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
            className={cn("h-full rounded-full", bgClasses[color])}
          />
        </div>
      )}
    </div>
  );
};

// Order/Trip Status Badge
interface StatusBadgeProps {
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = "md",
  animated = true,
}) => {
  const statusConfig = {
    pending: { label: "Pending", color: "bg-amber-500/10 text-amber-400", icon: Clock },
    confirmed: { label: "Confirmed", color: "bg-blue-500/10 text-blue-400", icon: Check },
    in_progress: { label: "In Progress", color: "bg-primary/10 text-primary", icon: Loader2 },
    completed: { label: "Completed", color: "bg-green-500/10 text-green-400", icon: Check },
    cancelled: { label: "Cancelled", color: "bg-red-500/10 text-red-400", icon: AlertCircle },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-3 py-1 text-sm gap-1.5",
    lg: "px-4 py-1.5 text-base gap-2",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <span className={cn(
      "inline-flex items-center font-medium rounded-full",
      config.color,
      sizeClasses[size]
    )}>
      {status === "in_progress" && animated ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Icon className={iconSizes[size]} />
        </motion.div>
      ) : (
        <Icon className={iconSizes[size]} />
      )}
      {config.label}
    </span>
  );
};
