import { 
  Shield, 
  CreditCard, 
  Search, 
  Clock, 
  BadgeCheck,
  Headphones,
  RefreshCw,
  Zap,
  Lock,
  Award,
  LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * TRUST SECTION
 * Premium trust badges and value propositions
 * Conversion-focused design
 */

export type ServiceType = "flights" | "hotels" | "cars";

interface TrustPoint {
  icon: LucideIcon;
  title: string;
  description: string;
}

const serviceContent: Record<ServiceType, {
  title: string;
  points: TrustPoint[];
  accentColor: string;
}> = {
  flights: {
    title: "Why Search with ZIVO?",
    accentColor: "sky",
    points: [
      {
        icon: Search,
        title: "500+ Airlines",
        description: "Search major carriers and budget airlines"
      },
      {
        icon: CreditCard,
        title: "No Booking Fees",
        description: "We don't charge extra - you pay partner prices"
      },
      {
        icon: Zap,
        title: "Real-Time Prices",
        description: "Live pricing from our travel partners"
      },
      {
        icon: Shield,
        title: "Secure Booking",
        description: "Book directly with trusted airlines"
      },
    ],
  },
  hotels: {
    title: "Why Search with ZIVO?",
    accentColor: "amber",
    points: [
      {
        icon: Search,
        title: "Compare Sites",
        description: "Booking.com, Hotels.com & more in one search"
      },
      {
        icon: RefreshCw,
        title: "Free Cancellation",
        description: "Flexible booking options available"
      },
      {
        icon: BadgeCheck,
        title: "Verified Reviews",
        description: "Real guest reviews from trusted sources"
      },
      {
        icon: Headphones,
        title: "Partner Support",
        description: "Customer service from booking partners"
      },
    ],
  },
  cars: {
    title: "Why Search with ZIVO?",
    accentColor: "violet",
    points: [
      {
        icon: Search,
        title: "Compare Providers",
        description: "Hertz, Avis, Enterprise & more"
      },
      {
        icon: CreditCard,
        title: "No Hidden Fees",
        description: "Transparent pricing shown upfront"
      },
      {
        icon: Clock,
        title: "24/7 Pickup",
        description: "Airport and city locations"
      },
      {
        icon: Shield,
        title: "Insurance Options",
        description: "Full protection plans available"
      },
    ],
  },
};

// Partner logos (text-based for now)
const partners = {
  flights: ["American Airlines", "Delta", "United", "Southwest", "JetBlue", "Spirit"],
  hotels: ["Booking.com", "Hotels.com", "Expedia", "Agoda", "Trip.com"],
  cars: ["Hertz", "Avis", "Enterprise", "Budget", "National", "Alamo"],
};

interface TrustSectionProps {
  service: ServiceType;
  className?: string;
}

export default function TrustSection({ service, className = '' }: TrustSectionProps) {
  const content = serviceContent[service];
  
  const accentClasses = {
    iconBg: {
      sky: "bg-sky-500/10",
      amber: "bg-amber-500/10",
      violet: "bg-violet-500/10",
    }[content.accentColor],
    iconColor: {
      sky: "text-sky-500",
      amber: "text-amber-500",
      violet: "text-violet-500",
    }[content.accentColor],
    borderColor: {
      sky: "border-sky-500/20",
      amber: "border-amber-500/20",
      violet: "border-violet-500/20",
    }[content.accentColor],
  };

  return (
    <section className={cn("py-12 sm:py-16", className)}>
      <div className="container mx-auto px-4">
        {/* Title */}
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-center mb-10">
          {content.title}
        </h2>

        {/* Trust points grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
          {content.points.map((point) => (
            <div 
              key={point.title}
              className={cn(
                "p-5 sm:p-6 rounded-2xl bg-card border",
                accentClasses.borderColor,
                "transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                accentClasses.iconBg
              )}>
                <point.icon className={cn("w-6 h-6", accentClasses.iconColor)} />
              </div>
              <h3 className="font-bold text-sm sm:text-base mb-1">{point.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {point.description}
              </p>
            </div>
          ))}
        </div>

        {/* Partners row */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">
            Trusted Partners
          </p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            {partners[service].map((partner) => (
              <div 
                key={partner}
                className="px-4 py-2 rounded-xl bg-muted/50 text-xs sm:text-sm text-muted-foreground font-medium hover:bg-muted/70 transition-all duration-200"
              >
                {partner}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom disclaimer */}
        <div className="mt-10 pt-6 border-t border-border/50 text-center">
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>Secure ZIVO Checkout</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              <span>Licensed Ticketing Partners</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>Protected Booking</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3 max-w-2xl mx-auto">
            ZIVO sells flight tickets as a sub-agent of licensed ticketing providers. Tickets issued by authorized partners.
          </p>
        </div>
      </div>
    </section>
  );
}
