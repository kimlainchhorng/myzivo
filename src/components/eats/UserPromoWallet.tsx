/**
 * User Promo Wallet
 * Display and manage user's saved promo codes from campaigns
 */
import { useState } from "react";
import { Gift, Clock, Check, Copy, Tag, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useUserPromoWallet, useMarkPromoUsed } from "@/hooks/useMarketing";
import { format, isAfter, isBefore, addDays } from "date-fns";
import { toast } from "sonner";

interface UserPromoWalletProps {
  onApplyPromo?: (code: string) => void;
  compact?: boolean;
}

export default function UserPromoWallet({ onApplyPromo, compact = false }: UserPromoWalletProps) {
  const { user } = useAuth();
  const { data: wallet, isLoading } = useUserPromoWallet(user?.id);
  const markUsedMutation = useMarkPromoUsed();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      toast.success("Code copied to clipboard");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Failed to copy code");
    }
  };

  const handleApply = (code: string, walletId: string) => {
    if (onApplyPromo) {
      onApplyPromo(code);
    }
  };

  const activePromos = wallet?.filter(item => {
    if (!item.is_active) return false;
    if (item.used_at) return false;
    if (item.expires_at && isBefore(new Date(item.expires_at), new Date())) return false;
    return true;
  }) || [];

  if (isLoading) {
    return (
      <Card className="bg-zinc-900/80 border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Gift className="h-4 w-4 text-primary" />
            My Promos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2].map(i => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activePromos.length === 0) {
    if (compact) return null;
    
    return (
      <Card className="bg-zinc-900/80 border-white/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Gift className="h-4 w-4 text-primary" />
            My Promos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Gift className="h-10 w-10 mx-auto text-white/20 mb-2" />
            <p className="text-white/60">No active promo codes</p>
            <p className="text-sm text-white/40">Check back later for exclusive offers!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-zinc-900/80 border-white/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Gift className="h-4 w-4 text-primary" />
          My Promos
          <Badge variant="secondary" className="ml-auto">
            {activePromos.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activePromos.map(item => {
            const isExpiringSoon = item.expires_at && 
              isBefore(new Date(item.expires_at), addDays(new Date(), 3));
            
            const discountText = item.promo_code?.discount_type === "percent"
              ? `${item.promo_code.discount_value}% off`
              : `$${(item.promo_code?.discount_value || 0) / 100} off`;

            return (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50 border border-white/5"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Tag className="h-5 w-5 text-primary" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white">
                      {item.promo_code?.code || "CODE"}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {discountText}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1">
                    {item.expires_at && (
                      <span className={`text-xs flex items-center gap-1 ${
                        isExpiringSoon ? "text-amber-400" : "text-white/50"
                      }`}>
                        <Clock className="h-3 w-3" />
                        Expires {format(new Date(item.expires_at), "MMM d")}
                      </span>
                    )}
                    {item.campaign_id && (
                      <span className="text-xs text-white/40 flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        Exclusive offer
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleCopy(item.promo_code?.code || "", item.id)}
                  >
                    {copiedId === item.id ? (
                      <Check className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  
                  {onApplyPromo && (
                    <Button
                      size="sm"
                      onClick={() => handleApply(item.promo_code?.code || "", item.id)}
                    >
                      Apply
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
