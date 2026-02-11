import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Lock, 
  RefreshCw,
  Award,
  CheckCircle,
  Headphones,
  Globe,
  Car
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CarTrustIndicatorsProps {
  className?: string;
}

export default function CarTrustIndicators({ className }: CarTrustIndicatorsProps) {
  const trustItems = [
    {
      icon: Shield,
      title: "Full Insurance",
      description: "Comprehensive coverage on all vehicles",
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      icon: Award,
      title: "Best Rate Guarantee",
      description: "We match any competitor price",
      color: "text-violet-500",
      bgColor: "bg-violet-500/10",
    },
    {
      icon: RefreshCw,
      title: "Free Cancellation",
      description: "Cancel up to 24h before pickup",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      icon: Headphones,
      title: "24/7 Roadside",
      description: "Emergency assistance anytime",
      color: "text-sky-500",
      bgColor: "bg-sky-500/10",
    },
  ];

  const paymentMethods = [
    { name: "Visa", label: "V" },
    { name: "Mastercard", label: "MC" },
    { name: "Amex", label: "AX" },
    { name: "PayPal", label: "PP" },
    { name: "Apple Pay", label: "AP" },
    { name: "Google Pay", label: "GP" },
  ];

  const certifications = [
    { name: "Verified Fleet", badge: "Verified" },
    { name: "PCI Compliant", badge: "PCI" },
    { name: "Driver Protected", badge: "Protected" },
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
                  className="w-8 h-5 sm:w-10 sm:h-7 rounded bg-card border border-border/50 flex items-center justify-center text-[8px] sm:text-[10px] font-semibold text-muted-foreground"
                  title={method.name}
                >
                  {method.label}
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
            <span>5,000+ pickup locations</span>
          </div>
        </div>

        {/* Affiliate Disclosure */}
        <p className="text-center text-[10px] sm:text-xs text-muted-foreground mt-6 sm:mt-8 max-w-2xl mx-auto px-4">
          ZIVO may earn a commission when you book through our partner links at no extra cost to you.{' '}
          <a href="/affiliate-disclosure" className="text-violet-500 hover:underline">Learn more</a>
        </p>
      </div>
    </section>
  );
}
