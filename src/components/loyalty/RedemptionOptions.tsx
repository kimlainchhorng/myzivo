/**
 * REDEMPTION OPTIONS
 * 
 * Shows available ways to redeem ZIVO Points
 */

import { useState } from "react";
import { 
  Gift, 
  Ticket, 
  Bell, 
  Sparkles, 
  Clock,
  CheckCircle,
  ArrowRight,
  Info
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { REDEMPTION_OPTIONS, POINTS_COMPLIANCE, type RedemptionOption } from "@/config/zivoPoints";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface RedemptionOptionsProps {
  className?: string;
  pointsBalance?: number;
  onRedeem?: (option: RedemptionOption) => void;
}

export default function RedemptionOptions({
  className,
  pointsBalance = 0,
  onRedeem,
}: RedemptionOptionsProps) {
  const [selectedOption, setSelectedOption] = useState<RedemptionOption | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleSelectOption = (option: RedemptionOption) => {
    if (!option.available || option.comingSoon) {
      return;
    }
    if (pointsBalance < option.pointsCost) {
      toast.error(`You need ${option.pointsCost - pointsBalance} more points`);
      return;
    }
    setSelectedOption(option);
    setIsConfirmOpen(true);
  };

  const handleConfirmRedeem = () => {
    if (selectedOption) {
      onRedeem?.(selectedOption);
      setIsConfirmOpen(false);
      toast.success(`Redeemed: ${selectedOption.name}`);
    }
  };

  return (
    <>
      <Card className={className}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Gift className="w-5 h-5 text-primary" />
            Redeem Your Points
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {REDEMPTION_OPTIONS.map((option) => {
            const canAfford = pointsBalance >= option.pointsCost;
            const isDisabled = !option.available || option.comingSoon || !canAfford;
            
            return (
              <button
                key={option.id}
                onClick={() => handleSelectOption(option)}
                disabled={isDisabled}
                className={cn(
                  "w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all",
                  isDisabled 
                    ? "opacity-60 cursor-not-allowed" 
                    : "hover:border-primary/50 hover:shadow-md"
                )}
              >
                <div className={cn(
                  "p-2 rounded-lg shrink-0",
                  option.dollarValue ? "bg-emerald-500/10" : "bg-primary/10"
                )}>
                  {option.dollarValue ? (
                    <Ticket className="w-5 h-5 text-emerald-500" />
                  ) : option.id.includes('alert') ? (
                    <Bell className="w-5 h-5 text-primary" />
                  ) : (
                    <Sparkles className="w-5 h-5 text-primary" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{option.name}</p>
                    {option.comingSoon && (
                      <Badge variant="outline" className="text-[10px]">
                        <Clock className="w-3 h-3 mr-1" />
                        Soon
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </div>
                
                <div className="text-right shrink-0">
                  <Badge 
                    className={cn(
                      canAfford 
                        ? "bg-primary/10 text-primary border-primary/30" 
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {option.pointsCost.toLocaleString()} pts
                  </Badge>
                  {option.dollarValue && (
                    <p className="text-xs text-emerald-500 mt-1">
                      = ${option.dollarValue} value
                    </p>
                  )}
                </div>
              </button>
            );
          })}
          
          {/* Compliance note */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 text-xs text-muted-foreground">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <p>{POINTS_COMPLIANCE.primaryDisclaimer}</p>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Redemption</DialogTitle>
            <DialogDescription>
              Are you sure you want to redeem your points?
            </DialogDescription>
          </DialogHeader>
          
          {selectedOption && (
            <div className="p-4 rounded-xl border bg-muted/30">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{selectedOption.name}</span>
                <Badge className="bg-primary/10 text-primary">
                  -{selectedOption.pointsCost.toLocaleString()} pts
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {selectedOption.description}
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">New balance:</span>
                <span className="font-bold">
                  {(pointsBalance - selectedOption.pointsCost).toLocaleString()} pts
                </span>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmRedeem} className="gap-2">
              <CheckCircle className="w-4 h-4" />
              Confirm Redemption
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
