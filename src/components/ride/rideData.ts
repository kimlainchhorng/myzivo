import { RideOption } from "./RideCard";

import fleetEconomy from "@/assets/fleet-economy.png";
import fleetCompact from "@/assets/fleet-compact.png";
import fleetLuxury from "@/assets/fleet-luxury.png";
import ridePremium from "@/assets/ride-premium.png";
import rideXl from "@/assets/ride-xl.png";
import rideGreen from "@/assets/ride-green.png";

export const rideOptions: Record<"economy" | "premium" | "elite", RideOption[]> = {
  economy: [
    {
      id: "wait_save",
      name: "Wait & Save",
      subtitle: "Lowest price, longer wait.",
      price: 15.89,
      eta: 15,
      image: fleetEconomy,
      category: "economy",
      multiplier: 0.85,
    },
    {
      id: "standard",
      name: "Standard",
      subtitle: "Reliable everyday rides.",
      price: 20.35,
      eta: 4,
      image: fleetCompact,
      category: "economy",
      multiplier: 1.0,
    },
    {
      id: "green",
      name: "Green",
      subtitle: "Eco-friendly rides.",
      price: 21.50,
      eta: 6,
      image: rideGreen,
      category: "economy",
      multiplier: 1.05,
    },
    {
      id: "priority",
      name: "Priority",
      subtitle: "Skip the queue.",
      price: 24.00,
      eta: 2,
      image: fleetCompact,
      category: "economy",
      multiplier: 1.15,
    },
  ],
  premium: [
    {
      id: "comfort",
      name: "Comfort",
      subtitle: "Newer cars, more legroom.",
      price: 30.17,
      eta: 5,
      image: ridePremium,
      category: "premium",
      multiplier: 1.2,
    },
    {
      id: "premium",
      name: "Premium",
      subtitle: "Premium leather sedans.",
      price: 49.80,
      eta: 8,
      image: fleetLuxury,
      category: "premium",
      multiplier: 1.4,
    },
  ],
  elite: [
    {
      id: "elite",
      name: "Elite",
      subtitle: "Ultimate luxury experience.",
      price: 189.00,
      eta: 20,
      image: fleetLuxury,
      category: "elite",
      multiplier: 2.0,
    },
    {
      id: "xl",
      name: "XL",
      subtitle: "Extra room for groups.",
      price: 150.00,
      eta: 15,
      image: rideXl,
      category: "elite",
      multiplier: 1.8,
    },
  ],
};
