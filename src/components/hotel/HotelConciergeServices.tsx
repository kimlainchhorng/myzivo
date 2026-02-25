import { Phone, MessageCircle, Clock, Globe, Star, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const services = [
  {
    icon: MessageCircle,
    title: "24/7 Chat Support",
    description: "Instant assistance via in-app chat",
    available: "Always Available",
    color: "text-sky-400",
    bgColor: "bg-sky-500/10",
  },
  {
    icon: Phone,
    title: "Priority Phone Line",
    description: "Direct line for urgent requests",
    available: "Premium Guests",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
  },
  {
    icon: Sparkles,
    title: "Personal Concierge",
    description: "Dedicated travel assistant",
    available: "VIP Members",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
  },
];

const conciergeServices = [
  "Restaurant Reservations",
  "Spa & Wellness Bookings",
  "Airport Transfers",
  "Private Tours",
  "Event Tickets",
  "Special Occasions",
  "Room Upgrades",
  "Late Check-out",
];

const HotelConciergeServices = () => {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Left Content */}
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-400 text-sm font-medium mb-4">
                <Star className="w-4 h-4" />
                Premium Service
              </span>
              
              <h2 className="text-2xl md:text-4xl font-display font-bold mb-4">
                Personal <span className="text-primary">Concierge</span>
              </h2>
              
              <p className="text-muted-foreground text-lg mb-8">
                Experience white-glove service with our dedicated travel specialists ready 
                to handle every detail of your stay.
              </p>

              {/* Service Cards */}
              <div className="space-y-4 mb-8">
                {services.map((service, index) => {
                  const Icon = service.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <div className={`w-12 h-12 rounded-xl ${service.bgColor} flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${service.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{service.title}</h3>
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-muted text-xs font-medium">
                        {service.available}
                      </span>
                    </div>
                  );
                })}
              </div>

              <Button className="bg-primary hover:bg-primary/90">
                <MessageCircle className="w-5 h-5 mr-2" />
                Chat with Concierge
              </Button>
            </div>

            {/* Right - Service Grid */}
            <div className="relative">
              {/* Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-amber-500/20 rounded-3xl blur-[60px] opacity-50" />
              
              <div className="relative p-8 rounded-3xl bg-card/50 backdrop-blur-xl border border-border/50">
                <div className="flex items-center gap-3 mb-6">
                  <Globe className="w-6 h-6 text-primary" />
                  <h3 className="text-lg font-semibold">What We Can Help With</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {conciergeServices.map((service, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-3 rounded-xl bg-background/50 border border-border/30 hover:border-primary/20 hover:shadow-sm transition-all duration-200"
                    >
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-sm">{service}</span>
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-border/50">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">24/7</div>
                    <div className="text-xs text-muted-foreground">Available</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">&lt;5min</div>
                    <div className="text-xs text-muted-foreground">Response</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">98%</div>
                    <div className="text-xs text-muted-foreground">Satisfaction</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HotelConciergeServices;
