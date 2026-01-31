import { Shield, CheckCircle, BadgeDollarSign, Clock, Headphones, Award, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const guarantees = [
  {
    icon: BadgeDollarSign,
    title: "Best Price Guarantee",
    description: "Find it cheaper elsewhere? We'll match it and give you 10% off",
    color: "text-green-400",
    bgColor: "bg-green-500/10",
  },
  {
    icon: Clock,
    title: "Free Cancellation",
    description: "Cancel up to 24 hours before check-in for a full refund",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: Shield,
    title: "Secure Booking",
    description: "Your payment and personal data are fully protected",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Our travel experts are here to help anytime you need",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
  },
];

const stats = [
  { value: "$2.5M+", label: "Refunded to guests" },
  { value: "99.8%", label: "Satisfaction rate" },
  { value: "15 min", label: "Avg response time" },
];

const HotelPriceGuarantee = () => {
  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-card/50 to-purple-500/10 border border-primary/20 rounded-3xl p-8 md:p-12">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-3xl rounded-full" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 blur-3xl rounded-full" />

          <div className="relative z-10">
            <div className="text-center mb-10">
              <Badge className="mb-3 bg-primary/20 text-primary border-primary/30">
                <Shield className="w-3 h-3 mr-1" /> Book with Confidence
              </Badge>
              <h2 className="text-2xl md:text-4xl font-display font-bold mb-3">
                Our Promise to You
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Every booking is backed by our comprehensive protection guarantees
              </p>
            </div>

            {/* Guarantees Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              {guarantees.map((guarantee) => (
                <div key={guarantee.title} className="p-5 bg-card/60 backdrop-blur-xl rounded-xl border border-border/30">
                  <div className={`w-12 h-12 ${guarantee.bgColor} rounded-xl flex items-center justify-center mb-4`}>
                    <guarantee.icon className={`w-6 h-6 ${guarantee.color}`} />
                  </div>
                  <h3 className="font-bold mb-2">{guarantee.title}</h3>
                  <p className="text-sm text-muted-foreground">{guarantee.description}</p>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mb-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="text-center">
              <Button size="lg" className="bg-gradient-to-r from-primary to-purple-500">
                <Award className="w-4 h-4 mr-2" />
                Learn More About Our Guarantees
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HotelPriceGuarantee;
