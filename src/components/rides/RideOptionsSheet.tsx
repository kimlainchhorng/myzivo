import React, { useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, CreditCard, Users } from "lucide-react";

type RideCategory = "Popular" | "Premium" | "More";

type RideOption = {
  id: string;
  name: string;
  category: RideCategory;
  eta: string;
  description: string;
  price: number;
  oldPrice?: number;
  seats: number;
  image: string;
};

const rideOptionsSeed: RideOption[] = [
  {
    id: "economy",
    name: "ZIVO Economy",
    category: "Popular",
    eta: "3:20 pm",
    description: "Affordable everyday rides",
    price: 24.15,
    seats: 4,
    image: "/vehicles/economy-car-v2.png",
  },
  {
    id: "xl",
    name: "ZIVO XL",
    category: "Popular",
    eta: "3:21 pm",
    description: "Extra space for groups",
    price: 28.33,
    seats: 6,
    image: "/vehicles/xl-car.png",
  },
  {
    id: "share",
    name: "ZIVO Share",
    category: "Popular",
    eta: "3:22 pm",
    description: "Share a ride, save money",
    price: 11.40,
    oldPrice: 16.29,
    seats: 2,
    image: "/vehicles/economy-car-v2.png",
  },
  {
    id: "comfort",
    name: "ZIVO Comfort",
    category: "Premium",
    eta: "3:24 pm",
    description: "Top-rated drivers, extra legroom",
    price: 45.61,
    seats: 4,
    image: "/vehicles/comfort-car.png",
  },
  {
    id: "luxury",
    name: "ZIVO Luxury",
    category: "Premium",
    eta: "3:25 pm",
    description: "Premium with professional drivers",
    price: 73.23,
    seats: 4,
    image: "/vehicles/black-sedan.png",
  },
  {
    id: "car-seat",
    name: "ZIVO Car Seat",
    category: "More",
    eta: "3:26 pm",
    description: "Equipped with 1 child car seat",
    price: 39.95,
    seats: 4,
    image: "/vehicles/economy-car.png",
  },
  {
    id: "xl-car-seat",
    name: "ZIVO XL Car Seat",
    category: "More",
    eta: "3:27 pm",
    description: "Larger vehicle with car seat",
    price: 47.11,
    seats: 6,
    image: "/vehicles/xl-car.png",
  },
  {
    id: "black-car-seat",
    name: "ZIVO Black Car Seat",
    category: "More",
    eta: "3:28 pm",
    description: "Premium with car seat",
    price: 81.39,
    seats: 4,
    image: "/vehicles/black-car.png",
  },
  {
    id: "wav",
    name: "ZIVO WAV",
    category: "More",
    eta: "3:29 pm",
    description: "Wheelchair-accessible rides",
    price: 33.50,
    seats: 4,
    image: "/vehicles/wav-car.png",
  },
];

function formatPrice(value: number) {
  return `$${value.toFixed(2)}`;
}

const categories: RideCategory[] = ["Popular", "Premium", "More"];

interface RideOptionsSheetProps {
  onConfirm?: (rideId: string) => void;
  onBack?: () => void;
  promoPercent?: number;
}

export default function RideOptionsSheet({
  onConfirm,
  onBack,
  promoPercent = 15,
}: RideOptionsSheetProps) {
  const [activeCategory, setActiveCategory] = useState<RideCategory>("Popular");
  const [selectedRideId, setSelectedRideId] = useState<string>("economy");

  const filteredOptions = useMemo(
    () => rideOptionsSeed.filter((r) => r.category === activeCategory),
    [activeCategory]
  );

  const selectedRide =
    rideOptionsSeed.find((r) => r.id === selectedRideId) ?? rideOptionsSeed[0];

  return (
    <div className="flex flex-col bg-background h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="rounded-full p-2 hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <h2 className="text-xl font-bold text-foreground">Choose a ride</h2>
        </div>

        {promoPercent > 0 && (
          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {promoPercent}% promo applied
          </div>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 px-5 pt-3 pb-2">
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Ride Options List */}
      <div className="flex-1 overflow-y-auto px-3 pt-1 pb-2">
        {filteredOptions.map((ride) => {
          const isSelected = selectedRideId === ride.id;
          return (
            <button
              key={ride.id}
              onClick={() => setSelectedRideId(ride.id)}
              className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors ${
                isSelected
                  ? "bg-muted/70 ring-1 ring-foreground/10"
                  : "hover:bg-muted/40"
              }`}
            >
              {/* Vehicle Image */}
              <div className="flex h-16 w-20 flex-shrink-0 items-center justify-center">
                <img
                  src={ride.image}
                  alt={ride.name}
                  className="h-12 w-auto object-contain"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground truncate">
                    {ride.name}
                  </span>
                  <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {ride.seats}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {ride.eta} · {ride.description}
                </p>
              </div>

              {/* Price + Check */}
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="text-sm font-bold text-foreground">
                  {formatPrice(ride.price)}
                </span>
                {ride.oldPrice && (
                  <span className="text-xs text-muted-foreground line-through">
                    {formatPrice(ride.oldPrice)}
                  </span>
                )}
                {isSelected && (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Payment Row */}
      <div className="border-t border-border px-5 py-3">
        <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 hover:bg-muted/40 transition-colors">
          <CreditCard className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-foreground font-medium">
            Visa •••• 4242
          </span>
          <ArrowLeft className="ml-auto h-4 w-4 rotate-180 text-muted-foreground" />
        </button>
      </div>

      {/* Confirm Button */}
      <div className="px-5 pb-5 pt-1">
        <button
          onClick={() => onConfirm?.(selectedRide.id)}
          className="w-full rounded-2xl bg-foreground py-4 text-center text-base font-bold text-background transition-opacity hover:opacity-90"
        >
          Confirm {selectedRide.name.replace("ZIVO ", "")} · {formatPrice(selectedRide.price)}
        </button>
      </div>
    </div>
  );
}
