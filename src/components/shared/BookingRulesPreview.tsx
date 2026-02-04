/**
 * Booking Rules Preview
 * Compact fare rules display for result cards
 */

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  ChevronDown,
  Info,
  FileText,
} from "lucide-react";

interface BookingRule {
  type: "refundable" | "changeable" | "non-refundable" | "info";
  text: string;
}

interface BookingRulesPreviewProps {
  rules?: BookingRule[];
  className?: string;
  compact?: boolean;
}

const defaultRules: BookingRule[] = [
  { type: "refundable", text: "Refundable with fee (before 24h)" },
  { type: "changeable", text: "Changes allowed ($75 fee)" },
  { type: "non-refundable", text: "Non-refundable after departure" },
  { type: "info", text: "Airline rules apply for all changes" },
];

const ruleIcons = {
  refundable: { icon: CheckCircle2, color: "text-emerald-500" },
  changeable: { icon: CheckCircle2, color: "text-emerald-500" },
  "non-refundable": { icon: AlertCircle, color: "text-amber-500" },
  info: { icon: Info, color: "text-muted-foreground" },
};

const BookingRulesPreview = ({
  rules = defaultRules,
  className,
  compact = false,
}: BookingRulesPreviewProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (compact) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className={cn(
          "flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors w-full",
          className
        )}>
          <FileText className="w-3.5 h-3.5" />
          <span>Booking Rules</span>
          <ChevronDown className={cn(
            "w-3 h-3 ml-auto transition-transform duration-200",
            isOpen && "rotate-180"
          )} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2 space-y-1.5">
          {rules.map((rule, index) => {
            const config = ruleIcons[rule.type];
            const Icon = config.icon;
            return (
              <div key={index} className="flex items-start gap-2 text-xs">
                <Icon className={cn("w-3.5 h-3.5 flex-shrink-0 mt-0.5", config.color)} />
                <span className="text-muted-foreground">{rule.text}</span>
              </div>
            );
          })}
          <p className="text-[10px] text-muted-foreground pt-1 border-t border-border/50 mt-2">
            Refunds and changes are governed by the airline or travel provider's rules.
          </p>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <div className={cn("p-4 rounded-xl bg-muted/30 border border-border/50", className)}>
      <div className="flex items-center gap-2 mb-3">
        <FileText className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">Booking Rules</span>
      </div>
      <div className="space-y-2">
        {rules.map((rule, index) => {
          const config = ruleIcons[rule.type];
          const Icon = config.icon;
          return (
            <div key={index} className="flex items-start gap-2 text-sm">
              <Icon className={cn("w-4 h-4 flex-shrink-0 mt-0.5", config.color)} />
              <span className="text-muted-foreground">{rule.text}</span>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/50">
        Refunds and changes are governed by the airline or travel provider's rules.
        ZIVO facilitates the booking but does not control fare conditions.
      </p>
    </div>
  );
};

export default BookingRulesPreview;
