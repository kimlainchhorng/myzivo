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
    <section id="driver" className="py-12 sm:py-16 lg:py-32 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-rides/10 via-background to-eats/10" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="glass-card p-5 sm:p-8 lg:p-12 rounded-2xl sm:rounded-3xl">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-muted text-foreground text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                <Car className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rides" />
                Drive with ZIVO
              </div>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-foreground">
                Turn your car into a
                <br className="hidden sm:block" />
                <span className="text-gradient-rides"> money machine</span>
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-lg">
                Join thousands of drivers earning on their own terms. Whether you drive full-time or just a few hours a week, ZIVO puts you in control.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button variant="rides" size="lg" onClick={() => navigate("/drive")} className="w-full sm:w-auto touch-manipulation">
                  Start driving
                  <ChevronRight className="w-5 h-5" />
                </Button>
                <Button variant="outline" size="lg" className="w-full sm:w-auto touch-manipulation">
                  Deliver with ZIVO Eats
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 sm:gap-8 mt-6 sm:mt-10 pt-6 sm:pt-8 border-t border-border">
                <div className="text-center sm:text-left">
                  <p className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-rides">$28</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Avg. hourly</p>
                </div>
                <div className="text-center sm:text-left">
                  <p className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-rides">50K+</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Drivers</p>
                </div>
                <div className="text-center sm:text-left">
                  <p className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-rides">5x</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Cashouts</p>
                </div>
              </div>
            </div>

            {/* Right - Benefits */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {benefits.map((benefit, index) => (
                <div
                  key={benefit.title}
                  className="p-4 sm:p-5 rounded-xl bg-muted/50 hover:bg-muted active:scale-[0.98] transition-all animate-fade-in touch-manipulation"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg gradient-rides flex items-center justify-center mb-3 sm:mb-4">
                    <benefit.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
                  </div>
                  <h3 className="font-display text-sm sm:text-base font-semibold mb-1 text-foreground">{benefit.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
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
