import { Button } from "@/components/ui/button";
import { Car, UtensilsCrossed, MapPin, ChevronRight } from "lucide-react";
import { useState } from "react";

const HeroSection = () => {
  const [activeTab, setActiveTab] = useState<'rides' | 'eats'>('rides');
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-12 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-radial from-rides/5 via-transparent to-transparent opacity-50" />
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-rides/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-eats/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div className="animate-fade-in">
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-6">
              Go anywhere.
              <br />
              <span className="text-gradient-rides">Get anything.</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-lg mb-8">
              Request a ride, order food, or become a driver. One app for everything you need.
            </p>

            {/* Booking Card */}
            <div className="glass-card p-6 max-w-md">
              {/* Tabs */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setActiveTab('rides')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
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
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
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
                  <Button variant="rides" size="lg" className="w-full">
                    See prices
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
          <div className="hidden lg:block relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
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
                    
                    {/* Route line */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <path
                        d="M30 70 Q 40 50, 50 45 T 70 30"
                        stroke="hsl(var(--rides))"
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray="5,5"
                        className="animate-pulse-glow"
                      />
                    </svg>
                    
                    {/* Pickup marker */}
                    <div className="absolute left-[28%] top-[65%] w-4 h-4 rounded-full bg-rides animate-pulse-glow" />
                    
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
                      <div className="h-full gradient-rides rounded-full w-2/3 animate-pulse-glow" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 glass-card p-3 rounded-xl glow-eats animate-float">
                <UtensilsCrossed className="w-6 h-6 text-eats" />
              </div>
              <div className="absolute -bottom-4 -left-4 glass-card p-3 rounded-xl glow-rides animate-float" style={{ animationDelay: '-2s' }}>
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
