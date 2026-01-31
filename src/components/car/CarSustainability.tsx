import { Leaf, Zap, TreePine, Recycle, Wind, Droplets, Award, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const ecoStats = [
  { label: "CO₂ Saved", value: "12.5M", unit: "tons", icon: Wind, trend: "+23%" },
  { label: "Trees Planted", value: "450K", unit: "trees", icon: TreePine, trend: "+15%" },
  { label: "EV Rentals", value: "2.3M", unit: "trips", icon: Zap, trend: "+45%" },
  { label: "Carbon Offset", value: "98%", unit: "coverage", icon: Leaf, trend: "+8%" },
];

const ecoFleet = [
  { type: "Full Electric", count: 2500, percentage: 35, color: "bg-green-500" },
  { type: "Hybrid", count: 1800, percentage: 25, color: "bg-emerald-500" },
  { type: "Fuel Efficient", count: 2000, percentage: 28, color: "bg-teal-500" },
  { type: "Standard", count: 850, percentage: 12, color: "bg-muted" },
];

const CarSustainability = () => {
  return (
    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="relative overflow-hidden bg-gradient-to-br from-green-500/10 via-card/50 to-emerald-500/10 border border-green-500/20 rounded-3xl p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/20 blur-3xl rounded-full" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/20 blur-3xl rounded-full" />

          <div className="relative z-10">
            <div className="text-center mb-10">
              <Badge className="mb-3 bg-green-500/20 text-green-400 border-green-500/30">
                <Leaf className="w-3 h-3 mr-1" /> Eco-Friendly Travel
              </Badge>
              <h2 className="text-2xl md:text-4xl font-display font-bold mb-3">
                Drive Green, Travel Clean
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We're committed to sustainable mobility. Our growing eco-fleet and carbon offset programs help reduce your travel footprint.
              </p>
            </div>

            {/* Eco Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {ecoStats.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-card/60 backdrop-blur-xl rounded-xl p-5 border border-border/30 text-center"
                >
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <stat.icon className="w-6 h-6 text-green-400" />
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.unit}</p>
                  <Badge className="mt-2 bg-green-500/20 text-green-400 border-0 text-[10px]">
                    <TrendingDown className="w-3 h-3 mr-1 rotate-180" />
                    {stat.trend}
                  </Badge>
                </div>
              ))}
            </div>

            {/* Fleet Composition */}
            <div className="bg-card/60 backdrop-blur-xl rounded-xl p-6 border border-border/30 mb-8">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Recycle className="w-5 h-5 text-green-400" />
                Our Eco Fleet Composition
              </h3>
              
              <div className="space-y-4">
                {ecoFleet.map((category) => (
                  <div key={category.type}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{category.type}</span>
                      <span className="text-sm text-muted-foreground">
                        {category.count.toLocaleString()} vehicles ({category.percentage}%)
                      </span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${category.color} rounded-full transition-all duration-1000`}
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted-foreground mt-4 text-center">
                By 2026, we aim to have 75% of our fleet as electric or hybrid vehicles
              </p>
            </div>

            {/* Carbon Offset Program */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card/60 backdrop-blur-xl rounded-xl p-6 border border-border/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <TreePine className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-bold">Tree Planting Program</h3>
                    <p className="text-xs text-muted-foreground">1 tree planted for every rental</p>
                  </div>
                </div>
                <Progress value={75} className="h-2 mb-2" />
                <p className="text-xs text-muted-foreground">
                  Goal: 500,000 trees by end of year (75% complete)
                </p>
              </div>

              <div className="bg-card/60 backdrop-blur-xl rounded-xl p-6 border border-border/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Droplets className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold">Water Conservation</h3>
                    <p className="text-xs text-muted-foreground">Eco-friendly car wash program</p>
                  </div>
                </div>
                <Progress value={60} className="h-2 mb-2" />
                <p className="text-xs text-muted-foreground">
                  85% water recycled in our wash facilities
                </p>
              </div>
            </div>

            <div className="text-center mt-8">
              <Button size="lg" className="bg-gradient-to-r from-green-500 to-emerald-500">
                <Award className="w-4 h-4 mr-2" />
                View Our Sustainability Report
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CarSustainability;
