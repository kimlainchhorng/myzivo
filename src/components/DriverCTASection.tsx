import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Car, DollarSign, Clock, Shield, ChevronRight, Calendar } from "lucide-react";

const benefits = [
  {
    icon: DollarSign,
    title: "Earn on your schedule",
    description: "Make money when you want. No minimums, no commitments.",
  },
  {
    icon: Clock,
    title: "Instant payouts",
    description: "Cash out your earnings anytime, up to 5x per day.",
  },
  {
    icon: Shield,
    title: "Insurance included",
    description: "Covered from pickup to dropoff with every trip.",
  },
  {
    icon: Calendar,
    title: "Flexible hours",
    description: "Drive or deliver whenever it works for you.",
  },
];

const DriverCTASection = () => {
  const navigate = useNavigate();

  return (
    <section id="driver" className="py-20 lg:py-32 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-rides/10 via-background to-eats/10" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="glass-card p-8 lg:p-12 rounded-3xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted text-foreground text-sm font-medium mb-6">
                <Car className="w-4 h-4 text-rides" />
                Drive with ZIVO
              </div>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-foreground">
                Turn your car into a
                <br />
                <span className="text-gradient-rides">money machine</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                Join thousands of drivers earning on their own terms. Whether you drive full-time or just a few hours a week, ZIVO puts you in control.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Button variant="rides" size="lg" onClick={() => navigate("/drive")}>
                  Start driving
                  <ChevronRight className="w-5 h-5" />
                </Button>
                <Button variant="outline" size="lg">
                  Deliver with ZIVO Eats
                </Button>
              </div>

              {/* Stats */}
              <div className="flex gap-8 mt-10 pt-8 border-t border-border">
                <div>
                  <p className="font-display text-3xl font-bold text-rides">$28</p>
                  <p className="text-sm text-muted-foreground">Avg. hourly earnings</p>
                </div>
                <div>
                  <p className="font-display text-3xl font-bold text-rides">50K+</p>
                  <p className="text-sm text-muted-foreground">Active drivers</p>
                </div>
                <div>
                  <p className="font-display text-3xl font-bold text-rides">5x</p>
                  <p className="text-sm text-muted-foreground">Daily cashouts</p>
                </div>
              </div>
            </div>

            {/* Right - Benefits */}
            <div className="grid sm:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div
                  key={benefit.title}
                  className="p-5 rounded-xl bg-muted/50 hover:bg-muted transition-colors animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-10 h-10 rounded-lg gradient-rides flex items-center justify-center mb-4">
                    <benefit.icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <h3 className="font-display font-semibold mb-1 text-foreground">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DriverCTASection;
