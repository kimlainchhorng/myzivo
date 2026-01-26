import { Car, Users, Crown, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import { FareEstimate } from "@/hooks/useRiderBooking";

interface VehicleSelectorProps {
  fareEstimates: FareEstimate[];
  selectedVehicle: string | null;
  onSelect: (vehicleType: string) => void;
}

const vehicleIcons: Record<string, React.ReactNode> = {
  economy: <Car className="w-6 h-6" />,
  comfort: <Users className="w-6 h-6" />,
  premium: <Crown className="w-6 h-6" />,
  xl: <Truck className="w-6 h-6" />,
};

const vehicleDescriptions: Record<string, string> = {
  economy: "Affordable rides",
  comfort: "Extra legroom",
  premium: "Luxury vehicles",
  xl: "For groups up to 6",
};

const VehicleSelector = ({
  fareEstimates,
  selectedVehicle,
  onSelect,
}: VehicleSelectorProps) => {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-sm text-muted-foreground mb-3">Choose a ride</h3>
      <div className="space-y-2">
        {fareEstimates.map((estimate) => (
          <button
            key={estimate.vehicleType}
            onClick={() => onSelect(estimate.vehicleType)}
            className={cn(
              "w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4",
              selectedVehicle === estimate.vehicleType
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-muted/50"
            )}
          >
            <div className={cn(
              "w-12 h-12 rounded-lg flex items-center justify-center",
              selectedVehicle === estimate.vehicleType
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}>
              {vehicleIcons[estimate.vehicleType] || <Car className="w-6 h-6" />}
            </div>
            
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2">
                <span className="font-semibold capitalize">{estimate.vehicleType}</span>
                {estimate.surgeMultiplier > 1 && (
                  <span className="text-xs px-1.5 py-0.5 bg-orange-500/10 text-orange-600 rounded font-medium">
                    {estimate.surgeMultiplier}x surge
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {vehicleDescriptions[estimate.vehicleType] || "Standard ride"} • {Math.round(estimate.estimatedDuration)} min
              </p>
            </div>

            <div className="text-right">
              <p className="font-bold text-lg">${estimate.totalFare.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">
                {estimate.estimatedDistance.toFixed(1)} km
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default VehicleSelector;
