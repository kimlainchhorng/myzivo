import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plane, 
  Hotel, 
  Car, 
  Plus,
  X,
  ArrowRight,
  Sparkles,
  DollarSign,
  Calendar,
  MapPin,
  Check
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TripComponent {
  id: string;
  type: "flight" | "hotel" | "car";
  selected: boolean;
  price: number;
  savings: number;
}

interface TripBuilderWidgetProps {
  destination?: string;
  className?: string;
}

const TripBuilderWidget = ({ destination = "Paris", className }: TripBuilderWidgetProps) => {
  const navigate = useNavigate();
  const [components, setComponents] = useState<TripComponent[]>([
    { id: "flight", type: "flight", selected: true, price: 459, savings: 0 },
    { id: "hotel", type: "hotel", selected: false, price: 189, savings: 38 },
    { id: "car", type: "car", selected: false, price: 65, savings: 15 },
  ]);

  const toggleComponent = (id: string) => {
    setComponents(prev => 
      prev.map(c => c.id === id ? { ...c, selected: !c.selected } : c)
    );
  };

  const selectedComponents = components.filter(c => c.selected);
  const totalPrice = selectedComponents.reduce((sum, c) => sum + c.price, 0);
  const totalSavings = selectedComponents.length > 1 
    ? selectedComponents.reduce((sum, c) => sum + c.savings, 0) 
    : 0;

  const componentConfig = {
    flight: { 
      icon: Plane, 
      label: "Flight", 
      description: "Round trip",
      color: "text-sky-500",
      bgColor: "bg-sky-500/10",
      borderColor: "border-sky-500"
    },
    hotel: { 
      icon: Hotel, 
      label: "Hotel", 
      description: "4 nights",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500"
    },
    car: { 
      icon: Car, 
      label: "Car Rental", 
      description: "Full coverage",
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500"
    },
  };

  const handleBuildTrip = () => {
    if (selectedComponents.find(c => c.type === "flight")) {
      navigate("/book-flight");
    } else if (selectedComponents.find(c => c.type === "hotel")) {
      navigate("/book-hotel");
    } else {
      navigate("/rent-car");
    }
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3 bg-gradient-to-r from-violet-500/10 to-purple-500/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Build Your Trip</CardTitle>
              <p className="text-sm text-muted-foreground">
                Bundle & save up to 25%
              </p>
            </div>
          </div>
          {destination && (
            <Badge variant="secondary" className="bg-violet-500/10 text-violet-600">
              <MapPin className="w-3 h-3 mr-1" />
              {destination}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        {/* Trip Components */}
        <div className="space-y-2">
          {components.map((component) => {
            const config = componentConfig[component.type];
            const Icon = config.icon;
            
            return (
              <button
                key={component.id}
                onClick={() => toggleComponent(component.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all",
                  component.selected 
                    ? `${config.bgColor} ${config.borderColor}` 
                    : "border-border hover:border-primary/30"
                )}
              >
                {/* Checkbox */}
                <div className={cn(
                  "w-6 h-6 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all duration-200",
                  component.selected 
                    ? "bg-primary border-primary" 
                    : "border-muted-foreground/30"
                )}>
                  {component.selected && <Check className="w-4 h-4 text-white" />}
                </div>
                
                {/* Icon */}
                <div className={cn("p-2 rounded-xl shrink-0", config.bgColor)}>
                  <Icon className={cn("w-5 h-5", config.color)} />
                </div>
                
                {/* Content */}
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{config.label}</span>
                    {component.savings > 0 && component.selected && (
                      <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">
                        Save ${component.savings}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{config.description}</p>
                </div>
                
                {/* Price */}
                <div className="text-right shrink-0">
                  <span className="font-bold">${component.price}</span>
                  {component.selected && component.savings > 0 && (
                    <p className="text-xs text-primary line-through opacity-50">
                      ${component.price + component.savings}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Summary */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-teal-500/5 border border-primary/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              {selectedComponents.length} item{selectedComponents.length !== 1 ? "s" : ""} selected
            </span>
            <div className="text-right">
              <span className="text-xl font-bold">${totalPrice}</span>
              {totalSavings > 0 && (
                <span className="text-sm text-primary ml-2">
                  (Save ${totalSavings})
                </span>
              )}
            </div>
          </div>
          
          {selectedComponents.length > 1 && (
            <div className="flex items-center gap-2 text-xs text-primary">
              <Sparkles className="w-3 h-3" />
              Bundle discount applied!
            </div>
          )}
        </div>

        <Button 
          className="w-full bg-gradient-to-r from-primary to-teal-500"
          onClick={handleBuildTrip}
          disabled={selectedComponents.length === 0}
        >
          Build My Trip
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default TripBuilderWidget;
