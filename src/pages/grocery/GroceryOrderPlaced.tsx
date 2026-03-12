/**
 * GroceryOrderPlaced - Order confirmation page after checkout
 */
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, ShoppingCart, ArrowLeft, Clock, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GroceryOrderPlaced() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const orderId = params.get("id") || "";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 15, stiffness: 200 }}
        className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6"
      >
        <CheckCircle className="h-10 w-10 text-primary" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-bold mb-2"
      >
        Order Placed!
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-sm text-muted-foreground max-w-xs mb-8"
      >
        A ZIVO driver will pick up your Walmart items and deliver them to your door.
      </motion.p>

      {orderId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl bg-muted/50 border border-border/50 px-4 py-3 mb-6"
        >
          <p className="text-xs text-muted-foreground">Order ID</p>
          <p className="text-sm font-mono font-semibold">{orderId.slice(0, 8)}</p>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col gap-3 w-full max-w-xs"
      >
        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
          <span>Estimated delivery: 45–90 min</span>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 text-sm">
          <Truck className="h-4 w-4 text-muted-foreground shrink-0" />
          <span>You'll be notified when a driver accepts</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 flex gap-3"
      >
        <Button variant="outline" onClick={() => navigate("/grocery")} className="rounded-xl">
          <ShoppingCart className="h-4 w-4 mr-2" /> Shop More
        </Button>
        <Button onClick={() => navigate("/")} className="rounded-xl">
          <ArrowLeft className="h-4 w-4 mr-2" /> Home
        </Button>
      </motion.div>
    </div>
  );
}
