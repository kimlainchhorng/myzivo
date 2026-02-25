import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Car, Truck, Zap, Crown, Gauge, Wind, Bus, LucideIcon, CircleDollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

const categories: { name: string; Icon: LucideIcon; count: number; avgPrice: number; description: string; color: string }[] = [
  { name: "Economy", Icon: CircleDollarSign, count: 245, avgPrice: 29, description: "Budget-friendly rides", color: "from-green-500 to-emerald-500" },
  { name: "Compact", Icon: Car, count: 189, avgPrice: 39, description: "Perfect for city", color: "from-blue-500 to-cyan-500" },
  { name: "SUV", Icon: Truck, count: 156, avgPrice: 65, description: "Family adventures", color: "from-orange-500 to-amber-500" },
  { name: "Luxury", Icon: Crown, count: 78, avgPrice: 150, description: "Premium experience", color: "from-violet-500 to-purple-500" },
  { name: "Sports", Icon: Gauge, count: 45, avgPrice: 200, description: "Performance cars", color: "from-red-500 to-rose-500" },
  { name: "Electric", Icon: Zap, count: 112, avgPrice: 75, description: "Eco-friendly", color: "from-teal-500 to-green-500" },
  { name: "Convertible", Icon: Wind, count: 67, avgPrice: 95, description: "Open-top fun", color: "from-pink-500 to-rose-500" },
  { name: "Van", Icon: Bus, count: 89, avgPrice: 85, description: "Group travel", color: "from-indigo-500 to-blue-500" },
];

interface CarCategoriesGridProps {
  onSelect?: (category: string) => void;
}

const CarCategoriesGrid = ({ onSelect }: CarCategoriesGridProps) => {
  return (
    <section className="py-12 sm:py-16 border-t border-border/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-transparent to-purple-500/5" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            Browse by <span className="bg-gradient-to-r from-violet-400 to-purple-500 bg-clip-text text-transparent">Category</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Find the perfect vehicle for any occasion
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {categories.map((category, index) => (
            <Card
              key={category.name}
              className={cn(
                "glass-card overflow-hidden group cursor-pointer transition-all duration-300",
                "hover:border-violet-500/50 hover:-translate-y-1 touch-manipulation active:scale-[0.95] rounded-2xl",
                "animate-in fade-in slide-in-from-bottom-4"
              )}
              onClick={() => onSelect?.(category.name)}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="p-4 text-center">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3",
                  "bg-gradient-to-br shadow-lg transition-transform group-hover:scale-110",
                  category.color
                )}>
                  <category.Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-sm mb-1 group-hover:text-violet-400 transition-colors">
                  {category.name}
                </h3>
                <p className="text-xs text-muted-foreground mb-2">{category.count} cars</p>
                <p className="text-xs font-bold text-violet-400">From ${category.avgPrice}/day</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CarCategoriesGrid;
