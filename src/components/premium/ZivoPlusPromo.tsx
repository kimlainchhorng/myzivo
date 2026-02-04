/**
 * ZivoPlusPromo - Promotional card for non-members
 */

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Zap, Star, ArrowRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ZivoPlusPromoProps {
  variant?: "banner" | "card" | "minimal";
  className?: string;
  onDismiss?: () => void;
}

export function ZivoPlusPromo({ variant = "card", className, onDismiss }: ZivoPlusPromoProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  if (isDismissed) return null;

  if (variant === "banner") {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/20 rounded-xl p-3",
          className
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Crown className="w-5 h-5 text-amber-500" />
            <p className="text-sm">
              <span className="font-semibold text-amber-400">ZIVO Plus:</span>{" "}
              <span className="text-muted-foreground">Get 2x miles and early deal access</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/zivo-plus">
              <Button size="sm" variant="ghost" className="text-amber-400 hover:text-amber-300 gap-1">
                Learn more
                <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="w-6 h-6 p-0"
              onClick={handleDismiss}
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (variant === "minimal") {
    return (
      <Link to="/zivo-plus" className={cn("group", className)}>
        <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-amber-400 transition-colors">
          <Crown className="w-4 h-4 text-amber-500" />
          <span>Upgrade to Plus for 2x miles</span>
          <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </Link>
    );
  }

  return (
    <Card className={cn(
      "overflow-hidden border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5",
      className
    )}>
      <CardContent className="p-5 relative">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 w-6 h-6 p-0 text-muted-foreground hover:text-foreground"
          onClick={handleDismiss}
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center">
            <Crown className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h4 className="font-semibold">ZIVO Plus</h4>
            <p className="text-xs text-muted-foreground">Travel smarter</p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Early access to deals</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Star className="w-4 h-4 text-amber-500" />
            <span>2x ZIVO Miles earning</span>
          </div>
        </div>

        <Link to="/zivo-plus">
          <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 gap-2">
            Upgrade Now
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>

        <p className="text-[10px] text-muted-foreground text-center mt-3">
          Starting at $9.99/month
        </p>
      </CardContent>
    </Card>
  );
}

export default ZivoPlusPromo;
