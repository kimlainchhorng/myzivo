/**
 * HomepageAdBanner - Responsive promotional banner
 * Shows signup CTA for signed-out, ZIVO+ for signed-in users
 */
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Crown, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HomepageAdBannerProps {
  className?: string;
}

export function HomepageAdBanner({ className }: HomepageAdBannerProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <section className={cn("py-6", className)}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl border border-primary/20"
        >
          {/* Animated shimmer */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10" />
          <div className="absolute inset-0 animate-[shimmer_3s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 p-6 sm:p-8">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                {user ? (
                  <Crown className="w-6 h-6 text-primary" />
                ) : (
                  <Sparkles className="w-6 h-6 text-primary" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold">
                  {user ? "Unlock ZIVO+ Exclusive Deals" : "Sign Up & Save $10"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {user
                    ? "Free delivery, reduced fees, and priority support"
                    : "On your first flight, hotel, or car rental booking"}
                </p>
              </div>
            </div>

            <Button
              onClick={() => navigate(user ? "/membership" : "/signup")}
              className="rounded-xl font-bold gap-2 shrink-0"
            >
              {user ? "Join ZIVO+" : "Get Started Free"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Ad label */}
          <div className="absolute top-2 right-3 text-[9px] uppercase tracking-wider text-muted-foreground/50 font-medium">
            Promo
          </div>
        </motion.div>
      </div>
    </section>
  );
}
