import { Shield, Globe, Clock, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Shield,
    title: "Secure & Trusted",
    description: "Compare prices from verified travel partners only",
  },
  {
    icon: Globe,
    title: "Worldwide Coverage",
    description: "Search across 500+ airlines and thousands of hotels",
  },
  {
    icon: Clock,
    title: "Real-Time Prices",
    description: "See live availability and current deals",
  },
  {
    icon: CreditCard,
    title: "No Booking Fees",
    description: "We don't charge fees - book directly with partners",
  },
];

export default function TrustSection() {
  return (
    <section className="py-16 sm:py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-heading-lg mb-3">
            Why Choose ZIVO
          </h2>
          <p className="text-muted-foreground text-body max-w-xl mx-auto">
            We make travel booking simple, transparent, and trustworthy
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              
              <h3 className="font-semibold text-base mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Disclosure */}
        <div className="mt-16 max-w-3xl mx-auto">
          <div className="p-6 rounded-2xl bg-muted/50 border border-border/50">
            <h4 className="font-semibold text-sm mb-2">How ZIVO Works</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              ZIVO is a travel search engine that helps you compare prices from multiple travel providers. 
              When you click on a deal, you'll be redirected to the partner's website to complete your booking. 
              We may earn a commission from our partners, but this doesn't affect the prices you see. 
              Your booking is made directly with the travel provider, not with ZIVO.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
