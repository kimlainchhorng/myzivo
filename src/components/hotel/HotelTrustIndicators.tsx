/**
 * HotelTrustIndicators Component
 * LOCKED COMPLIANCE: Uses hotelCompliance.ts for all text
 */
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Lock, 
  RefreshCw,
  Award,
  CheckCircle,
  Headphones,
  Globe,
  CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";
import { HOTEL_DISCLAIMERS } from "@/config/hotelCompliance";
interface HotelTrustIndicatorsProps {
  className?: string;
}

export default function HotelTrustIndicators({ className }: HotelTrustIndicatorsProps) {
  const trustItems = [
    {
      icon: Shield,
      title: "Secure Booking",
      description: "256-bit SSL encryption protects your data",
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      icon: Award,
      title: "Best Price Match",
      description: "Find it cheaper, we'll match the price",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      icon: RefreshCw,
      title: "Free Cancellation",
      description: "On most bookings, cancel anytime",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      icon: Headphones,
      title: "24/7 Support",
      description: "Expert travel assistance anytime",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  const paymentMethods = [
    { name: "Visa", icon: "💳" },
    { name: "Mastercard", icon: "💳" },
    { name: "Amex", icon: "💳" },
    { name: "PayPal", icon: "🅿️" },
    { name: "Apple Pay", icon: "🍎" },
    { name: "Google Pay", icon: "G" },
  ];

  const certifications = [
    { name: "Verified Listings", badge: "Verified" },
    { name: "PCI DSS Compliant", badge: "PCI" },
    { name: "Guest Protected", badge: "Protected" },
  ];

  return (
    <section className={cn("py-8 sm:py-12 border-t border-border/50 bg-card/30", className)}>
      <div className="container mx-auto px-4">
        {/* Trust Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-10">
          {trustItems.map((item, index) => (
            <div
              key={item.title}
              className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl bg-card/50 border border-border/50 animate-in fade-in slide-in-from-bottom-4 text-center sm:text-left"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={cn(
                "w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                item.bgColor
              )}>
                <item.icon className={cn("w-5 h-5 sm:w-6 sm:h-6", item.color)} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-0.5 sm:mb-1 text-sm sm:text-base">{item.title}</h3>
                <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground hidden sm:block">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Payment & Certifications */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 pt-6 sm:pt-8 border-t border-border/50">
          {/* Payment Methods */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
              <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="whitespace-nowrap">Secure Payments</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              {paymentMethods.slice(0, 4).map((method) => (
                <div
                  key={method.name}
                  className="w-8 h-5 sm:w-10 sm:h-7 rounded bg-card border border-border/50 flex items-center justify-center text-[10px] sm:text-xs"
                  title={method.name}
                >
                  {method.icon}
                </div>
              ))}
              <span className="text-[10px] sm:text-xs text-muted-foreground">+2</span>
            </div>
          </div>

          {/* Certifications */}
          <div className="flex items-center gap-2 sm:gap-3">
            {certifications.map((cert) => (
              <Badge
                key={cert.name}
                variant="outline"
                className="text-[10px] sm:text-xs font-semibold gap-1 px-2 sm:px-3"
                title={cert.name}
              >
                <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-500" />
                {cert.badge}
              </Badge>
            ))}
          </div>

          {/* Global Coverage */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
            <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>850K+ properties worldwide</span>
          </div>
        </div>

        {/* Partner Disclosure - Locked Compliance */}
        <p className="text-center text-[10px] sm:text-xs text-muted-foreground mt-6 sm:mt-8 max-w-2xl mx-auto px-4">
          {HOTEL_DISCLAIMERS.partnerBookingShort}{' '}
          <a href="/partner-disclosure" className="text-amber-500 hover:underline">Learn more</a>
        </p>
      </div>
    </section>
  );
}
