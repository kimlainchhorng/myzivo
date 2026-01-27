import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  Share2,
  Download,
  Home,
  Copy,
  Sparkles,
  PartyPopper,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface BookingDetail {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

interface BookingConfirmationProps {
  confirmationNumber: string;
  title: string;
  subtitle?: string;
  details: BookingDetail[];
  totalAmount: number;
  onGoHome: () => void;
  onViewDetails?: () => void;
  accentColor?: "primary" | "eats" | "sky" | "amber" | "rides";
}

const accentColorClasses = {
  primary: "text-primary",
  eats: "text-eats",
  sky: "text-sky-400",
  amber: "text-amber-400",
  rides: "text-rides",
};

const bgAccentClasses = {
  primary: "bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10",
  eats: "bg-gradient-to-br from-eats/30 via-eats/20 to-eats/10",
  sky: "bg-gradient-to-br from-sky-500/30 via-sky-500/20 to-sky-500/10",
  amber: "bg-gradient-to-br from-amber-500/30 via-amber-500/20 to-amber-500/10",
  rides: "bg-gradient-to-br from-rides/30 via-rides/20 to-rides/10",
};

const gradientBorderClasses = {
  primary: "from-primary/50 to-primary/10",
  eats: "from-eats/50 to-eats/10",
  sky: "from-sky-500/50 to-sky-500/10",
  amber: "from-amber-500/50 to-amber-500/10",
  rides: "from-rides/50 to-rides/10",
};

export const BookingConfirmation = ({
  confirmationNumber,
  title,
  subtitle,
  details,
  totalAmount,
  onGoHome,
  onViewDetails,
  accentColor = "primary",
}: BookingConfirmationProps) => {
  const copyConfirmation = () => {
    navigator.clipboard.writeText(confirmationNumber);
    toast.success("Confirmation number copied!");
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4 relative">
      {/* Background celebration effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.5 }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 0.7 }}
          className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl"
        />
      </div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-lg relative z-10"
      >
        <Card className="glass-card overflow-hidden border-0 shadow-2xl shadow-black/20">
          {/* Gradient border effect */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-b rounded-xl opacity-50 pointer-events-none",
            gradientBorderClasses[accentColor]
          )} style={{ padding: '1px' }}>
            <div className="w-full h-full bg-card rounded-xl" />
          </div>
          
          <CardContent className="p-0 relative">
            {/* Success Header */}
            <div
              className={cn(
                "p-8 text-center relative overflow-hidden",
                bgAccentClasses[accentColor]
              )}
            >
              {/* Floating particles */}
              <motion.div
                initial={{ y: 0 }}
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute top-4 left-8"
              >
                <Sparkles className="w-4 h-4 text-primary/40" />
              </motion.div>
              <motion.div
                initial={{ y: 0 }}
                animate={{ y: [5, -5, 5] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute top-12 right-12"
              >
                <PartyPopper className="w-5 h-5 text-amber-500/40" />
              </motion.div>
              
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                className="mb-4 relative inline-block"
              >
                <div className={cn(
                  "w-20 h-20 rounded-full flex items-center justify-center mx-auto",
                  "bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/30"
                )}>
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="absolute -inset-2 rounded-full border-2 border-emerald-500/30"
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-2xl font-display font-bold mb-1">Booking Confirmed!</h2>
                <p className="text-muted-foreground">{title}</p>
                {subtitle && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {subtitle}
                  </p>
                )}
              </motion.div>
            </div>

            <div className="p-6 space-y-6">
              {/* Confirmation Number */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-r from-muted/80 to-muted/40 rounded-xl p-4 border border-border/50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                      Confirmation Number
                    </p>
                    <p className="text-xl font-mono font-bold tracking-wider">
                      {confirmationNumber}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyConfirmation}
                    className="shrink-0 h-10 w-10 rounded-xl hover:bg-primary/10 hover:border-primary/30"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>

              {/* Booking Details */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-3"
              >
                {details.map((detail, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3"
                  >
                    {detail.icon && (
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                        {detail.icon}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">
                        {detail.label}
                      </p>
                      <p className="font-medium">{detail.value}</p>
                    </div>
                  </div>
                ))}
              </motion.div>

              <Separator />

              {/* Total */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-between"
              >
                <span className="text-muted-foreground">Total Paid</span>
                <span className="text-2xl font-bold">
                  ${totalAmount.toFixed(2)}
                </span>
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex flex-col gap-3"
              >
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Receipt
                  </Button>
                </div>
                <Button onClick={onGoHome} className="w-full">
                  <Home className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
                {onViewDetails && (
                  <Button variant="ghost" onClick={onViewDetails}>
                    View Booking Details
                  </Button>
                )}
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default BookingConfirmation;
