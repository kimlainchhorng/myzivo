import { Button } from "@/components/ui/button";
import { Car, UtensilsCrossed, MapPin, ChevronRight, Sparkles, Plane, Hotel, CarFront, MoreHorizontal, Star, Clock, ArrowRight } from "lucide-react";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const heroStats = [
  { value: "5 min", label: "Avg. pickup" },
  { value: "4.9★", label: "App rating" },
  { value: "24/7", label: "Support" },
];

const quickServices = [
  { id: 'rides', label: 'Rides', icon: Car, href: '/ride', color: 'text-rides', bgColor: 'bg-rides/10 hover:bg-rides/20', glowColor: 'hover:shadow-[0_0_20px_-5px_hsl(var(--rides))]' },
  { id: 'eats', label: 'Eats', icon: UtensilsCrossed, href: '/food', color: 'text-eats', bgColor: 'bg-eats/10 hover:bg-eats/20', glowColor: 'hover:shadow-[0_0_20px_-5px_hsl(var(--eats))]' },
  { id: 'flights', label: 'Flights', icon: Plane, href: '/flights', color: 'text-sky-400', bgColor: 'bg-sky-500/10 hover:bg-sky-500/20', glowColor: 'hover:shadow-[0_0_20px_-5px_rgb(56,189,248)]' },
  { id: 'hotels', label: 'Hotels', icon: Hotel, href: '/hotels', color: 'text-amber-400', bgColor: 'bg-amber-500/10 hover:bg-amber-500/20', glowColor: 'hover:shadow-[0_0_20px_-5px_rgb(251,191,36)]' },
  { id: 'cars', label: 'Cars', icon: CarFront, href: '/car-rental', color: 'text-primary', bgColor: 'bg-primary/10 hover:bg-primary/20', glowColor: 'hover:shadow-[0_0_20px_-5px_hsl(var(--primary))]' },
  { id: 'more', label: 'More', icon: MoreHorizontal, href: '/ground-transport', color: 'text-muted-foreground', bgColor: 'bg-muted hover:bg-muted/80', glowColor: '' },
];

const featuredRestaurants = [
  { id: 1, name: "Burger Joint", cuisine: "American", rating: 4.8, time: "15-25", image: "🍔", promo: "Free Delivery" },
  { id: 2, name: "Sakura Sushi", cuisine: "Japanese", rating: 4.9, time: "25-35", image: "🍣", promo: null },
  { id: 3, name: "Pizza Palace", cuisine: "Italian", rating: 4.7, time: "20-30", image: "🍕", promo: "20% Off" },
  { id: 4, name: "Taco Fiesta", cuisine: "Mexican", rating: 4.6, time: "15-20", image: "🌮", promo: null },
  { id: 5, name: "Thai Spice", cuisine: "Thai", rating: 4.8, time: "25-35", image: "🍜", promo: "Free Delivery" },
  { id: 6, name: "Coffee Hub", cuisine: "Cafe", rating: 4.5, time: "10-15", image: "☕", promo: null },
];

const HeroSection = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'rides' | 'eats'>('rides');
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const restaurantScrollRef = useRef<HTMLDivElement>(null);

  return (
    <section className="relative min-h-screen flex items-center pt-16 sm:pt-20 pb-8 sm:pb-12 overflow-hidden">
      {/* Enhanced Background Elements - Static for performance */}
      <div className="absolute inset-0 bg-gradient-radial from-rides/10 via-transparent to-transparent opacity-60" />
      <div className="absolute top-1/4 right-0 w-64 sm:w-[500px] h-64 sm:h-[500px] bg-gradient-to-bl from-rides/15 to-teal-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-0 w-56 sm:w-[450px] h-56 sm:h-[450px] bg-gradient-to-tr from-eats/15 to-orange-500/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[1200px] h-[600px] sm:h-[1200px] bg-gradient-conic from-rides/8 via-transparent to-eats/8 rounded-full blur-3xl opacity-40" />
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-gradient-radial from-violet-500/10 to-transparent rounded-full blur-3xl" />
      
      {/* Static decorative icons */}
      <div className="absolute top-40 left-[5%] hidden lg:block opacity-40">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/15 to-teal-400/15 flex items-center justify-center backdrop-blur-sm">
          <Car className="w-6 h-6 text-primary/50" />
        </div>
      </div>
      <div className="absolute bottom-32 right-[6%] hidden lg:block opacity-30">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-eats/15 to-orange-400/15 flex items-center justify-center backdrop-blur-sm">
          <UtensilsCrossed className="w-5 h-5 text-eats/50" />
        </div>
      </div>
      <div className="absolute top-60 right-[12%] hidden lg:block opacity-25">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400/15 to-yellow-400/15 flex items-center justify-center backdrop-blur-sm">
          <Sparkles className="w-5 h-5 text-amber-400/50" />
        </div>
      </div>
      
      {/* Animated grid lines - hidden on mobile for performance */}
      <div className="hidden sm:block absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
        backgroundSize: '100px 100px'
      }} />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Quick Services Bar - Enhanced with Better Flow */}
        <div className="mb-8 sm:mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-3 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-center lg:justify-start">
            {quickServices.map((service, index) => (
              <button
                key={service.id}
                onClick={() => navigate(service.href)}
                className={cn(
                  "flex items-center gap-2.5 px-5 py-3 rounded-2xl border border-white/10 backdrop-blur-sm transition-all duration-200 touch-manipulation shrink-0 group",
                  "hover:scale-110 hover:-translate-y-0.5 active:scale-95",
                  service.bgColor,
                  service.glowColor
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <service.icon className={cn("w-5 h-5 transition-transform duration-200 group-hover:scale-110", service.color)} />
                <span className="text-sm sm:text-base font-semibold text-foreground whitespace-nowrap">{service.label}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all duration-200 -ml-1 group-hover:ml-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Featured Restaurants/Stores - Enhanced with Better Flow */}
        <div className="mb-10 sm:mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5 hover:translate-x-0.5 transition-transform duration-200">
              <div className="p-2 rounded-xl bg-eats/10 backdrop-blur-sm">
                <UtensilsCrossed className="w-4 h-4 text-eats" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-foreground">Popular Near You</h3>
            </div>
            <button 
              onClick={() => navigate('/food')}
              className="text-sm text-eats hover:text-eats/80 font-semibold flex items-center gap-1.5 touch-manipulation group transition-all duration-200 hover:translate-x-0.5 active:scale-95"
            >
              See all
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>
          
          <div 
            ref={restaurantScrollRef}
            className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth"
          >
            {featuredRestaurants.map((restaurant, index) => (
              <button
                key={restaurant.id}
                onClick={() => navigate('/food')}
                className="flex-shrink-0 w-36 sm:w-44 glass-card p-3.5 rounded-2xl border border-white/10 hover:border-eats/40 transition-all duration-200 touch-manipulation text-left group hover:shadow-[0_10px_40px_-15px_hsl(var(--eats)/0.3)] hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98] animate-in fade-in slide-in-from-right-4"
                style={{ animationDelay: `${200 + index * 50}ms` }}
              >
                <div className="relative mb-3">
                  <div className="w-full aspect-square bg-gradient-to-br from-muted to-muted/50 rounded-xl flex items-center justify-center text-4xl sm:text-5xl overflow-hidden group-hover:scale-110 transition-transform duration-200">
                    <span className="group-hover:scale-110 transition-transform duration-200">{restaurant.image}</span>
                  </div>
                  {restaurant.promo && (
                    <span className="absolute -top-2 -right-2 px-2 py-1 text-[10px] font-bold bg-gradient-to-r from-eats to-orange-500 text-white rounded-lg shadow-lg">
                      {restaurant.promo}
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-sm text-foreground truncate mb-0.5">{restaurant.name}</h4>
                <p className="text-xs text-muted-foreground truncate mb-2">{restaurant.cuisine}</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-eats/10 px-2 py-0.5 rounded-full">
                    <Star className="w-3 h-3 fill-eats text-eats" />
                    <span className="text-xs font-bold text-foreground">{restaurant.rating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs font-medium">{restaurant.time}</span>
                  </div>
                </div>
              </button>
            ))}
            
            {/* See More Card */}
            <button
              onClick={() => navigate('/food')}
              className="flex-shrink-0 w-36 sm:w-44 glass-card p-3.5 rounded-2xl border border-dashed border-eats/30 hover:border-eats/60 transition-all duration-200 touch-manipulation flex flex-col items-center justify-center min-h-[180px] group hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98] animate-in fade-in slide-in-from-right-4"
              style={{ animationDelay: '500ms' }}
            >
              <div className="w-14 h-14 rounded-2xl bg-eats/10 flex items-center justify-center mb-3 group-hover:bg-eats/20 transition-colors duration-200">
                <ArrowRight className="w-6 h-6 text-eats group-hover:translate-x-1 transition-transform duration-200" />
              </div>
              <span className="text-sm font-bold text-eats">View All</span>
              <span className="text-xs text-muted-foreground mt-0.5">100+ restaurants</span>
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-20 items-center">
          {/* Left Content */}
          <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-left-4 duration-500 delay-200">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-rides/15 to-teal-400/15 border border-rides/25 text-xs sm:text-sm font-bold shadow-lg shadow-rides/10">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-rides animate-spin" style={{ animationDuration: '3s' }} />
              <span className="text-muted-foreground">The #1 mobility app</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
              Go anywhere.
              <br />
              <span className="bg-gradient-to-r from-rides via-teal-400 to-rides bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent">Get anything.</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed">
              Request a ride, order food, book flights, or rent a car. <span className="text-foreground font-medium">One super app</span> for all your needs.
            </p>

            {/* Quick Stats */}
            <div className="flex gap-4 sm:gap-6 py-3 sm:py-5">
              {heroStats.map((stat, index) => (
                <div 
                  key={stat.label}
                  className="text-center animate-in fade-in slide-in-from-bottom-2 duration-300"
                  style={{ animationDelay: `${300 + index * 100}ms` }}
                >
                  <p className="font-display text-xl sm:text-2xl font-bold text-rides">{stat.value}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Booking Card */}
            <div className="glass-card p-4 sm:p-6 max-w-md">
              {/* Tabs */}
              <div className="flex gap-2 mb-4 sm:mb-6">
                <button
                  onClick={() => setActiveTab('rides')}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-all ${
                    activeTab === 'rides'
                      ? 'gradient-rides text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Car className="w-4 h-4" />
                  Rides
                </button>
                <button
                  onClick={() => setActiveTab('eats')}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-all ${
                    activeTab === 'eats'
                      ? 'gradient-eats text-secondary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <UtensilsCrossed className="w-4 h-4" />
                  Eats
                </button>
              </div>

              {/* Rides Form */}
              {activeTab === 'rides' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-rides" />
                    <input
                      type="text"
                      placeholder="Enter pickup location"
                      value={pickup}
                      onChange={(e) => setPickup(e.target.value)}
                      className="w-full bg-input border border-border rounded-lg py-3 pl-11 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rides/50"
                    />
                  </div>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-sm bg-foreground" />
                    <input
                      type="text"
                      placeholder="Enter destination"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full bg-input border border-border rounded-lg py-3 pl-11 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rides/50"
                    />
                  </div>
                  <Button variant="rides" size="lg" className="w-full" onClick={() => navigate("/ride")}>
                    Book a ride
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              )}

              {/* Eats Form */}
              {activeTab === 'eats' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-eats" />
                    <input
                      type="text"
                      placeholder="Enter delivery address"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full bg-input border border-border rounded-lg py-3 pl-11 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-eats/50"
                    />
                  </div>
                  <Button variant="eats" size="lg" className="w-full">
                    Find food
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Right Visual */}
          <div className="hidden lg:block relative animate-in fade-in zoom-in-95 duration-500 delay-300">
            <div className="relative aspect-square max-w-lg mx-auto">
              {/* Phone Mockup */}
              <div className="absolute inset-8 glass-card rounded-[3rem] p-4 glow-rides">
                <div className="w-full h-full bg-muted rounded-[2.5rem] overflow-hidden relative">
                  {/* Map Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-muted via-background to-muted">
                    {/* Grid pattern */}
                    <div className="absolute inset-0 opacity-20" style={{
                      backgroundImage: 'linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)',
                      backgroundSize: '40px 40px'
                    }} />
                    
                    {/* Route line - static SVG */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <path
                        d="M30 70 Q 40 50, 50 45 T 70 30"
                        stroke="hsl(var(--rides))"
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray="5,5"
                      />
                    </svg>
                    
                    {/* Pickup marker */}
                    <div className="absolute left-[28%] top-[65%] w-4 h-4 rounded-full bg-rides animate-pulse" />
                    
                    {/* Destination marker */}
                    <div className="absolute left-[68%] top-[28%] w-4 h-4 bg-foreground rounded-sm" />
                    
                    {/* Car icon */}
                    <div className="absolute left-[45%] top-[48%] w-8 h-8 gradient-rides rounded-lg flex items-center justify-center shadow-lg">
                      <Car className="w-4 h-4 text-primary-foreground" />
                    </div>
                  </div>
                  
                  {/* Bottom card */}
                  <div className="absolute bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm p-4 rounded-t-2xl border-t border-white/10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 gradient-rides rounded-lg flex items-center justify-center">
                        <Car className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">ZIVO X</p>
                        <p className="text-sm text-muted-foreground">3 min away</p>
                      </div>
                      <div className="ml-auto text-right">
                        <p className="font-bold text-foreground">$12.50</p>
                        <p className="text-xs text-muted-foreground">Est. fare</p>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full gradient-rides rounded-full w-2/3" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 glass-card p-3 rounded-xl glow-eats animate-in fade-in slide-in-from-right-4 duration-500 delay-500">
                <UtensilsCrossed className="w-6 h-6 text-eats" />
              </div>
              <div className="absolute -bottom-4 -left-4 glass-card p-3 rounded-xl glow-rides animate-in fade-in slide-in-from-left-4 duration-500 delay-700">
                <Car className="w-6 h-6 text-rides" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
