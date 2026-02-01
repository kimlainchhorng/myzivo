import { Shield, Smartphone, Mail } from "lucide-react";

const trustPoints = [
  {
    icon: Shield,
    text: "Secure partner checkout",
  },
  {
    icon: Smartphone,
    text: "Mobile-first experience",
  },
  {
    icon: Mail,
    text: "Support: info@hizivo.com",
  },
];

export default function TrustSection() {
  return (
    <section className="py-10 sm:py-12 bg-muted/30 border-t border-border/50">
      <div className="container mx-auto px-4">
        {/* Trust Points */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">
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
      </div>
    </section>
  );
}
