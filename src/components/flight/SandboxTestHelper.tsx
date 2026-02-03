/**
 * SandboxTestHelper Component
 * Shows helpful test route suggestions when in Duffel sandbox mode
 * Only displays when no results and sandbox environment detected
 */

import { AlertCircle, ArrowRight, TestTube } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DUFFEL_SANDBOX_ROUTES } from "@/config/duffelConfig";
import { useNavigate } from "react-router-dom";
import { format, addDays } from "date-fns";

interface SandboxTestHelperProps {
  className?: string;
}

export default function SandboxTestHelper({ className }: SandboxTestHelperProps) {
  const navigate = useNavigate();

  const handleQuickSearch = (from: string, to: string) => {
    const departDate = format(addDays(new Date(), 7), 'yyyy-MM-dd');
    const returnDate = format(addDays(new Date(), 14), 'yyyy-MM-dd');
    
    const params = new URLSearchParams({
      origin: from,
      dest: to,
      depart: departDate,
      return: returnDate,
      passengers: '1',
      cabin: 'economy',
    });
    
    navigate(`/flights/results?${params.toString()}`);
  };

  return (
    <Alert className={className} variant="default">
      <TestTube className="h-4 w-4" />
      <AlertTitle className="flex items-center gap-2">
        Duffel Sandbox Mode
        <Badge variant="secondary" className="text-[10px]">TEST</Badge>
      </AlertTitle>
      <AlertDescription className="space-y-4 mt-2">
        <p className="text-sm text-muted-foreground">
          The Duffel sandbox has limited test inventory. Try these routes for reliable results:
        </p>
        <div className="flex flex-wrap gap-2">
          {DUFFEL_SANDBOX_ROUTES.slice(0, 4).map((route) => (
            <Button
              key={`${route.from}-${route.to}`}
              variant="outline"
              size="sm"
              onClick={() => handleQuickSearch(route.from, route.to)}
              className="gap-1.5 text-xs"
            >
              {route.from} <ArrowRight className="w-3 h-3" /> {route.to}
            </Button>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground">
          Sandbox data may not reflect real availability or prices.
        </p>
      </AlertDescription>
    </Alert>
  );
}
