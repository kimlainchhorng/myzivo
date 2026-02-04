/**
 * Dispute Flow Diagram - Visual escalation flow for dispute resolution
 */

import { 
  MessageSquare, 
  Headphones, 
  FileText, 
  Scale,
  ArrowDown,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DisputeFlowDiagramProps {
  className?: string;
}

const disputeSteps = [
  {
    step: 1,
    title: "Contact Partner Directly",
    description: "For booking issues (cancellations, changes, refunds)",
    responseTime: "Per partner SLA",
    icon: MessageSquare,
    color: "bg-blue-500",
    borderColor: "border-blue-500/30",
    bgColor: "bg-blue-500/5",
  },
  {
    step: 2,
    title: "Contact ZIVO Support",
    description: "For platform issues (search, account, technical)",
    responseTime: "24-48 hours",
    icon: Headphones,
    color: "bg-teal-500",
    borderColor: "border-teal-500/30",
    bgColor: "bg-teal-500/5",
  },
  {
    step: 3,
    title: "Formal Complaint",
    description: "Submit documented complaint with evidence",
    responseTime: "5 business days",
    icon: FileText,
    color: "bg-amber-500",
    borderColor: "border-amber-500/30",
    bgColor: "bg-amber-500/5",
  },
  {
    step: 4,
    title: "External Escalation",
    description: "State consumer protection or arbitration",
    responseTime: "Per process rules",
    icon: Scale,
    color: "bg-rose-500",
    borderColor: "border-rose-500/30",
    bgColor: "bg-rose-500/5",
  },
];

export function DisputeFlowDiagram({ className }: DisputeFlowDiagramProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {disputeSteps.map((step, index) => (
        <div key={step.step}>
          <div className={cn(
            "p-4 rounded-xl border transition-all",
            step.borderColor,
            step.bgColor
          )}>
            <div className="flex items-start gap-4">
              {/* Step number and icon */}
              <div className="flex flex-col items-center">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm",
                  step.color
                )}>
                  {step.step}
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-foreground">{step.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {step.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-background/50 px-2 py-1 rounded-full shrink-0">
                    <Clock className="w-3 h-3" />
                    {step.responseTime}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Arrow connector */}
          {index < disputeSteps.length - 1 && (
            <div className="flex justify-center py-2">
              <ArrowDown className="w-5 h-5 text-muted-foreground/50" />
            </div>
          )}
        </div>
      ))}
      
      {/* Documentation requirements */}
      <div className="mt-6 p-4 rounded-xl border bg-muted/30">
        <h5 className="font-medium text-sm mb-2">Documentation Requirements</h5>
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Booking confirmation/reference number
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Correspondence with partner (screenshots)
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Payment/receipt documentation
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Clear description of issue and desired resolution
          </li>
        </ul>
      </div>
    </div>
  );
}

export default DisputeFlowDiagram;
