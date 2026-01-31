import { useNavigate } from "react-router-dom";
import { 
  Lightbulb, 
  TrendingUp, 
  Clock, 
  DollarSign,
  Sparkles,
  ArrowRight,
  Zap,
  Target
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Suggestion {
  id: string;
  type: "timing" | "savings" | "trending" | "personalized";
  title: string;
  description: string;
  action: string;
  href: string;
  metric?: string;
  urgency?: "low" | "medium" | "high";
}

interface SmartSuggestionsProps {
  context?: "flight" | "hotel" | "car" | "general";
  className?: string;
}

const suggestionIcons = {
  timing: Clock,
  savings: DollarSign,
  trending: TrendingUp,
  personalized: Target
};

const suggestionColors = {
  timing: "text-blue-500 bg-blue-500/10",
  savings: "text-primary bg-primary/10",
  trending: "text-pink-500 bg-pink-500/10",
  personalized: "text-violet-500 bg-violet-500/10"
};

const getSuggestions = (context: string): Suggestion[] => {
  const base: Suggestion[] = [];
  
  if (context === "flight" || context === "general") {
    base.push({
      id: "flight-timing",
      type: "timing",
      title: "Book Tuesday flights",
      description: "Prices are 18% lower on Tuesdays",
      action: "Find Tuesday deals",
      href: "/book-flight",
      metric: "-18%",
      urgency: "medium"
    });
  }
  
  if (context === "hotel" || context === "general") {
    base.push({
      id: "hotel-savings",
      type: "savings",
      title: "Last-minute hotel deals",
      description: "Same-day bookings up to 40% off",
      action: "View deals",
      href: "/book-hotel",
      metric: "-40%",
      urgency: "high"
    });
  }
  
  if (context === "car" || context === "general") {
    base.push({
      id: "car-trending",
      type: "trending",
      title: "Electric vehicles trending",
      description: "Save on fuel with EV rentals",
      action: "Browse EVs",
      href: "/rent-car",
      metric: "Popular"
    });
  }
  
  base.push({
    id: "bundle-savings",
    type: "personalized",
    title: "Bundle & save 25%",
    description: "Combine flight + hotel + car",
    action: "Create bundle",
    href: "/book-flight",
    metric: "-25%",
    urgency: "medium"
  });
  
  return base.slice(0, 4);
};

const SmartSuggestions = ({ context = "general", className }: SmartSuggestionsProps) => {
  const navigate = useNavigate();
  const suggestions = getSuggestions(context);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10">
            <Lightbulb className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              Smart Tips
              <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-600">
                AI Powered
              </Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">Save more with these insights</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {suggestions.map((suggestion) => {
            const Icon = suggestionIcons[suggestion.type];
            const colorClass = suggestionColors[suggestion.type];
            
            return (
              <button
                key={suggestion.id}
                onClick={() => navigate(suggestion.href)}
                className="p-3 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-muted/30 transition-all text-left group"
              >
                <div className="flex items-start gap-3 mb-2">
                  <div className={cn("p-2 rounded-lg shrink-0", colorClass)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {suggestion.metric && (
                    <Badge 
                      variant={suggestion.urgency === "high" ? "destructive" : "secondary"}
                      className="text-[10px] px-1.5 ml-auto"
                    >
                      {suggestion.metric}
                    </Badge>
                  )}
                </div>
                
                <h4 className="font-semibold text-sm mb-1">{suggestion.title}</h4>
                <p className="text-xs text-muted-foreground mb-2">{suggestion.description}</p>
                
                <span className="text-xs text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                  {suggestion.action}
                  <ArrowRight className="w-3 h-3" />
                </span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartSuggestions;
