/**
 * GroceryOrderPlaced - Premium order confirmation with animated stepper
 */
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle, ShoppingCart, ArrowLeft, Clock, Truck, Package,
  MapPin, Sparkles, ShoppingBag, ChevronRight, PartyPopper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ZivoMobileNav from "@/components/app/ZivoMobileNav";

const STEPS = [
  { icon: CheckCircle, label: "Order Placed", desc: "We've received your order" },
  { icon: ShoppingBag, label: "Driver Assigned", desc: "A ZIVO driver will be matched shortly" },
  { icon: Package, label: "Shopping", desc: "Your driver will shop your items in-store" },
  { icon: Truck, label: "On the Way", desc: "Items will be delivered to your door" },
];

export default function GroceryOrderPlaced() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const orderId = params.get("id") || "";

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-24">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-80 w-80 rounded-full bg-primary/8 blur-[80px]" />
        <div className="absolute bottom-1/3 -right-20 h-48 w-48 rounded-full bg-emerald-500/6 blur-[60px]" />
      </div>

      <div className="relative max-w-md mx-auto px-6 pt-12 flex flex-col items-center">
        {/* Success animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 12, stiffness: 150, delay: 0.1 }}
          className="h-24 w-24 rounded-full bg-gradient-to-br from-emerald-500/20 to-primary/10 flex items-center justify-center mb-6 ring-4 ring-emerald-500/10 shadow-2xl shadow-emerald-500/20"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 300 }}
          >
            <PartyPopper className="h-11 w-11 text-primary" />
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-extrabold mb-1 tracking-tight"
        >
          Order Placed! 🎉
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-[13px] text-muted-foreground text-center max-w-xs mb-6"
        >
          A ZIVO driver will shop your items in-store and deliver them to your door.
        </motion.p>

        {/* Order ID */}
        {orderId && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.45 }}
            className="rounded-2xl bg-muted/20 border border-border/20 px-5 py-3.5 mb-6 w-full"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Order ID</p>
                <p className="text-[14px] font-mono font-bold text-foreground mt-0.5">{orderId.slice(0, 8).toUpperCase()}</p>
              </div>
              <div className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/15">
                <span className="text-[10px] font-bold text-primary">Processing</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Delivery stepper */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full rounded-2xl bg-card border border-border/20 p-5 mb-6"
        >
          <h3 className="text-[13px] font-bold mb-4 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            What's next
          </h3>
          <div className="space-y-0">
            {STEPS.map((step, i) => {
              const isActive = i === 0;
              const StepIcon = step.icon;
              return (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55 + i * 0.08 }}
                  className="flex items-start gap-3.5 relative"
                >
                  {/* Connector line */}
                  {i < STEPS.length - 1 && (
                    <div className={`absolute left-[15px] top-[32px] w-0.5 h-[calc(100%-16px)] ${isActive ? "bg-primary" : "bg-border/30"}`} />
                  )}
                  <div className={`relative z-10 h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                      : "bg-muted/30 text-muted-foreground/40 border border-border/20"
                  }`}>
                    <StepIcon className="h-4 w-4" />
                  </div>
                  <div className="pb-5">
                    <p className={`text-[12px] font-bold ${isActive ? "text-foreground" : "text-muted-foreground/50"}`}>
                      {step.label}
                    </p>
                    <p className={`text-[10px] mt-0.5 ${isActive ? "text-muted-foreground" : "text-muted-foreground/30"}`}>
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ETA + info cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex gap-3 w-full mb-6"
        >
          <div className="flex-1 p-3.5 rounded-2xl bg-primary/5 border border-primary/10 text-center">
            <Clock className="h-5 w-5 text-primary mx-auto mb-1.5" />
            <p className="text-[12px] font-bold text-foreground">35–50 min</p>
            <p className="text-[9px] text-muted-foreground">Est. delivery</p>
          </div>
          <div className="flex-1 p-3.5 rounded-2xl bg-muted/20 border border-border/15 text-center">
            <Truck className="h-5 w-5 text-muted-foreground mx-auto mb-1.5" />
            <p className="text-[12px] font-bold text-foreground">Live Tracking</p>
            <p className="text-[9px] text-muted-foreground">Updates soon</p>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col gap-2.5 w-full"
        >
          <Button
            onClick={() => navigate("/grocery/orders")}
            className="w-full rounded-2xl h-12 font-bold gap-2"
          >
            <MapPin className="h-4 w-4" />
            Track My Order
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="flex gap-2.5">
            <Button
              variant="outline"
              onClick={() => navigate("/grocery")}
              className="flex-1 rounded-2xl h-11"
            >
              <ShoppingCart className="h-4 w-4 mr-1.5" />
              Shop More
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="flex-1 rounded-2xl h-11"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Home
            </Button>
          </div>
        </motion.div>
      </div>

      <ZivoMobileNav />
    </div>
  );
}
