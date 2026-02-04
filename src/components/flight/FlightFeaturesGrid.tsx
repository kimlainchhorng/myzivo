/**
 * ZIVO Flights Features Grid
 * 
 * Displays cabin classes, flight types, travel extras, and deals/tools
 * in a structured, SEO-friendly grid layout.
 */

import { 
  Plane, 
  ArrowRightLeft, 
  MapPin, 
  Compass,
  Shield, 
  Luggage, 
  Car, 
  Building2,
  Zap,
  Bell,
  Lightbulb,
  Armchair,
  Crown,
  Star,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  href?: string;
}

interface FeatureSection {
  title: string;
  badge: string;
  badgeColor: string;
  items: FeatureItem[];
}

const cabinClasses: FeatureItem[] = [
  {
    icon: <Armchair className="w-5 h-5" />,
    title: "Economy",
    description: "Best value fares",
  },
  {
    icon: <Star className="w-5 h-5" />,
    title: "Premium Economy",
    description: "Extra comfort & legroom",
  },
  {
    icon: <Crown className="w-5 h-5" />,
    title: "Business Class",
    description: "Priority & comfort",
  },
  {
    icon: <Sparkles className="w-5 h-5" />,
    title: "First Class",
    description: "Premium travel experience",
  },
];

const flightTypes: FeatureItem[] = [
  {
    icon: <ArrowRightLeft className="w-5 h-5" />,
    title: "Round Trip",
    description: "Depart and return",
  },
  {
    icon: <Plane className="w-5 h-5" />,
    title: "One Way",
    description: "Single destination",
  },
  {
    icon: <MapPin className="w-5 h-5" />,
    title: "Multi-City",
    description: "Multiple destinations",
  },
  {
    icon: <Compass className="w-5 h-5" />,
    title: "Explore Anywhere",
    description: "Flexible travel ideas",
    href: "/flights/explore",
  },
];

const travelExtras: FeatureItem[] = [
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Travel Insurance",
    description: "Provided by partners",
    href: "/extras",
  },
  {
    icon: <Luggage className="w-5 h-5" />,
    title: "Extra Baggage",
    description: "Airline-dependent",
  },
  {
    icon: <Car className="w-5 h-5" />,
    title: "Airport Transfers",
    description: "Partner services",
    href: "/extras",
  },
  {
    icon: <Building2 className="w-5 h-5" />,
    title: "Hotels & Stays",
    description: "Compare hotel options",
    href: "/hotels",
  },
];

const dealsTools: FeatureItem[] = [
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Flash Deals",
    description: "Limited-time partner offers",
    href: "/flights/deals",
  },
  {
    icon: <Bell className="w-5 h-5" />,
    title: "Price Alerts",
    description: "Track price changes",
  },
  {
    icon: <Lightbulb className="w-5 h-5" />,
    title: "Fare Tips",
    description: "When to book & save more",
  },
];

const sections: FeatureSection[] = [
  {
    title: "Cabin Classes",
    badge: "Classes",
    badgeColor: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    items: cabinClasses,
  },
  {
    title: "Flight Types",
    badge: "Search Options",
    badgeColor: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    items: flightTypes,
  },
  {
    title: "Travel Extras",
    badge: "Add-Ons",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    items: travelExtras,
  },
  {
    title: "Deals & Tools",
    badge: "Save More",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    items: dealsTools,
  },
];

function FeatureCard({ item }: { item: FeatureItem }) {
  const content = (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-card/50 border border-border/50 hover:border-border hover:bg-card/80 transition-all group">
      <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
        <span className="text-muted-foreground group-hover:text-primary transition-colors">
          {item.icon}
        </span>
      </div>
      <div className="min-w-0">
        <h4 className="font-semibold text-sm">{item.title}</h4>
        <p className="text-xs text-muted-foreground">{item.description}</p>
      </div>
    </div>
  );

  if (item.href) {
    return (
      <Link to={item.href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

interface FlightFeaturesGridProps {
  className?: string;
}

export default function FlightFeaturesGrid({ className }: FlightFeaturesGridProps) {
  return (
    <section className={cn("py-12 md:py-16", className)}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500/10 border border-sky-500/20 mb-4">
            <Plane className="w-4 h-4 text-sky-400" />
            <span className="text-sm font-medium text-sky-400">ZIVO Flights</span>
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
            Compare Flights from 500+ Airlines Worldwide
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Search all cabin classes, flight types, and travel extras in one place
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {sections.map((section) => (
            <div key={section.title} className="space-y-3">
              {/* Section Header */}
              <div className="flex items-center gap-2 mb-4">
                <span className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-medium border",
                  section.badgeColor
                )}>
                  {section.badge}
                </span>
                <h3 className="font-semibold text-sm">{section.title}</h3>
              </div>
              
              {/* Section Items */}
              <div className="space-y-2">
                {section.items.map((item) => (
                  <FeatureCard key={item.title} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
