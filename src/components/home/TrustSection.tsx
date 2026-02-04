import { Shield, Smartphone, Mail, Plane, Hotel, Car } from "lucide-react";

const trustPoints = [
  {
    icon: Plane,
    text: "500+ Airlines Compared",
  },
  {
    icon: Hotel,
    text: "500,000+ Hotels Worldwide",
  },
  {
    icon: Car,
    text: "Trusted Rental Partners",
  },
  {
    icon: Shield,
    text: "No Hidden Fees",
  },
];

export default function TrustSection() {
  return (
    <section className="py-10 sm:py-12 bg-muted/30 border-t border-border/50">
      <div className="container mx-auto px-4">
        {/* Trust Points */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 flex-wrap">
          {trustPoints.map((point) => (
            <div
              key={point.text}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <point.icon className="w-4 h-4 text-primary" />
              <span className="text-sm">{point.text}</span>
            </div>
          ))}
        </div>
        
        {/* Disclaimer */}
        <p className="text-center text-xs text-muted-foreground/70 mt-6">
          Prices provided by licensed travel partners.
        </p>
      </div>
    </section>
  );
}
