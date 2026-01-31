import { 
  RotateCcw, 
  Clock,
  CheckCircle2,
  CreditCard,
  AlertCircle,
  ArrowRight,
  Coins
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RefundTrackerWidgetProps {
  className?: string;
}

const refundSteps = [
  { id: 1, label: "Request Submitted", status: "completed", date: "Jun 10" },
  { id: 2, label: "Under Review", status: "completed", date: "Jun 11" },
  { id: 3, label: "Approved", status: "current", date: "Jun 12" },
  { id: 4, label: "Processing", status: "pending", date: "" },
  { id: 5, label: "Refunded", status: "pending", date: "" },
];

const RefundTrackerWidget = ({ className }: RefundTrackerWidgetProps) => {
  const currentStep = refundSteps.findIndex(s => s.status === "current") + 1;
  const progress = (currentStep / refundSteps.length) * 100;

  return (
    <div className={cn("p-4 rounded-xl bg-card/60 backdrop-blur-xl border border-border/50", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">Refund Status</h3>
        </div>
        <Badge className="bg-amber-500/20 text-amber-400">
          In Progress
        </Badge>
      </div>

      {/* Amount */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Refund Amount</p>
            <p className="text-2xl font-bold">$899.00</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-1">ETA</p>
            <p className="text-sm font-medium">5-7 business days</p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{currentStep} of {refundSteps.length}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Steps */}
      <div className="space-y-3 mb-4">
        {refundSteps.map((step, index) => (
          <div key={step.id} className="flex items-center gap-3">
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center",
              step.status === "completed" 
                ? "bg-emerald-500/20" 
                : step.status === "current"
                ? "bg-primary/20"
                : "bg-muted/30"
            )}>
              {step.status === "completed" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : step.status === "current" ? (
                <Clock className="w-4 h-4 text-primary animate-pulse" />
              ) : (
                <span className="text-xs text-muted-foreground">{step.id}</span>
              )}
            </div>
            <div className="flex-1">
              <p className={cn(
                "text-sm",
                step.status === "pending" && "text-muted-foreground"
              )}>
                {step.label}
              </p>
            </div>
            {step.date && (
              <span className="text-xs text-muted-foreground">{step.date}</span>
            )}
          </div>
        ))}
      </div>

      {/* Refund Method */}
      <div className="p-3 rounded-xl bg-muted/20 border border-border/30 mb-4">
        <p className="text-xs text-muted-foreground mb-2">Refund to</p>
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">Visa •••• 4242</span>
        </div>
      </div>

      {/* Alternative */}
      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-400" />
            <div>
              <p className="text-xs font-medium">Get 10% more as Travel Credit</p>
              <p className="text-[10px] text-muted-foreground">$988.90 instant credit</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-amber-400" />
        </div>
      </div>
    </div>
  );
};

export default RefundTrackerWidget;
