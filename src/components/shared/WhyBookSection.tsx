import { Card, CardContent } from "@/components/ui/card";
import { 
  Shield, 
  CreditCard, 
  Search, 
  Clock, 
  BadgeCheck,
  Headphones,
  RefreshCw,
  Zap,
  LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * WHY BOOK WITH ZIVO SECTION
 * Trust-building section with clear value propositions
 * Customized per service type
 */

export type ServiceType = "flights" | "hotels" | "cars";

interface TrustPoint {
  icon: LucideIcon;
  title: string;
  description: string;
}

const serviceContent: Record<ServiceType, {
  title: string;
  subtitle: string;
  points: TrustPoint[];
  accentColor: string;
}> = {
  flights: {
    title: "Why search with ZIVO Flights?",
    subtitle: "Compare prices from 500+ airlines in seconds",
    accentColor: "sky",
    points: [
      {
        icon: Search,
        title: "Compare 500+ Airlines",
        description: "Search across major carriers and budget airlines to find the best options."
      },
      {
        icon: CreditCard,
        title: "No Booking Fees",
        description: "ZIVO is free to use. You pay only the price shown by our partners."
      },
      {
        icon: Zap,
        title: "Real-Time Prices",
        description: "Live pricing from airlines ensures you see current availability."
      },
      {
        icon: Shield,
        title: "Book with Confidence",
        description: "Complete your booking on trusted airline and travel agency sites."
      },
    ],
  },
  hotels: {
    title: "Why search with ZIVO Hotels?",
    subtitle: "Find the best hotel deals from top booking sites",
    accentColor: "amber",
    points: [
      {
        icon: Search,
        title: "Compare Multiple Sites",
        description: "Search Booking.com, Hotels.com, Expedia, and more in one place."
      },
      {
        icon: RefreshCw,
        title: "Free Cancellation Options",
        description: "Many hotels offer flexible cancellation through our partners."
      },
      {
        icon: BadgeCheck,
        title: "Verified Reviews",
        description: "Read real guest reviews to make informed decisions."
      },
      {
        icon: Headphones,
        title: "Partner Support",
        description: "Book directly with partners who provide customer service."
      },
    ],
  },
  cars: {
    title: "Why search with ZIVO Car Rental?",
    subtitle: "Compare car rentals from trusted providers worldwide",
    accentColor: "violet",
    points: [
      {
        icon: Search,
        title: "Compare Top Providers",
        description: "Search Rentalcars, Kayak, Expedia, and local companies."
      },
      {
        icon: CreditCard,
        title: "No Hidden Fees",
        description: "See transparent pricing before you book on partner sites."
      },
      {
        icon: Clock,
        title: "Flexible Pickup",
        description: "Airport and city locations with 24/7 pickup options."
      },
      {
        icon: Shield,
        title: "Insurance Options",
        description: "Choose from multiple protection plans on partner sites."
      },
    ],
  },
};

interface WhyBookSectionProps {
  service: ServiceType;
  className?: string;
}

export default function WhyBookSection({ service, className = '' }: WhyBookSectionProps) {
  const content = serviceContent[service];
  
  const accentClasses = {
    sky: {
      iconBg: "bg-sky-500/10",
      iconColor: "text-sky-500",
      gradient: "from-sky-500 to-blue-500",
    },
    amber: {
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-500",
      gradient: "from-amber-500 to-orange-500",
    },
    violet: {
      iconBg: "bg-violet-500/10",
      iconColor: "text-violet-500",
      gradient: "from-violet-500 to-purple-500",
    },
  }[content.accentColor];

  return (
    <section className={cn("py-12 sm:py-16", className)}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">
            {content.title}
          </h2>
          <p className="text-muted-foreground">
            {content.subtitle}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {content.points.map((point, index) => (
            <Card 
              key={point.title}
              className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-border/50"
            >
              <CardContent className="p-5 sm:p-6">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all group-hover:scale-110",
                  accentClasses.iconBg
                )}>
                  <point.icon className={cn("w-6 h-6", accentClasses.iconColor)} />
                </div>
                <h3 className="font-bold text-base mb-2">{point.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {point.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom disclaimer */}
        <p className="text-center text-xs text-muted-foreground mt-8 max-w-2xl mx-auto">
          ZIVO is a search and comparison platform. We help you find great options, 
          but all bookings are completed directly with our trusted travel partners.
        </p>
      </div>
    </section>
  );
}
