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
  primary: "bg-primary/20",
  eats: "bg-eats/20",
  sky: "bg-sky-500/20",
  amber: "bg-amber-500/20",
  rides: "bg-rides/20",
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
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-lg"
      >
        <Card className="glass-card overflow-hidden">
          <CardContent className="p-0">
            {/* Success Header */}
            <div
              className={cn(
                "p-8 text-center",
                bgAccentClasses[accentColor]
              )}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mb-4"
              >
                <CheckCircle2
                  className={cn(
                    "w-16 h-16 mx-auto",
                    accentColorClasses[accentColor]
                  )}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-2xl font-bold mb-1">Booking Confirmed!</h2>
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
                transition={{ delay: 0.4 }}
                className="bg-muted/50 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Confirmation Number
                    </p>
                    <p className="text-lg font-mono font-bold">
                      {confirmationNumber}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={copyConfirmation}
                    className="shrink-0"
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
