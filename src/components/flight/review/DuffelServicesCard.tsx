/**
 * DuffelServicesCard — Real available services from Duffel API
 * Shows actual add-ons (baggage, seats, etc.) with real prices
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Luggage, Armchair, Shield, Package, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { type DuffelAvailableService, useDuffelAvailableServices } from "@/hooks/useDuffelFlights";

const SERVICE_META: Record<string, { icon: typeof Luggage; label: string; color: string }> = {
  baggage: { icon: Luggage, label: "Extra Baggage", color: "text-blue-500" },
  seat: { icon: Armchair, label: "Seat Selection", color: "text-purple-500" },
  cancel_for_any_reason: { icon: Shield, label: "Cancel For Any Reason", color: "text-emerald-500" },
};

function getServiceMeta(type: string) {
  return SERVICE_META[type] || { icon: Package, label: type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()), color: "text-muted-foreground" };
}

function formatAmount(amount: string, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 2 }).format(parseFloat(amount));
  } catch {
    return `$${amount}`;
  }
}

interface DuffelServicesCardProps {
  offerId: string | null;
  selectedServiceIds: string[];
  onToggleService: (service: DuffelAvailableService) => void;
  className?: string;
}

export function DuffelServicesCard({ offerId, selectedServiceIds, onToggleService, className }: DuffelServicesCardProps) {
  const { data, isLoading, error } = useDuffelAvailableServices(offerId);

  if (isLoading) {
    return (
      <Card className={cn("border-border/30", className)}>
        <CardContent className="py-8 flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin text-[hsl(var(--flights))]" />
          <p className="text-xs">Loading available add-ons…</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !data?.services?.length) {
    // No services available — show informational note
    return (
      <Card className={cn("border-border/30", className)}>
        <CardContent className="py-5">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Trip Add-ons</h3>
          </div>
          <div className="flex items-start gap-2 p-3 rounded-xl bg-muted/30 border border-border/20">
            <AlertCircle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              {error
                ? "Unable to load add-on services. You can add extras after booking through the airline's website."
                : "No add-on services available for this fare. Additional options like seat selection and extra baggage may be available through the airline after booking."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { grouped } = data;

  return (
    <Card className={cn("border-border/30 overflow-hidden", className)}>
      <div className="px-4 py-2.5 bg-muted/30 border-b border-border/20 flex items-center gap-2">
        <Package className="w-4 h-4 text-[hsl(var(--flights))]" />
        <h3 className="text-xs font-bold tracking-wide">Available Add-ons</h3>
        <Badge variant="secondary" className="text-[8px] ml-auto px-1.5 py-0">
          {data.total} option{data.total !== 1 ? "s" : ""}
        </Badge>
      </div>
      <CardContent className="p-3 space-y-2">
        {Object.entries(grouped).map(([type, services]) => {
          const meta = getServiceMeta(type);
          const Icon = meta.icon;

          return (
            <div key={type}>
              <div className="flex items-center gap-1.5 mb-1.5 px-1">
                <Icon className={cn("w-3.5 h-3.5", meta.color)} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{meta.label}</span>
              </div>
              {services.map((svc, i) => {
                const isSelected = selectedServiceIds.includes(svc.id);
                return (
                  <motion.label
                    key={svc.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 mb-1.5",
                      isSelected
                        ? "border-[hsl(var(--flights))] bg-[hsl(var(--flights))]/5"
                        : "border-border/40 hover:border-[hsl(var(--flights))]/30 hover:bg-muted/30"
                    )}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onToggleService(svc)}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium capitalize">
                        {type.replace(/_/g, " ")}
                        {svc.maximum_quantity > 1 && (
                          <span className="text-[10px] text-muted-foreground ml-1">
                            (up to {svc.maximum_quantity})
                          </span>
                        )}
                      </p>
                      {svc.segment_ids?.length > 0 && (
                        <p className="text-[10px] text-muted-foreground">
                          Per segment · {svc.passenger_ids?.length || 1} passenger{(svc.passenger_ids?.length || 1) > 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                    <span className="text-sm font-semibold whitespace-nowrap text-[hsl(var(--flights))]">
                      +{formatAmount(svc.total_amount, svc.total_currency)}
                    </span>
                  </motion.label>
                );
              })}
            </div>
          );
        })}

        <p className="text-[9px] text-muted-foreground text-center pt-1 leading-relaxed">
          Add-on prices are provided by the airline in real-time. Services are subject to availability.
        </p>
      </CardContent>
    </Card>
  );
}
