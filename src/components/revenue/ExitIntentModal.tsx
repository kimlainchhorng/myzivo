/**
 * EXIT INTENT MODAL
 * 
 * Captures users about to leave with price alert/save search options
 * Shows when mouse leaves viewport (desktop) or after inactivity (mobile)
 */

import { useState, useEffect, useCallback } from "react";
import { Bell, Bookmark, X, Sparkles, TrendingDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EXIT_INTENT_CONFIG } from "@/config/revenueOptimization";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ExitIntentModalProps {
  isEnabled?: boolean;
  searchParams?: {
    origin?: string;
    destination?: string;
    departDate?: string;
    returnDate?: string;
    serviceType?: 'flight' | 'hotel' | 'car';
  };
  onPriceAlertSet?: (email: string) => void;
  onSearchSaved?: () => void;
}

export default function ExitIntentModal({
  isEnabled = true,
  searchParams,
  onPriceAlertSet,
  onSearchSaved,
}: ExitIntentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [hasShown, setHasShown] = useState(false);

  // Check if already shown in session
  useEffect(() => {
    if (EXIT_INTENT_CONFIG.showOncePerSession) {
      const shown = sessionStorage.getItem(EXIT_INTENT_CONFIG.storageKey);
      if (shown) {
        setHasShown(true);
      }
    }
  }, []);

  // Desktop: Mouse leave detection
  const handleMouseLeave = useCallback((e: MouseEvent) => {
    if (!isEnabled || hasShown) return;
    
    // Only trigger when leaving from the top of the viewport
    if (e.clientY <= 0) {
      setTimeout(() => {
        setIsOpen(true);
        setHasShown(true);
        sessionStorage.setItem(EXIT_INTENT_CONFIG.storageKey, 'true');
      }, EXIT_INTENT_CONFIG.delay);
    }
  }, [isEnabled, hasShown]);

  useEffect(() => {
    if (!isEnabled || hasShown) return;
    
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [handleMouseLeave, isEnabled, hasShown]);

  const handleSetPriceAlert = () => {
    if (!email || !email.includes('@')) {
      toast.error("Please enter a valid email");
      return;
    }
    onPriceAlertSet?.(email);
    toast.success("Price alert set! We'll notify you when prices drop.", {
      description: `+${EXIT_INTENT_CONFIG.priceAlertPoints} ZIVO Points earned`,
    });
    setIsOpen(false);
  };

  const handleSaveSearch = () => {
    onSearchSaved?.();
    toast.success("Search saved to your account");
    setIsOpen(false);
  };

  const routeDisplay = searchParams?.origin && searchParams?.destination
    ? `${searchParams.origin} → ${searchParams.destination}`
    : "your search";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <TrendingDown className="w-6 h-6 text-primary" />
            {EXIT_INTENT_CONFIG.copy.headline}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Route Display */}
          {searchParams && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-amber-500/10 border border-primary/20">
              <p className="text-sm text-muted-foreground mb-1">Track prices for</p>
              <p className="font-bold text-lg">{routeDisplay}</p>
              {searchParams.departDate && (
                <p className="text-sm text-muted-foreground">
                  {searchParams.departDate}
                  {searchParams.returnDate && ` – ${searchParams.returnDate}`}
                </p>
              )}
            </div>
          )}
          
          {/* Price Alert Option */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              <span className="font-medium">Get notified when prices drop</span>
              <Badge className="bg-primary/10 text-primary text-xs">
                <Sparkles className="w-3 h-3 mr-1" />
                +{EXIT_INTENT_CONFIG.priceAlertPoints} pts
              </Badge>
            </div>
            
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSetPriceAlert} className="gap-2">
                <Bell className="w-4 h-4" />
                {EXIT_INTENT_CONFIG.copy.priceAlertCTA}
              </Button>
            </div>
          </div>
          
          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or</span>
            </div>
          </div>
          
          {/* Save Search Option */}
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={handleSaveSearch}
          >
            <Bookmark className="w-4 h-4" />
            {EXIT_INTENT_CONFIG.copy.saveSearchCTA}
          </Button>
        </div>
        
        {/* Dismiss */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </DialogContent>
    </Dialog>
  );
}
