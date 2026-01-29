import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plane, Hotel, Car, ChevronRight, Star, Shield, 
  Wifi, Globe, Clock, Sparkles, ArrowRight 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import flightHeroImage from "@/assets/flight-hero.jpg";
import airplaneCloudsImage from "@/assets/airplane-clouds.jpg";
import businessClassImage from "@/assets/flight-business-class.jpg";

const services = [
  {
    id: "flights",
    icon: Plane,
    title: "ZIVO Flights",
    subtitle: "Premium Air Travel",
    description: "Compare prices from 500+ airlines. Book premium flights at the best prices with exclusive deals worldwide.",
    features: ["500+ Airlines", "Best Price Guarantee", "24/7 Support", "Free Cancellation"],
    color: "sky",
    gradient: "from-sky-500 to-blue-600",
    route: "/flights",
    stats: { value: "1000+", label: "Routes" },
    image: airplaneCloudsImage,
    isMain: true,
  },
  {
    id: "hotels",
    icon: Hotel,
    title: "ZIVO Hotels",
    subtitle: "Premium Stays",
    description: "From luxury resorts to cozy apartments. Book verified accommodations with best price guarantee.",
    features: ["Best Price Guarantee", "Free Cancellation", "Verified Reviews"],
    color: "amber",
    gradient: "from-amber-500 to-orange-600",
    route: "/hotels",
    stats: { value: "25K+", label: "Properties" },
    image: businessClassImage,
  },
  {
    id: "car-rental",
    icon: Car,
    title: "ZIVO Car Rental",
    subtitle: "Drive Anywhere",
    description: "Rent premium vehicles from trusted partners. Economy to luxury, we have the perfect ride.",
    features: ["No Hidden Fees", "Free Modifications", "Roadside Assistance"],
    color: "emerald",
    gradient: "from-emerald-500 to-green-600",
    route: "/car-rental",
    stats: { value: "500+", label: "Locations" },
    image: flightHeroImage,
  },
];

const airlines = [
  { name: "Emirates", flag: "🇦🇪", rating: 4.9 },
  { name: "Singapore Airlines", flag: "🇸🇬", rating: 4.9 },
  { name: "Qatar Airways", flag: "🇶🇦", rating: 4.8 },
  { name: "Lufthansa", flag: "🇩🇪", rating: 4.7 },
];

const TravelServicesSection = () => {
  const navigate = useNavigate();

  return (
    <section id="travel" className="py-20 lg:py-32 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/20 to-background" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[100px]" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <Badge className="mb-6 px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white border-0 shadow-lg shadow-sky-500/30">
            <Globe className="w-4 h-4 mr-2" />
            ZIVO Travel
          </Badge>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6">
            Your complete
            <br />
            <span className="bg-gradient-to-r from-sky-400 via-amber-500 to-emerald-500 bg-clip-text text-transparent">
              travel companion
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Flights, hotels, and car rentals — all in one place. Plan your perfect trip with ZIVO.
          </p>
        </div>

        {/* Featured Flight Card */}
        <div className="mb-12 animate-fade-in">
          <div className="relative rounded-3xl overflow-hidden group">
            <img 
              src={airplaneCloudsImage} 
              alt="Premium flight experience" 
              className="w-full h-[400px] lg:h-[500px] object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
            
            <div className="absolute inset-0 p-8 lg:p-12 flex flex-col justify-between">
              <div>
                <Badge className="bg-sky-500/20 text-sky-400 border-sky-500/30 mb-4">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
                <h3 className="font-display text-3xl lg:text-5xl font-bold mb-4 max-w-lg">
                  Book Premium Flights at the
                  <span className="text-sky-400"> Best Prices</span>
                </h3>
                <p className="text-muted-foreground max-w-md text-lg mb-6">
                  Compare 500+ airlines, find exclusive deals, and fly anywhere in the world with confidence.
                </p>
                
                <div className="flex flex-wrap gap-4 mb-8">
                  {[
                    { icon: Shield, text: "Free Cancellation" },
                    { icon: Clock, text: "24/7 Support" },
                    { icon: Star, text: "Best Price Guarantee" },
                  ].map((item) => (
                    <div key={item.text} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/50 backdrop-blur-xl border border-border/50">
                      <item.icon className="w-4 h-4 text-sky-500" />
                      <span className="text-sm font-medium">{item.text}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  size="lg"
                  onClick={() => navigate("/flights")}
                  className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold shadow-lg shadow-sky-500/30 hover:shadow-xl hover:shadow-sky-500/40 transition-all duration-300"
                >
                  Search Flights
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>

              {/* Airline Partners */}
              <div className="mt-auto">
                <p className="text-xs text-muted-foreground mb-3">Trusted airline partners</p>
                <div className="flex flex-wrap gap-3">
                  {airlines.map((airline) => (
                    <div key={airline.name} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card/30 backdrop-blur-xl border border-border/30">
                      <span>{airline.flag}</span>
                      <span className="text-sm font-medium hidden sm:inline">{airline.name}</span>
                      <div className="flex items-center gap-0.5 text-amber-400">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="text-xs">{airline.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service, index) => (
            <div
              key={service.id}
              className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl hover:border-white/20 transition-all duration-500 animate-fade-in"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Header with Image */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={service.image} 
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className={`absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent`} />
                {/* Stats badge */}
                <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-card/80 backdrop-blur-xl border border-border/50">
                  <span className="font-bold text-foreground">{service.stats.value}</span>
                  <span className="text-muted-foreground text-sm ml-1">{service.stats.label}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${service.gradient} flex items-center justify-center shadow-lg`}>
                    <service.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-lg text-foreground">{service.title}</h3>
                    <p className="text-sm text-muted-foreground">{service.subtitle}</p>
                  </div>
                </div>

                <p className="text-muted-foreground mb-4 text-sm">{service.description}</p>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {service.features.slice(0, 3).map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${service.gradient}`} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button 
                  variant="outline" 
                  className="w-full group-hover:bg-muted transition-colors"
                  onClick={() => navigate(service.route)}
                >
                  Explore {service.title.split(" ")[1]}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 px-6 py-4 rounded-2xl bg-card/50 backdrop-blur-xl border border-border/50">
            <div className="flex -space-x-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center ring-2 ring-background">
                <Plane className="w-5 h-5 text-white" />
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center ring-2 ring-background">
                <Hotel className="w-5 h-5 text-white" />
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center ring-2 ring-background">
                <Car className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-center sm:text-left">
              <p className="font-semibold text-foreground">Bundle & Save</p>
              <p className="text-sm text-muted-foreground">Book flight + hotel together and save up to 30%</p>
            </div>
            <Button className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-lg shadow-sky-500/20">
              Learn more
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TravelServicesSection;
