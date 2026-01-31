import { Leaf, Droplets, Sun, Recycle, Award, TreePine, Zap, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const ecoFeatures = [
  { icon: Sun, title: "Solar Powered", description: "100% renewable energy", score: 95 },
  { icon: Droplets, title: "Water Conservation", description: "Low-flow fixtures throughout", score: 88 },
  { icon: Recycle, title: "Zero Waste", description: "Comprehensive recycling program", score: 92 },
  { icon: TreePine, title: "Carbon Neutral", description: "Offset all emissions", score: 100 },
];

const certifications = [
  { name: "LEED Gold", icon: Award },
  { name: "Green Key", icon: Leaf },
  { name: "EarthCheck", icon: Heart },
];

const HotelSustainability = () => {
  return (
    <section className="py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <Badge className="mb-3 bg-green-500/20 text-green-400 border-green-500/30">
            <Leaf className="w-3 h-3 mr-1" /> Eco-Friendly
          </Badge>
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
            Sustainability Commitment
          </h2>
          <p className="text-muted-foreground">Our efforts to protect the planet</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Score */}
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl border border-green-500/30 p-6 flex flex-col items-center justify-center text-center">
            <div className="relative mb-4">
              <div className="w-32 h-32 rounded-full border-8 border-green-500/30 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-4xl font-bold text-green-400">94</span>
                  <span className="text-lg text-green-400">/100</span>
                </div>
              </div>
              <Leaf className="w-8 h-8 text-green-400 absolute -top-2 -right-2" />
            </div>
            <h3 className="font-bold text-lg mb-1">Eco Score</h3>
            <p className="text-sm text-muted-foreground">Top 5% of hotels worldwide</p>
          </div>

          {/* Eco Features */}
          <div className="md:col-span-2 bg-card/60 backdrop-blur-xl rounded-2xl border border-border/50 p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-green-400" /> Green Initiatives
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {ecoFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="p-4 rounded-xl bg-muted/30">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{feature.title}</p>
                        <p className="text-xs text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={feature.score} className="h-2 flex-1" />
                      <span className="text-xs font-medium text-green-400">{feature.score}%</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Certifications */}
            <div className="mt-6 pt-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground mb-3">Certifications</p>
              <div className="flex flex-wrap gap-2">
                {certifications.map((cert, index) => {
                  const Icon = cert.icon;
                  return (
                    <Badge key={index} variant="outline" className="py-2 px-3">
                      <Icon className="w-4 h-4 mr-2 text-green-400" />
                      {cert.name}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HotelSustainability;
