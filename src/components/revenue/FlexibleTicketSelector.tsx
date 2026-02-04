/**
 * FLEXIBLE TICKET SELECTOR
 * 
 * Upsell widget for flexible/refundable fare options
 */

import { useState } from "react";
import { RefreshCw, CheckCircle, Info, Shield, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { FLEXIBLE_TICKET_OPTIONS, REVENUE_COMPLIANCE, type FlexibleTicketOption } from "@/config/revenueOptimization";
import { cn } from "@/lib/utils";

interface FlexibleTicketSelectorProps {
  className?: string;
  selectedOption?: string;
  onSelect?: (option: FlexibleTicketOption) => void;
}

export default function FlexibleTicketSelector({
  className,
  selectedOption = 'standard',
  onSelect,
}: FlexibleTicketSelectorProps) {
  const [selected, setSelected] = useState(selectedOption);

  const handleSelect = (optionId: string) => {
    setSelected(optionId);
    const option = FLEXIBLE_TICKET_OPTIONS.find(o => o.id === optionId);
    if (option) {
      onSelect?.(option);
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <RefreshCw className="w-5 h-5 text-primary" />
            Fare Options
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">{REVENUE_COMPLIANCE.flexible}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      
      <CardContent>
        <RadioGroup value={selected} onValueChange={handleSelect} className="space-y-3">
          {FLEXIBLE_TICKET_OPTIONS.map((option) => (
            <div
              key={option.id}
              className={cn(
                "relative flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer",
                selected === option.id
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border hover:border-primary/30"
              )}
              onClick={() => handleSelect(option.id)}
            >
              <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Label htmlFor={option.id} className="font-semibold cursor-pointer">
                    {option.name}
                  </Label>
                  {option.id === 'flexible' && (
                    <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/30 text-[10px]">
                      Popular
                    </Badge>
                  )}
                  {option.id === 'refundable' && (
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-[10px]">
                      Most Flexible
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{option.description}</p>
                
                {/* Features */}
                <div className="space-y-1">
                  {option.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle className="w-3 h-3 text-emerald-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Price */}
              <div className="text-right shrink-0">
                {option.price === 0 ? (
                  <p className="font-medium text-muted-foreground">Included</p>
                ) : (
                  <>
                    <p className="font-bold text-lg">+${option.price}</p>
                    <p className="text-xs text-muted-foreground">per person</p>
                  </>
                )}
              </div>
            </div>
          ))}
        </RadioGroup>
        
        {/* Disclaimer */}
        <p className="text-[10px] text-muted-foreground text-center mt-4">
          {FLEXIBLE_TICKET_OPTIONS.find(o => o.id === selected)?.disclaimer}
        </p>
      </CardContent>
    </Card>
  );
}
