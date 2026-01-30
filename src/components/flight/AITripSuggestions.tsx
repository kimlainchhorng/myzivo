import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sparkles,
  Plane,
  MapPin,
  Calendar,
  Users,
  Heart,
  ThumbsDown,
  RefreshCw,
  Sun,
  Mountain,
  Palmtree,
  Building2,
  Camera,
  Utensils,
  Music,
  Clock,
  ChevronRight,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAITripSuggestions, type AIDestination } from "@/hooks/useAITripSuggestions";

interface AITripSuggestionsProps {
  userPreferences?: {
    budget?: 'budget' | 'mid' | 'luxury';
    climate?: 'tropical' | 'temperate' | 'cold';
    activities?: string[];
  };
  origin?: string;
  onSelectDestination?: (airportCode: string, city: string) => void;
  className?: string;
}

// Fallback mock data when AI is unavailable
const FALLBACK_DESTINATIONS: AIDestination[] = [
  {
    id: '1',
    city: 'Lisbon',
    country: 'Portugal',
    airportCode: 'LIS',
    price: 650,
    rating: 4.8,
    tags: ['Culture', 'Food', 'History'],
    weather: '22°C Sunny',
    bestFor: ['Solo travelers', 'Couples'],
    matchScore: 95,
    flightTime: '7h 30m',
    description: 'A vibrant city with rich history, amazing food, and stunning coastal views.',
  },
  {
    id: '2',
    city: 'Kyoto',
    country: 'Japan',
    airportCode: 'KIX',
    price: 1200,
    rating: 4.9,
    tags: ['Culture', 'Nature', 'Temples'],
    weather: '18°C Clear',
    bestFor: ['Photography', 'History buffs'],
    matchScore: 92,
    flightTime: '14h 15m',
    description: 'Ancient temples, serene gardens, and traditional Japanese culture.',
  },
  {
    id: '3',
    city: 'Cartagena',
    country: 'Colombia',
    airportCode: 'CTG',
    price: 580,
    rating: 4.7,
    tags: ['Beach', 'Nightlife', 'History'],
    weather: '30°C Tropical',
    bestFor: ['Adventure', 'Party'],
    matchScore: 88,
    flightTime: '5h 45m',
    description: 'Colorful colonial streets, Caribbean beaches, and vibrant nightlife.',
  },
  {
    id: '4',
    city: 'Cape Town',
    country: 'South Africa',
    airportCode: 'CPT',
    price: 890,
    rating: 4.8,
    tags: ['Nature', 'Adventure', 'Wine'],
    weather: '25°C Sunny',
    bestFor: ['Outdoor lovers', 'Foodies'],
    matchScore: 85,
    flightTime: '16h 30m',
    description: 'Stunning Table Mountain, world-class wineries, and diverse wildlife.',
  },
];
const PREFERENCE_TAGS = [
  { id: 'beach', label: 'Beach', icon: Palmtree },
  { id: 'city', label: 'City', icon: Building2 },
  { id: 'nature', label: 'Nature', icon: Mountain },
  { id: 'culture', label: 'Culture', icon: Camera },
  { id: 'food', label: 'Food', icon: Utensils },
  { id: 'nightlife', label: 'Nightlife', icon: Music },
];

const getCountryEmoji = (country: string): string => {
  const emojiMap: Record<string, string> = {
    'Portugal': '🇵🇹', 'Japan': '🇯🇵', 'Colombia': '🇨🇴', 'South Africa': '🇿🇦',
    'Indonesia': '🇮🇩', 'Thailand': '🇹🇭', 'Italy': '🇮🇹', 'France': '🇫🇷',
    'Spain': '🇪🇸', 'Greece': '🇬🇷', 'Mexico': '🇲🇽', 'Brazil': '🇧🇷',
    'Australia': '🇦🇺', 'New Zealand': '🇳🇿', 'United Kingdom': '🇬🇧',
    'Germany': '🇩🇪', 'Netherlands': '🇳🇱', 'Switzerland': '🇨🇭',
  };
  return emojiMap[country] || '🌍';
};

export const AITripSuggestions = ({
  origin = "New York",
  onSelectDestination,
  className
}: AITripSuggestionsProps) => {
  const { destinations: aiDestinations, isLoading, fetchSuggestions } = useAITripSuggestions();
  const [displayDestinations, setDisplayDestinations] = useState<AIDestination[]>(FALLBACK_DESTINATIONS);
  const [selectedTags, setSelectedTags] = useState<string[]>(['culture', 'food']);
  const [budget, setBudget] = useState<'budget' | 'mid' | 'luxury'>('mid');
  const [travelers, setTravelers] = useState(2);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [dislikedIds, setDislikedIds] = useState<Set<string>>(new Set());
  const [hasLoadedAI, setHasLoadedAI] = useState(false);

  // Update display when AI results come in
  useEffect(() => {
    if (aiDestinations.length > 0) {
      setDisplayDestinations(aiDestinations);
      setHasLoadedAI(true);
    }
  }, [aiDestinations]);

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId) 
        ? prev.filter(t => t !== tagId) 
        : [...prev, tagId]
    );
  };

  const refreshSuggestions = async () => {
    const likedCities = displayDestinations
      .filter(d => likedIds.has(d.id))
      .map(d => d.city);
    const dislikedCities = displayDestinations
      .filter(d => dislikedIds.has(d.id))
      .map(d => d.city);

    await fetchSuggestions({
      budget,
      activities: selectedTags,
      travelers,
      origin,
      likedDestinations: likedCities,
      dislikedDestinations: dislikedCities,
    });
  };

  const likeDestination = (id: string) => {
    setLikedIds(prev => new Set(prev).add(id));
    setDislikedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const dislikeDestination = (id: string) => {
    setDislikedIds(prev => new Set(prev).add(id));
    setLikedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleSelectDestination = (dest: AIDestination) => {
    if (onSelectDestination) {
      onSelectDestination(dest.airportCode, dest.city);
    }
  };

  return (
    <Card className={cn("overflow-hidden border-border/50 bg-card/50 backdrop-blur", className)}>
      <CardHeader className="pb-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 border border-violet-500/40 flex items-center justify-center relative">
              <Sparkles className="w-5 h-5 text-violet-500" />
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-violet-500 animate-pulse" />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                AI Trip Suggestions
                <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/40">
                  Powered by AI
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Personalized destinations based on your preferences
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={refreshSuggestions}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            {isLoading ? "Finding..." : "Refresh"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-6">
        {/* Preferences */}
        <div className="space-y-3">
          <label className="text-sm font-medium">What are you looking for?</label>
          <div className="flex flex-wrap gap-2">
            {PREFERENCE_TAGS.map(tag => (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all",
                  selectedTags.includes(tag.id)
                    ? "bg-primary/20 border-primary/40 text-primary"
                    : "bg-muted/30 border-border/50 text-muted-foreground hover:border-border"
                )}
              >
                <tag.icon className="w-4 h-4" />
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        {/* Budget & Travelers */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground mb-1 block">Budget</label>
            <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50">
              {[
                { value: 'budget', label: '$', tooltip: 'Budget-friendly' },
                { value: 'mid', label: '$$', tooltip: 'Mid-range' },
                { value: 'luxury', label: '$$$', tooltip: 'Luxury' },
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setBudget(option.value as any)}
                  className={cn(
                    "flex-1 py-2 rounded-md text-sm font-medium transition-all",
                    budget === option.value
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Travelers</label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
              <Users className="w-4 h-4 text-muted-foreground" />
              <Input
                type="number"
                min={1}
                max={10}
                value={travelers}
                onChange={(e) => setTravelers(Number(e.target.value))}
                className="w-12 h-6 p-1 text-center bg-transparent border-0"
              />
            </div>
          </div>
        </div>

        {/* Suggestions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium flex items-center gap-2">
              Recommended for you
              {hasLoadedAI && (
                <Badge className="bg-violet-500/20 text-violet-400 text-[10px]">
                  <Zap className="w-2.5 h-2.5 mr-0.5" />
                  AI
                </Badge>
              )}
            </label>
            <span className="text-xs text-muted-foreground">
              From {origin}
            </span>
          </div>

          <div className="grid gap-3">
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-border/50 p-4 animate-pulse">
                  <div className="flex items-start gap-4">
                    <Skeleton className="w-12 h-12 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                      <div className="flex gap-2">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              ))
            ) : (
              displayDestinations
                .filter(d => !dislikedIds.has(d.id))
                .map((dest, i) => (
                  <motion.div
                    key={dest.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={cn(
                      "relative rounded-xl border p-4 transition-all cursor-pointer",
                      likedIds.has(dest.id)
                        ? "border-pink-500/40 bg-pink-500/5"
                        : "border-border/50 hover:border-border bg-card/30"
                    )}
                    onClick={() => handleSelectDestination(dest)}
                  >
                    {/* Match Score */}
                    <div className="absolute -top-2 -right-2">
                      <Badge className="bg-violet-500 text-white font-bold">
                        {dest.matchScore}% match
                      </Badge>
                    </div>

                    <div className="flex items-start gap-4">
                      {/* Destination Emoji */}
                      <div className="text-5xl">{getCountryEmoji(dest.country)}</div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-lg">{dest.city}</h4>
                          <p className="text-sm text-muted-foreground">{dest.country}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">
                            ${dest.price}
                          </p>
                          <p className="text-xs text-muted-foreground">per person</p>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {dest.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 mt-3 text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Sun className="w-4 h-4" />
                          {dest.weather}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {dest.flightTime}
                        </span>
                        <span className="flex items-center gap-1 text-amber-400">
                          ★ {dest.rating}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Button
                        variant={likedIds.has(dest.id) ? "default" : "outline"}
                        size="icon"
                        className={cn(
                          "h-9 w-9",
                          likedIds.has(dest.id) && "bg-pink-500 hover:bg-pink-600"
                        )}
                        onClick={() => likeDestination(dest.id)}
                      >
                        <Heart className={cn(
                          "w-4 h-4",
                          likedIds.has(dest.id) && "fill-current"
                        )} />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => dislikeDestination(dest.id)}
                      >
                        <ThumbsDown className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* AI Learning Note */}
        <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/30 text-center">
          <p className="text-sm text-violet-300">
            <Sparkles className="w-4 h-4 inline mr-1" />
            AI learns from your likes to improve suggestions
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AITripSuggestions;
