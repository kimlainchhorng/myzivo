/**
 * Birthday Offer Component
 * Special birthday reward display
 */

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Gift,
  Sparkles,
  Copy,
  Check,
  Clock,
  PartyPopper,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BirthdayOfferProps {
  code: string;
  discount: string;
  bonusMiles: number;
  expiresAt: string;
  className?: string;
}

const BirthdayOffer = ({
  code,
  discount,
  bonusMiles,
  expiresAt,
  className,
}: BirthdayOfferProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Code copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy code");
    }
  };

  const daysLeft = Math.ceil(
    (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card
      className={cn(
        "overflow-hidden bg-gradient-to-br from-violet-500/10 via-pink-500/10 to-amber-500/10",
        "border-violet-500/20",
        className
      )}
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Badge className="bg-gradient-to-r from-violet-500 to-pink-500 text-white border-0 gap-1">
            <PartyPopper className="w-3 h-3" />
            Birthday Reward
          </Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {daysLeft} days left
          </div>
        </div>

        {/* Main Content */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-violet-500/20 to-pink-500/20 mb-4">
            <Gift className="w-8 h-8 text-violet-500" />
          </div>
          <h3 className="text-xl font-bold mb-1">Happy Birthday!</h3>
          <p className="text-sm text-muted-foreground">
            Here's a special gift just for you
          </p>
        </div>

        {/* Rewards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3 rounded-xl bg-background/50 text-center">
            <Sparkles className="w-5 h-5 mx-auto text-amber-500 mb-1" />
            <p className="text-lg font-bold">{discount}</p>
            <p className="text-xs text-muted-foreground">Discount</p>
          </div>
          <div className="p-3 rounded-xl bg-background/50 text-center">
            <Sparkles className="w-5 h-5 mx-auto text-violet-500 mb-1" />
            <p className="text-lg font-bold">+{bonusMiles.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Bonus Miles</p>
          </div>
        </div>

        {/* Promo Code */}
        <div className="relative">
          <Input
            value={code}
            readOnly
            className="pr-24 text-center font-mono font-bold bg-background/50"
          />
          <Button
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <>
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </>
            )}
          </Button>
        </div>

        <p className="text-[10px] text-center text-muted-foreground mt-4">
          Valid for one booking. Expires {new Date(expiresAt).toLocaleDateString()}.
        </p>
      </CardContent>
    </Card>
  );
};

export default BirthdayOffer;
