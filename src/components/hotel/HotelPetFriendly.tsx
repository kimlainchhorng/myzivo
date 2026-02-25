import { Dog, Cat, Heart, Check, AlertCircle, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const petPolicies = [
  { text: "Dogs up to 50 lbs welcome", included: true },
  { text: "Cats allowed", included: true },
  { text: "Pet relief area on-site", included: true },
  { text: "Pet-sitting services available", included: true },
  { text: "Pet food menu at restaurant", included: true },
  { text: "Exotic pets", included: false },
];

const petFees = {
  perNight: 35,
  deposit: 100,
  maxPets: 2,
};

const HotelPetFriendly = () => {
  return (
    <section className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Badge className="mb-3 bg-pink-500/20 text-pink-400 border-pink-500/30">
            <Heart className="w-3 h-3 mr-1" /> Pet Friendly
          </Badge>
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-2">
            Bring Your Furry Friends
          </h2>
          <p className="text-muted-foreground">Your pets are family, and they're welcome here</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Pet Icons */}
          <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-2xl border border-pink-500/30 p-6 text-center">
            <div className="flex justify-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-pink-500/20 flex items-center justify-center">
                <Dog className="w-10 h-10 text-pink-400" />
              </div>
              <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Cat className="w-10 h-10 text-purple-400" />
              </div>
            </div>
            <h3 className="font-bold text-xl mb-2">Pets Stay Happy Here</h3>
            <p className="text-sm text-muted-foreground mb-4">
              We provide water bowls, treats, and cozy pet beds upon request
            </p>
            <Button className="bg-gradient-to-r from-pink-500 to-purple-500">
              Book Pet-Friendly Room
            </Button>
          </div>

          {/* Policies & Fees */}
          <div className="space-y-4">
            <div className="bg-card/60 backdrop-blur-xl rounded-2xl border border-border/50 p-5 hover:border-pink-500/30 hover:shadow-sm transition-all duration-200">
              <h3 className="font-bold mb-4">Pet Policy</h3>
              <div className="space-y-2">
                {petPolicies.map((policy, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    {policy.included ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    )}
                    <span className={policy.included ? "" : "text-muted-foreground"}>{policy.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card/60 backdrop-blur-xl rounded-xl border border-border/50 p-5 hover:border-pink-500/30 hover:shadow-sm transition-all duration-200">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" /> Pet Fees
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Per night fee</span>
                  <span className="font-medium">${petFees.perNight}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Refundable deposit</span>
                  <span className="font-medium">${petFees.deposit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Max pets per room</span>
                  <span className="font-medium">{petFees.maxPets}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HotelPetFriendly;
