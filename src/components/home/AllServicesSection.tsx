import { useNavigate } from "react-router-dom";
import { 
  Car, UtensilsCrossed, Plane, Hotel, CarFront, Package, 
  Train, Ticket, Shield, ArrowRight, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const services = [
  { id: "rides", icon: Car, title: "Rides", desc: "Get there fast", href: "/ride", color: "gradient-rides", shadowColor: "shadow-primary/30" },
  { id: "eats", icon: UtensilsCrossed, title: "Eats", desc: "Food delivered", href: "/food", color: "gradient-eats", shadowColor: "shadow-eats/30" },
  { id: "flights", icon: Plane, title: "Flights", desc: "500+ destinations", href: "/book-flight", color: "bg-gradient-to-br from-sky-500 to-sky-600", shadowColor: "shadow-sky-500/30" },
  { id: "hotels", icon: Hotel, title: "Hotels", desc: "Best rates", href: "/book-hotel", color: "bg-gradient-to-br from-amber-500 to-amber-600", shadowColor: "shadow-amber-500/30" },
  { id: "cars", icon: CarFront, title: "Car Rental", desc: "Drive anywhere", href: "/rent-car", color: "bg-gradient-to-br from-violet-500 to-violet-600", shadowColor: "shadow-violet-500/30" },
  { id: "package", icon: Package, title: "Package", desc: "Same-day delivery", href: "/package-delivery", color: "bg-gradient-to-br from-emerald-500 to-emerald-600", shadowColor: "shadow-emerald-500/30", isNew: true },
  { id: "train", icon: Train, title: "Bus & Train", desc: "Intercity travel", href: "/ground-transport", color: "bg-gradient-to-br from-rose-500 to-rose-600", shadowColor: "shadow-rose-500/30", isNew: true },
  { id: "events", icon: Ticket, title: "Events", desc: "Concerts & sports", href: "/events", color: "bg-gradient-to-br from-pink-500 to-pink-600", shadowColor: "shadow-pink-500/30", isNew: true },
  { id: "insurance", icon: Shield, title: "Insurance", desc: "Travel protection", href: "/travel-insurance", color: "bg-gradient-to-br from-cyan-500 to-cyan-600", shadowColor: "shadow-cyan-500/30", isNew: true },
];

const AllServicesSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 lg:py-32 relative overflow-hidden">
      {/* Enhanced background */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-eats/8 opacity-50" />
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-gradient-to-br from-violet-500/15 to-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-eats/15 to-orange-500/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary/8 to-transparent rounded-full blur-3xl" />
      <div className="absolute top-1/3 right-1/3 w-[300px] h-[300px] bg-gradient-radial from-sky-500/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 left-1/3 w-[250px] h-[250px] bg-gradient-radial from-amber-500/10 to-transparent rounded-full blur-3xl" />
      
      {/* Floating emojis - CSS animated */}
      <div className="absolute top-32 left-[8%] text-5xl hidden lg:block opacity-40 animate-bounce" style={{ animationDuration: '5s' }}>
        🚀
      </div>
      <div className="absolute bottom-40 right-[10%] text-4xl hidden lg:block opacity-35 animate-bounce" style={{ animationDuration: '6s', animationDelay: '1s' }}>
        ✨
      </div>
      <div className="absolute top-1/2 left-[5%] text-4xl hidden lg:block opacity-25 animate-pulse">
        🌍
      </div>
      <div className="absolute top-40 right-[15%] text-3xl hidden lg:block opacity-30 animate-bounce" style={{ animationDuration: '5.5s', animationDelay: '0.5s' }}>
        🎯
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 sm:mb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-primary/15 to-eats/15 border border-primary/25 text-sm font-bold mb-6 shadow-lg shadow-primary/10">
            <Sparkles className="w-4 h-4 text-primary animate-spin" style={{ animationDuration: '4s' }} />
            <span className="text-muted-foreground">All-in-One Platform</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6">
            Everything you need,{" "}
            <span className="bg-gradient-to-r from-primary via-teal-400 to-eats bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent">
              one app
            </span>
          </h2>
          <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            From daily commutes to <span className="text-foreground font-medium">dream vacations</span>, ZIVO has you covered
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
          {services.map((service, index) => (
            <button
              key={service.id}
              onClick={() => navigate(service.href)}
              className="relative p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-card/95 to-card border border-border/50 shadow-xl hover:shadow-2xl transition-all duration-300 group text-left overflow-hidden animate-in fade-in slide-in-from-bottom-4 hover:-translate-y-2 hover:scale-[1.02] active:scale-[0.98]"
              style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'both' }}
            >
              {/* Gradient hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Corner glow */}
              <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 ${service.color}`} />
              
              {service.isNew && (
                <span className="absolute top-3 right-3 px-2.5 py-1 text-[10px] font-black bg-gradient-to-r from-eats to-orange-500 text-white rounded-full shadow-lg animate-in zoom-in duration-300" style={{ animationDelay: `${300 + index * 50}ms` }}>
                  New
                </span>
              )}
              <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${service.color} flex items-center justify-center mb-4 shadow-xl ${service.shadowColor} relative overflow-hidden transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3`}>
                <service.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white relative z-10" />
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="font-bold text-lg sm:text-xl text-foreground group-hover:text-primary transition-colors relative">
                {service.title}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 relative">{service.desc}</p>
              
              {/* Arrow indicator on hover */}
              <div className="absolute bottom-5 right-5 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
                <ArrowRight className="w-4 h-4 text-primary" />
              </div>
            </button>
          ))}
        </div>

        <div className="text-center mt-16 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '300ms' }}>
          <Button 
            size="lg" 
            className="h-14 sm:h-16 px-10 sm:px-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-primary to-teal-400 text-white shadow-2xl shadow-primary/40 gap-3 transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98]" 
            onClick={() => navigate("/install")}
          >
            <Sparkles className="w-5 h-5" />
            Download the ZIVO app
            <ArrowRight className="w-5 h-5" />
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Available on iOS & Android • Free to download
          </p>
        </div>
      </div>
    </section>
  );
};

export default AllServicesSection;
