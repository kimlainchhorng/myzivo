import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Shield, Clock, CreditCard, Loader2, Check, Sparkles, Gift, ArrowRight, Timer, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface PriceItem {
  label: string;
  amount: number;
  isDiscount?: boolean;
  isTotal?: boolean;
}

interface BookingSummaryCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  items: PriceItem[];
  ctaLabel: string;
  onConfirm: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  accentColor?: "primary" | "eats" | "sky" | "amber" | "rides";
  features?: string[];
  estimatedTime?: string;
  promoCode?: string;
  urgencyMessage?: string;
  savings?: number;
}

const colorClasses = {
  primary: {
    button: "bg-gradient-to-r from-primary to-teal-400 hover:opacity-90 shadow-lg shadow-primary/30",
    accent: "text-primary",
    iconBg: "bg-gradient-to-br from-primary/20 to-primary/5",
    border: "border-primary/30",
    glow: "from-primary/20 to-teal-500/10",
  },
  eats: {
    button: "bg-gradient-to-r from-eats to-orange-500 hover:opacity-90 shadow-lg shadow-eats/30",
    accent: "text-eats",
    iconBg: "bg-gradient-to-br from-eats/20 to-eats/5",
    border: "border-eats/30",
    glow: "from-eats/20 to-orange-500/10",
  },
  sky: {
    button: "bg-gradient-to-r from-sky-500 to-blue-600 hover:opacity-90 shadow-lg shadow-sky-500/30",
    accent: "text-sky-500",
    iconBg: "bg-gradient-to-br from-sky-500/20 to-sky-500/5",
    border: "border-sky-500/30",
    glow: "from-sky-500/20 to-blue-500/10",
  },
  amber: {
    button: "bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 shadow-lg shadow-amber-500/30",
    accent: "text-amber-500",
    iconBg: "bg-gradient-to-br from-amber-500/20 to-amber-500/5",
    border: "border-amber-500/30",
    glow: "from-amber-500/20 to-orange-500/10",
  },
  rides: {
    button: "bg-gradient-to-r from-rides to-green-400 hover:opacity-90 shadow-lg shadow-rides/30",
    accent: "text-rides",
    iconBg: "bg-gradient-to-br from-rides/20 to-rides/5",
    border: "border-rides/30",
    glow: "from-rides/20 to-green-500/10",
  },
};

export const BookingSummaryCard = ({
  title,
  subtitle,
  icon,
  items,
  ctaLabel,
  onConfirm,
  isLoading = false,
  disabled = false,
  accentColor = "primary",
  features,
  estimatedTime,
  promoCode,
  urgencyMessage,
  savings,
}: BookingSummaryCardProps) => {
  const total = items.find((item) => item.isTotal);
  const lineItems = items.filter((item) => !item.isTotal);
  const colors = colorClasses[accentColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <Card className={cn(
        "relative overflow-hidden border-0 bg-gradient-to-br from-card/95 to-card backdrop-blur-xl shadow-xl",
        colors.border
      )}>
        {/* Background Glow */}
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.glow} opacity-50 pointer-events-none`} />
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-radial from-white/5 to-transparent blur-2xl" />
        
        <CardHeader className="pb-4 relative">
          <div className="flex items-center gap-3">
            {icon && (
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg",
                  colors.iconBg
                )}
              >
                {icon}
              </motion.div>
            )}
            <div>
              <CardTitle className="text-xl font-bold">{title}</CardTitle>
              {subtitle && (
                <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 relative">
          {/* Urgency Banner */}
          <AnimatePresence>
            {urgencyMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20"
              >
                <Timer className="w-4 h-4 text-amber-500 animate-pulse" />
                <span className="text-sm font-medium text-amber-600 dark:text-amber-400">{urgencyMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Line Items */}
          <div className="space-y-3">
            {lineItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between"
              >
                <span className="text-muted-foreground">{item.label}</span>
                <span
                  className={cn(
                    "font-medium",
                    item.isDiscount && "text-emerald-500"
                  )}
                >
                  {item.isDiscount && "-"}${Math.abs(item.amount).toFixed(2)}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Promo Code Applied */}
          {promoCode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
            >
              <Gift className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                Code "{promoCode}" applied!
              </span>
              {savings && (
                <Badge className="ml-auto bg-emerald-500/20 text-emerald-500 border-0">
                  -${savings.toFixed(2)}
                </Badge>
              )}
            </motion.div>
          )}

          <Separator className="bg-border/50" />

          {/* Total */}
          {total && (
            <div className="flex items-center justify-between">
              <span className="font-semibold text-lg">{total.label}</span>
              <motion.div
                key={total.amount}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-right"
              >
                <span className={cn("text-3xl font-bold", colors.accent)}>
                  ${total.amount.toFixed(2)}
                </span>
              </motion.div>
            </div>
          )}

          {/* Estimated Time */}
          {estimatedTime && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{estimatedTime}</span>
            </div>
          )}

          {/* Features */}
          {features && features.length > 0 && (
            <div className="space-y-2">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  className="flex items-center gap-2 text-sm"
                >
                  <div className={cn("w-5 h-5 rounded-full flex items-center justify-center", colors.iconBg)}>
                    <Check className={cn("w-3 h-3", colors.accent)} />
                  </div>
                  <span className="text-muted-foreground">{feature}</span>
                </motion.div>
              ))}
            </div>
          )}

          {/* CTA Button */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              className={cn("w-full h-14 rounded-2xl font-bold text-base text-white touch-manipulation min-h-[56px] transition-all duration-200", colors.button)}
              onClick={onConfirm}
              disabled={disabled || isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  <span>{ctaLabel}</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </Button>
          </motion.div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 pt-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="w-3.5 h-3.5 text-emerald-500" />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span>SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CreditCard className="w-3.5 h-3.5" />
              <span>All cards</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default BookingSummaryCard;
