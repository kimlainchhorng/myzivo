/**
 * Account Promos Page
 * Shows available coupons, expiration dates, and usage rules
 */
import { useState, useCallback } from "react";
import { ArrowLeft, Tag, Clock, Gift, Copy, Check, ChevronRight, Sparkles, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useUserPromoWallet } from "@/hooks/useMarketing";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import PullToRefresh from "@/components/shared/PullToRefresh";
import { supabase } from "@/integrations/supabase/client";
import { format, isBefore, addDays, isAfter } from "date-fns";
import { toast } from "sonner";
import { motion } from "framer-motion";
import SEOHead from "@/components/SEOHead";

interface PromoCode {
  id: string;
  code: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  expires_at: string | null;
  min_fare: number | null;
  max_uses: number | null;
  uses: number;
  is_active: boolean;
}

export default function PromosPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: walletPromos, isLoading: walletLoading } = useUserPromoWallet(user?.id);

  const handlePullRefresh = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["public-promo-codes"] }),
      queryClient.invalidateQueries({ queryKey: ["user-promo-wallet"] }),
    ]);
  }, [queryClient]);

  const { data: publicPromos, isLoading: publicLoading } = useQuery({
    queryKey: ["public-promo-codes"],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("promo_codes")
        .select("*")
        .eq("is_active", true)
        .or(`expires_at.is.null,expires_at.gt.${now}`)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return (data || []) as PromoCode[];
    },
    staleTime: 1000 * 60 * 5,
  });

  const isLoading = walletLoading || publicLoading;

  const activeWalletPromos = walletPromos?.filter(item => {
    if (!item.is_active) return false;
    if (item.used_at) return false;
    if (item.expires_at && isBefore(new Date(item.expires_at), new Date())) return false;
    return true;
  }) || [];

  const totalPromos = activeWalletPromos.length + (publicPromos?.length || 0);

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

  const handleUseNow = (code: string) => {
    navigate("/eats", { state: { promoCode: code } });
  };

  const getDiscountText = (discountType: string, discountValue: number) => {
    if (discountType === "percent") {
      return `${discountValue}% off`;
    }
    return `$${(discountValue / 100).toFixed(2)} off`;
  };

  const getExpirationStatus = (expiresAt: string | null) => {
    if (!expiresAt) {
      return { text: "No expiration", color: "text-emerald-500", urgent: false };
    }
    const expDate = new Date(expiresAt);
    const now = new Date();
    
    if (isBefore(expDate, now)) {
      return { text: "Expired", color: "text-destructive", urgent: true };
    }
    if (isBefore(expDate, addDays(now, 3))) {
      return { text: `Expires ${format(expDate, "MMM d")}`, color: "text-amber-500", urgent: true };
    }
    return { text: `Expires ${format(expDate, "MMM d")}`, color: "text-muted-foreground", urgent: false };
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <SEOHead title="My Promos — ZIVO" description="Your available promo codes and coupons" />

      {/* Header */}
      <div className="sticky top-0 safe-area-top z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-muted border border-border/50 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-lg">My Promos</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-amber-500/20 to-card border border-amber-500/30 rounded-3xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center">
              <Tag className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Available Promos</p>
              <p className="text-2xl font-bold">{isLoading ? "—" : totalPromos}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Use promo codes at checkout to save on your orders!
          </p>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32 w-full rounded-2xl" />
            ))}
          </div>
        )}

        {/* Wallet Promos */}
        {!isLoading && activeWalletPromos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h2 className="font-bold">Exclusive Offers</h2>
            </div>
            <div className="space-y-3">
              {activeWalletPromos.map(item => {
                const code = item.promo_code?.code || "CODE";
                const discountText = item.promo_code?.discount_type === "percent"
                  ? `${item.promo_code.discount_value}% off`
                  : `$${((item.promo_code?.discount_value || 0) / 100).toFixed(2)} off`;
                const expStatus = getExpirationStatus(item.expires_at);

                return (
                  <PromoCard
                    key={item.id}
                    id={item.id}
                    code={code}
                    discountText={discountText}
                    expirationText={expStatus.text}
                    expirationColor={expStatus.color}
                    isUrgent={expStatus.urgent}
                    minOrder={null}
                    isExclusive
                    isCopied={copiedId === item.id}
                    onCopy={() => handleCopy(code, item.id)}
                    onUse={() => handleUseNow(code)}
                  />
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Public Promos */}
        {!isLoading && publicPromos && publicPromos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Gift className="w-4 h-4 text-primary" />
              <h2 className="font-bold">Available Codes</h2>
            </div>
            <div className="space-y-3">
              {publicPromos.map(promo => {
                const discountText = getDiscountText(promo.discount_type, promo.discount_value);
                const expStatus = getExpirationStatus(promo.expires_at);
                const minOrder = promo.min_fare ? `Min order: $${(promo.min_fare / 100).toFixed(2)}` : null;

                return (
                  <PromoCard
                    key={promo.id}
                    id={promo.id}
                    code={promo.code}
                    discountText={discountText}
                    expirationText={expStatus.text}
                    expirationColor={expStatus.color}
                    isUrgent={expStatus.urgent}
                    minOrder={minOrder}
                    isExclusive={false}
                    isCopied={copiedId === promo.id}
                    onCopy={() => handleCopy(promo.code, promo.id)}
                    onUse={() => handleUseNow(promo.code)}
                  />
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && totalPromos === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border/50 rounded-2xl p-8 text-center"
          >
            <Gift className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="font-medium text-muted-foreground">No promo codes available</p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              Check back later for exclusive offers!
            </p>
          </motion.div>
        )}

        {/* How to Use */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border/50 rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-bold">How to Use</h2>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Enter the code at checkout
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Discount applies automatically
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              One promo code per order
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}

interface PromoCardProps {
  id: string;
  code: string;
  discountText: string;
  expirationText: string;
  expirationColor: string;
  isUrgent: boolean;
  minOrder: string | null;
  isExclusive: boolean;
  isCopied: boolean;
  onCopy: () => void;
  onUse: () => void;
}

function PromoCard({
  id,
  code,
  discountText,
  expirationText,
  expirationColor,
  isUrgent,
  minOrder,
  isExclusive,
  isCopied,
  onCopy,
  onUse,
}: PromoCardProps) {
  return (
    <div className="bg-card border border-border/50 rounded-2xl p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isExclusive ? "bg-amber-500/20" : "bg-primary/20"
          }`}>
            <Tag className={`w-5 h-5 ${isExclusive ? "text-amber-500" : "text-primary"}`} />
          </div>
          <div>
            <p className="font-mono font-bold text-lg">{code}</p>
            <Badge 
              variant="outline" 
              className={`text-xs ${isExclusive ? "border-amber-500/50 text-amber-500" : ""}`}
            >
              {discountText}
            </Badge>
          </div>
        </div>
        {isExclusive && (
          <Badge className="bg-amber-500/20 text-amber-500 border-0 text-xs">
            <Sparkles className="w-3 h-3 mr-1" />
            Exclusive
          </Badge>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs mb-4">
        <span className={`flex items-center gap-1 ${expirationColor}`}>
          <Clock className="w-3 h-3" />
          {expirationText}
        </span>
        {minOrder && (
          <span className="text-muted-foreground">
            {minOrder}
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-10"
          onClick={onCopy}
        >
          {isCopied ? (
            <>
              <Check className="w-4 h-4 mr-2 text-emerald-500" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </>
          )}
        </Button>
        <Button
          size="sm"
          className="flex-1 h-10"
          onClick={onUse}
        >
          Use Now
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}