/**
 * ZIVO Mobility Features Grid
 * 
 * Displays Rides, Eats, Move services and driver signup
 * in a structured, SEO-friendly grid layout.
 */

import { 
  Car, 
  UtensilsCrossed,
  Package,
  Users,
  MapPin,
  Clock,
  Truck,
  CheckCircle,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface ServiceItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  href?: string;
  color: string;
  bgColor: string;
}

const ZIVO_DRIVER_URL = "https://zivo-driver-app.rork.app";

const services: ServiceItem[] = [
  {
    icon: <Car className="w-5 h-5" />,
    title: "ZIVO Rides",
    description: "Request local rides",
    href: "/rides",
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
  },
  {
    icon: <UtensilsCrossed className="w-5 h-5" />,
    title: "ZIVO Eats",
    description: "Order food from restaurants",
    href: "/eats",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    icon: <Package className="w-5 h-5" />,
    title: "ZIVO Move",
    description: "Package & courier delivery",
    href: "/move",
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
  },
];

const driverBenefits = [
  "Flexible hours",
  "Weekly payouts",
  "Keep 100% of tips",
  "Multiple services",
];

function ServiceCard({ item }: { item: ServiceItem }) {
  return (
    <Link to={item.href || "#"} className="block group">
      <div className="p-5 rounded-2xl bg-card border border-border/50 hover:border-border hover:shadow-lg transition-all">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform",
          item.bgColor
        )}>
          <span className={item.color}>{item.icon}</span>
        </div>
        <h3 className="font-bold text-lg mb-1">{item.title}</h3>
        <p className="text-sm text-muted-foreground">{item.description}</p>
      </div>
    </Link>
  );
}

interface MobilityFeaturesGridProps {
  className?: string;
  showDriverCTA?: boolean;
}

export default function MobilityFeaturesGrid({ 
  className,
  showDriverCTA = true 
}: MobilityFeaturesGridProps) {
  const handleOpenZivoDriver = () => {
    window.open(ZIVO_DRIVER_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <section className={cn("py-12 md:py-16", className)}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 mb-4">
            <Truck className="w-4 h-4 text-rose-400" />
            <span className="text-sm font-medium text-rose-400">ZIVO Rides · Eats · Move</span>
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
            Local Services Powered by ZIVO Driver
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Rides, food delivery, and package services — all from one platform
          </p>
        </div>

        {/* Services Grid */}
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2.5 py-1 rounded-full text-xs font-medium border bg-muted/50 text-muted-foreground">
              Services
            </span>
            <span className="text-sm font-medium">Available Now</span>
          </div>
          
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {services.map((service) => (
              <ServiceCard key={service.title} item={service} />
            ))}
          </div>

          {/* For Drivers Section */}
          {showDriverCTA && (
            <div className="mt-10 p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-teal-500/5 border border-primary/20">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2.5 py-1 rounded-full text-xs font-medium border bg-primary/10 text-primary border-primary/20">
                  For Drivers
                </span>
                <span className="text-sm font-medium">Earn on Your Schedule</span>
              </div>

              <div className="grid md:grid-cols-2 gap-6 items-center">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Become a Driver</h3>
                      <p className="text-sm text-muted-foreground">Earn on ZIVO Driver</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm mb-4">
                    Drive for rides, deliver food, or move packages. 
                    Work when you want, earn what you deserve.
                  </p>
                  <Button
                    onClick={handleOpenZivoDriver}
                    className="rounded-xl gap-2"
                  >
                    Apply Now
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {driverBenefits.map((benefit) => (
                    <div key={benefit} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span className="text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
