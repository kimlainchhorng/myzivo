/**
 * Fare Rules & Policies Card — expandable accordion with refund, change, baggage policies
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, RotateCcw, ArrowRightLeft, Luggage, ShieldCheck,
  AlertCircle, CheckCircle2, XCircle, Package, Briefcase, ShoppingBag
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { type DuffelOffer } from "@/hooks/useDuffelFlights";

interface FareRulesCardProps {
  offer: DuffelOffer;
}

interface PolicyItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  allowed: boolean | null;
  detail?: string;
}

function PolicyItem({ icon, label, value, allowed, detail }: PolicyItemProps) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className={cn(
        "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
        allowed === true && "bg-emerald-500/10",
        allowed === false && "bg-destructive/10",
        allowed === null && "bg-muted"
      )}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[12px] font-semibold">{label}</p>
          {allowed !== null && (
            <Badge
              variant="secondary"
              className={cn(
                "text-[9px] px-2 py-0 h-5 gap-0.5 font-bold",
                allowed ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-destructive/10 text-destructive"
              )}
            >
              {allowed ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
              {value}
            </Badge>
          )}
          {allowed === null && (
            <span className="text-[10px] text-muted-foreground font-medium">{value}</span>
          )}
        </div>
        {detail && (
          <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{detail}</p>
        )}
      </div>
    </div>
  );
}

export function FareRulesCard({ offer }: FareRulesCardProps) {
  const [expanded, setExpanded] = useState(false);

  const isRefundable = offer.isRefundable ?? false;
  const isChangeable = offer.conditions?.changeable ?? false;

  // Parse baggage info
  const baggage = offer.baggageIncluded || "Personal item";  
  const hasCarryOn = offer.baggageDetails?.carryOnIncluded ?? (baggage.toLowerCase().includes("carry") || baggage.toLowerCase().includes("cabin"));
  const hasCheckedBag = offer.baggageDetails?.checkedBagsIncluded ?? (baggage.toLowerCase().includes("check") || baggage.toLowerCase().includes("kg") || baggage.toLowerCase().includes("pc"));

  return (
    <Card className="border-border/30 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors"
      >
        <div className="w-8 h-8 rounded-xl bg-[hsl(var(--flights))]/10 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-4 h-4 text-[hsl(var(--flights))]" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-xs font-bold">Fare Rules & Policies</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {isRefundable ? "Refundable" : "Non-refundable"} · {isChangeable ? "Changes allowed" : "No changes"} · {baggage}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {isRefundable && (
            <Badge className="text-[8px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 px-1.5 py-0 h-4">
              Refundable
            </Badge>
          )}
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-border/20">
              {/* Refund Policy */}
              <PolicyItem
                icon={<RotateCcw className={cn("w-4 h-4", isRefundable ? "text-emerald-500" : "text-destructive")} />}
                label="Cancellation & Refund"
                value={isRefundable ? "Allowed" : "Non-refundable"}
                allowed={isRefundable}
                detail={isRefundable
                  ? "This fare allows cancellation with refund. Airline fees may apply depending on timing."
                  : "This fare is non-refundable. Taxes may be recoverable depending on the airline."
                }
              />

              <Separator className="bg-border/15" />

              {/* Change Policy */}
              <PolicyItem
                icon={<ArrowRightLeft className={cn("w-4 h-4", isChangeable ? "text-emerald-500" : "text-destructive")} />}
                label="Date & Route Changes"
                value={isChangeable ? "Allowed" : "Not allowed"}
                allowed={isChangeable}
                detail={isChangeable
                  ? "Date/route changes permitted before departure. Change fees and fare differences may apply."
                  : "This fare does not allow changes. You would need to cancel and rebook."
                }
              />

              <Separator className="bg-border/15" />

              {/* Baggage Breakdown */}
              <div className="py-2.5">
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[hsl(var(--flights))]/10 flex items-center justify-center shrink-0">
                    <Luggage className="w-4 h-4 text-[hsl(var(--flights))]" />
                  </div>
                  <p className="text-[12px] font-semibold">Baggage Allowance</p>
                </div>

                <div className="grid grid-cols-3 gap-2 ml-11">
                  {/* Personal Item */}
                  <div className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
                    <ShoppingBag className="w-5 h-5 text-emerald-500" />
                    <span className="text-[9px] font-bold text-center leading-tight">Personal Item</span>
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  </div>

                  {/* Carry-on */}
                  <div className={cn(
                    "flex flex-col items-center gap-1.5 p-2.5 rounded-xl border",
                    hasCarryOn ? "bg-emerald-500/5 border-emerald-500/15" : "bg-muted/30 border-border/20"
                  )}>
                    <Briefcase className={cn("w-5 h-5", hasCarryOn ? "text-emerald-500" : "text-muted-foreground/40")} />
                    <span className="text-[9px] font-bold text-center leading-tight">Carry-on</span>
                    {hasCarryOn
                      ? <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      : <XCircle className="w-3 h-3 text-muted-foreground/40" />
                    }
                  </div>

                  {/* Checked Bag */}
                  <div className={cn(
                    "flex flex-col items-center gap-1.5 p-2.5 rounded-xl border",
                    hasCheckedBag ? "bg-emerald-500/5 border-emerald-500/15" : "bg-muted/30 border-border/20"
                  )}>
                    <Package className={cn("w-5 h-5", hasCheckedBag ? "text-emerald-500" : "text-muted-foreground/40")} />
                    <span className="text-[9px] font-bold text-center leading-tight">Checked Bag</span>
                    {hasCheckedBag
                      ? <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      : <XCircle className="w-3 h-3 text-muted-foreground/40" />
                    }
                  </div>
                </div>
              </div>

              <Separator className="bg-border/15" />

              {/* Seat Selection */}
              <PolicyItem
                icon={<AlertCircle className="w-4 h-4 text-muted-foreground" />}
                label="Seat Selection"
                value="After ticketing"
                allowed={null}
                detail="Seat selection is available after your ticket is issued, directly with the airline."
              />

              {/* Airline rules notice */}
              <div className="mt-2 p-2.5 rounded-lg bg-accent/40 border border-border/20">
                <p className="text-[9px] text-muted-foreground leading-relaxed">
                  <span className="font-bold text-foreground">Important:</span> Fare rules are set by the airline and may vary by route.
                  Fees for changes, cancellations, or excess baggage are determined by the airline's tariff at time of request.
                  Full fare conditions will be provided at checkout.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
