/**
 * AI Trip Planner - Full AI-powered trip planning wizard
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Sparkles,
  MapPin,
  Calendar as CalendarIcon,
  Users,
  DollarSign,
  Plane,
  Building2,
  Compass,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Share2,
  Bookmark,
  Check,
  Sun,
  Cloud,
  Umbrella,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import NavBar from "@/components/home/NavBar";
import Footer from "@/components/Footer";

const interestOptions = [
  { id: "beach", label: "Beach & Relaxation", emoji: "🏖️" },
  { id: "culture", label: "Culture & History", emoji: "🏛️" },
  { id: "adventure", label: "Adventure", emoji: "🏔️" },
  { id: "food", label: "Food & Dining", emoji: "🍽️" },
  { id: "nightlife", label: "Nightlife", emoji: "🎉" },
  { id: "nature", label: "Nature & Wildlife", emoji: "🦁" },
  { id: "shopping", label: "Shopping", emoji: "🛍️" },
  { id: "romantic", label: "Romantic", emoji: "❤️" },
];

const budgetLevels = [
  { value: "budget", label: "Budget", description: "Under $100/day" },
  { value: "mid", label: "Mid-Range", description: "$100-250/day" },
  { value: "luxury", label: "Luxury", description: "$250+/day" },
];

interface TripSuggestion {
  id: string;
  city: string;
  country: string;
  airportCode: string;
  price: number;
  rating: number;
  matchScore: number;
  tags: string[];
  weather: string;
  flightTime: string;
  description: string;
  hotelArea: string;
  estimatedTotal: number;
  tips: string[];
}

const AITripPlanner = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<TripSuggestion[]>([]);
  
  // Form state
  const [destination, setDestination] = useState("");
  const [departDate, setDepartDate] = useState<Date>();
  const [returnDate, setReturnDate] = useState<Date>();
  const [travelers, setTravelers] = useState(2);
  const [budget, setBudget] = useState<string>("mid");
  const [interests, setInterests] = useState<string[]>([]);

  const totalSteps = 4;

  const toggleInterest = (id: string) => {
    setInterests(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleGenerateSuggestions = async () => {
    setIsLoading(true);
    
    // Simulate AI processing with mock data
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const mockSuggestions: TripSuggestion[] = [
      {
        id: "1",
        city: "Barcelona",
        country: "Spain",
        airportCode: "BCN",
        price: 589,
        rating: 4.8,
        matchScore: 95,
        tags: ["Beach", "Culture", "Food"],
        weather: "24°C Sunny",
        flightTime: "8h 30m",
        description: "Perfect blend of beach, culture, and incredible food scene",
        hotelArea: "Gothic Quarter or Barceloneta",
        estimatedTotal: 2450,
        tips: ["Visit La Sagrada Familia early morning", "Try tapas at La Boqueria market"],
      },
      {
        id: "2",
        city: "Lisbon",
        country: "Portugal",
        airportCode: "LIS",
        price: 459,
        rating: 4.7,
        matchScore: 89,
        tags: ["Culture", "Beach", "Nightlife"],
        weather: "22°C Partly Cloudy",
        flightTime: "7h 15m",
        description: "Historic charm with modern vibes and stunning coastal views",
        hotelArea: "Baixa or Alfama",
        estimatedTotal: 1890,
        tips: ["Ride Tram 28 through historic neighborhoods", "Day trip to Sintra"],
      },
      {
        id: "3",
        city: "Tokyo",
        country: "Japan",
        airportCode: "NRT",
        price: 849,
        rating: 4.9,
        matchScore: 87,
        tags: ["Culture", "Food", "Shopping"],
        weather: "18°C Clear",
        flightTime: "14h 20m",
        description: "Unique blend of ancient traditions and cutting-edge technology",
        hotelArea: "Shinjuku or Shibuya",
        estimatedTotal: 3200,
        tips: ["Get a JR Pass for transportation", "Visit Tsukiji Outer Market early"],
      },
      {
        id: "4",
        city: "Bali",
        country: "Indonesia",
        airportCode: "DPS",
        price: 699,
        rating: 4.6,
        matchScore: 82,
        tags: ["Beach", "Nature", "Romantic"],
        weather: "28°C Tropical",
        flightTime: "20h",
        description: "Tropical paradise with stunning temples and rice terraces",
        hotelArea: "Seminyak or Ubud",
        estimatedTotal: 2100,
        tips: ["Watch sunrise at Mount Batur", "Visit Tegallalang Rice Terraces"],
      },
    ];
    
    setSuggestions(mockSuggestions);
    setIsLoading(false);
    setStep(5);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Where do you want to go?</h2>
              <p className="text-muted-foreground">Enter a destination or leave blank for "Anywhere"</p>
            </div>
            
            <div className="relative max-w-md mx-auto">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Paris, Tokyo, Anywhere..."
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="pl-12 h-14 text-lg rounded-xl"
              />
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center">
              {["Anywhere", "Europe", "Asia", "Caribbean"].map((quick) => (
                <Button
                  key={quick}
                  variant={destination === quick ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDestination(quick)}
                  className="rounded-full"
                >
                  {quick}
                </Button>
              ))}
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">When are you traveling?</h2>
              <p className="text-muted-foreground">Select your travel dates or approximate range</p>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4 max-w-lg mx-auto">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-14 justify-start gap-3 rounded-xl">
                    <CalendarIcon className="w-5 h-5" />
                    {departDate ? format(departDate, "MMM d, yyyy") : "Departure date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={departDate}
                    onSelect={setDepartDate}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-14 justify-start gap-3 rounded-xl">
                    <CalendarIcon className="w-5 h-5" />
                    {returnDate ? format(returnDate, "MMM d, yyyy") : "Return date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={returnDate}
                    onSelect={setReturnDate}
                    disabled={(date) => date < (departDate || new Date())}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="max-w-md mx-auto">
              <label className="text-sm text-muted-foreground mb-2 block text-center">
                Number of travelers
              </label>
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setTravelers(Math.max(1, travelers - 1))}
                  className="rounded-full"
                >
                  -
                </Button>
                <div className="flex items-center gap-2 min-w-[100px] justify-center">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <span className="text-2xl font-bold">{travelers}</span>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setTravelers(Math.min(10, travelers + 1))}
                  className="rounded-full"
                >
                  +
                </Button>
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">What's your budget?</h2>
              <p className="text-muted-foreground">This helps us find the best options for you</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
              {budgetLevels.map((level) => (
                <Button
                  key={level.value}
                  variant={budget === level.value ? "default" : "outline"}
                  onClick={() => setBudget(level.value)}
                  className={cn(
                    "h-auto py-4 flex flex-col gap-1 rounded-xl",
                    budget === level.value && "ring-2 ring-primary"
                  )}
                >
                  <span className="font-semibold">{level.label}</span>
                  <span className="text-xs opacity-70">{level.description}</span>
                </Button>
              ))}
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">What do you enjoy?</h2>
              <p className="text-muted-foreground">Select your interests to personalize recommendations</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
              {interestOptions.map((interest) => (
                <Button
                  key={interest.id}
                  variant={interests.includes(interest.id) ? "default" : "outline"}
                  onClick={() => toggleInterest(interest.id)}
                  className={cn(
                    "h-auto py-4 flex flex-col gap-2 rounded-xl transition-all",
                    interests.includes(interest.id) && "ring-2 ring-primary scale-105"
                  )}
                >
                  <span className="text-2xl">{interest.emoji}</span>
                  <span className="text-xs font-medium">{interest.label}</span>
                </Button>
              ))}
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            key="step5"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Your AI Trip Suggestions</h2>
              <p className="text-muted-foreground">
                Personalized destinations based on your preferences
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {suggestions.map((suggestion, index) => (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:border-primary/50 transition-all group">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold">{suggestion.city}</h3>
                          <p className="text-sm text-muted-foreground">{suggestion.country}</p>
                        </div>
                        <Badge className="bg-violet-500/20 text-violet-400">
                          {suggestion.matchScore}% Match
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-4">
                        {suggestion.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {suggestion.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Plane className="w-4 h-4 text-sky-500" />
                          <span>From ${suggestion.price}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Sun className="w-4 h-4 text-amber-500" />
                          <span>{suggestion.weather}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-violet-500" />
                          <span>{suggestion.hotelArea}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-emerald-500" />
                          <span>~${suggestion.estimatedTotal} total</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button className="flex-1 gap-2">
                          <Plane className="w-4 h-4" />
                          Search Flights
                        </Button>
                        <Button variant="outline" size="icon">
                          <Bookmark className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon">
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            
            {/* Disclaimer */}
            <p className="text-xs text-muted-foreground text-center max-w-2xl mx-auto">
              AI suggestions are estimates based on current data. Actual prices may vary. 
              Book directly with partners for confirmed pricing.
            </p>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/20 mb-6">
              <Sparkles className="w-4 h-4 text-violet-500" />
              <span className="text-sm font-medium text-violet-400">AI-Powered Planning</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Plan Your Perfect Trip
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tell us your preferences and our AI will create personalized destination 
              recommendations with flights, hotels, and travel tips.
            </p>
          </div>

          {/* Progress Bar */}
          {step < 5 && (
            <div className="max-w-2xl mx-auto mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Step {step} of {totalSteps}</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round((step / totalSteps) * 100)}% complete
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-violet-500 to-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(step / totalSteps) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Content Card */}
          <Card className="max-w-3xl mx-auto border-violet-500/20">
            <CardContent className="p-8">
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-violet-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4">
                    <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">AI is thinking...</h3>
                  <p className="text-muted-foreground">
                    Analyzing your preferences and finding the best destinations
                  </p>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  {renderStep()}
                </AnimatePresence>
              )}

              {/* Navigation */}
              {!isLoading && step < 5 && (
                <div className="flex justify-between mt-8 pt-6 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={() => setStep(Math.max(1, step - 1))}
                    disabled={step === 1}
                    className="gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </Button>
                  
                  {step < totalSteps ? (
                    <Button
                      onClick={() => setStep(step + 1)}
                      className="gap-2 bg-gradient-to-r from-violet-500 to-purple-500"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleGenerateSuggestions}
                      className="gap-2 bg-gradient-to-r from-violet-500 to-purple-500"
                    >
                      <Sparkles className="w-4 h-4" />
                      Generate Suggestions
                    </Button>
                  )}
                </div>
              )}

              {step === 5 && (
                <div className="flex justify-center mt-8 pt-6 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="gap-2"
                  >
                    <Compass className="w-4 h-4" />
                    Start New Search
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AITripPlanner;
