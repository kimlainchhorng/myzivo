import { Button } from "@/components/ui/button";
import { Car, UtensilsCrossed, MapPin, ChevronRight, Sparkles, Shield, Clock } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const heroStats = [
  { value: "5 min", label: "Avg. pickup" },
  { value: "4.9★", label: "App rating" },
  { value: "24/7", label: "Support" },
];

const HeroSection = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'rides' | 'eats'>('rides');
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  return (
    <section className="relative min-h-screen flex items-center pt-16 sm:pt-20 pb-8 sm:pb-12 overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 bg-gradient-radial from-rides/5 via-transparent to-transparent opacity-50" />
      <div className="absolute top-1/4 right-0 w-48 sm:w-96 h-48 sm:h-96 bg-rides/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 left-0 w-40 sm:w-80 h-40 sm:h-80 bg-eats/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[1000px] h-[500px] sm:h-[1000px] bg-gradient-conic from-rides/5 via-transparent to-eats/5 rounded-full blur-3xl opacity-30" />
      
      {/* Animated grid lines - hidden on mobile for performance */}
      <div className="hidden sm:block absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
        backgroundSize: '100px 100px'
      }} />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-20 items-center">
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 sm:space-y-8"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full glass-card text-xs sm:text-sm font-medium">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-rides" />
              <span className="text-muted-foreground">The #1 mobility app</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
              Go anywhere.
              <br />
              <span className="text-gradient-rides">Get anything.</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-lg">
              Request a ride, order food, book flights, or rent a car. One super app for all your needs.
            </p>

            {/* Quick Stats */}
            <div className="flex gap-4 sm:gap-6 py-2 sm:py-4">
              {heroStats.map((stat, index) => (
                <motion.div 
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="text-center"
                >
                  <p className="font-display text-xl sm:text-2xl font-bold text-rides">{stat.value}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{stat.label}</p>
                </motion.div>
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
          </motion.div>

          {/* Right Visual */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden lg:block relative"
          >
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
                      <motion.path
                        d="M30 70 Q 40 50, 50 45 T 70 30"
                        stroke="hsl(var(--rides))"
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray="5,5"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, delay: 0.5 }}
                      />
                    </svg>
                    
                    {/* Pickup marker */}
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.8, type: "spring" }}
                      className="absolute left-[28%] top-[65%] w-4 h-4 rounded-full bg-rides animate-pulse-glow" 
                    />
                    
                    {/* Destination marker */}
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1, type: "spring" }}
                      className="absolute left-[68%] top-[28%] w-4 h-4 bg-foreground rounded-sm" 
                    />
                    
                    {/* Car icon */}
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.2, type: "spring" }}
                      className="absolute left-[45%] top-[48%] w-8 h-8 gradient-rides rounded-lg flex items-center justify-center shadow-lg"
                    >
                      <Car className="w-4 h-4 text-primary-foreground" />
                    </motion.div>
                  </div>
                  
                  {/* Bottom card */}
                  <motion.div 
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    transition={{ delay: 1.4, type: "spring", stiffness: 100 }}
                    className="absolute bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm p-4 rounded-t-2xl border-t border-white/10"
                  >
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
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "66%" }}
                        transition={{ delay: 1.6, duration: 1 }}
                        className="h-full gradient-rides rounded-full"
                      />
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Floating elements */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.8 }}
                className="absolute -top-4 -right-4 glass-card p-3 rounded-xl glow-eats animate-float"
              >
                <UtensilsCrossed className="w-6 h-6 text-eats" />
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 2 }}
                className="absolute -bottom-4 -left-4 glass-card p-3 rounded-xl glow-rides animate-float" 
                style={{ animationDelay: '-2s' }}
              >
                <Car className="w-6 h-6 text-rides" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
