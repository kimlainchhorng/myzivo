import { Clock, Smartphone, Key, Zap, CheckCircle, ArrowRight, Timer, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const expressFeatures = [
  {
    icon: Smartphone,
    title: "Mobile Check-In",
    description: "Check in from your phone 24 hours before arrival",
    benefit: "Skip the front desk"
  },
  {
    icon: Key,
    title: "Digital Room Key",
    description: "Use your smartphone as your room key",
    benefit: "Contactless entry"
  },
  {
    icon: Zap,
    title: "Express Check-Out",
    description: "Leave anytime - bill sent to your email",
    benefit: "No waiting"
  },
  {
    icon: Bell,
    title: "Early/Late Requests",
    description: "Request early check-in or late check-out",
    benefit: "Subject to availability"
  },
];

const HotelCheckInOut = () => {
  return (
    <section className="py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <Badge className="mb-3 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            <Timer className="w-3 h-3 mr-1" /> Express Service
          </Badge>
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
            Seamless Check-In & Check-Out
          </h2>
          <p className="text-muted-foreground">Save time with our contactless hotel experience</p>
        </div>

        {/* Time Display */}
        <div className="flex justify-center gap-8 mb-10">
          <div className="text-center p-6 bg-card/60 backdrop-blur-xl rounded-2xl border border-border/50 hover:border-emerald-500/30 hover:shadow-md transition-all duration-200">
            <Clock className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-1">Check-In</p>
            <p className="text-2xl font-display font-bold">3:00 PM</p>
            <p className="text-xs text-muted-foreground mt-1">Early available from 12 PM (+$25)</p>
          </div>
          <div className="text-center p-6 bg-card/60 backdrop-blur-xl rounded-2xl border border-border/50 hover:border-amber-500/30 hover:shadow-md transition-all duration-200">
            <Clock className="w-8 h-8 text-amber-400 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-1">Check-Out</p>
            <p className="text-2xl font-display font-bold">11:00 AM</p>
            <p className="text-xs text-muted-foreground mt-1">Late available until 3 PM (+$35)</p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {expressFeatures.map((feature) => {
            const Icon = feature.icon;
            
            return (
              <div
                key={feature.title}
                className="flex items-start gap-4 p-5 bg-card/60 backdrop-blur-xl rounded-2xl border border-border/50 hover:border-emerald-500/30 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{feature.description}</p>
                  <div className="flex items-center gap-1 text-xs text-emerald-400">
                    <CheckCircle className="w-3 h-3" />
                    {feature.benefit}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-emerald-500/10 via-card/50 to-teal-500/10 rounded-2xl border border-emerald-500/20 p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                <Smartphone className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Download the ZIVO App</h3>
                <p className="text-sm text-muted-foreground">
                  Unlock all express features and manage your stay on the go
                </p>
              </div>
            </div>
            <Button className="bg-gradient-to-r from-emerald-500 to-teal-500">
              Get the App <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HotelCheckInOut;
