import { Home, Briefcase, Star, MapPin } from "lucide-react";
import { SavedLocation, useSavedLocations } from "@/hooks/useSavedLocations";
import { Location } from "@/hooks/useRiderBooking";

interface QuickLocationPickerProps {
  userId: string | undefined;
  onSelect: (location: Location) => void;
}

const iconMap: Record<string, React.ElementType> = {
  home: Home,
  work: Briefcase,
  star: Star,
  pin: MapPin,
};

const QuickLocationPicker = ({ userId, onSelect }: QuickLocationPickerProps) => {
  const { data: savedLocations } = useSavedLocations(userId);

  if (!userId || !savedLocations?.length) return null;

  const handleClick = (saved: SavedLocation) => {
    onSelect({
      address: saved.address,
      lat: saved.lat,
      lng: saved.lng,
    });
  };

  // Show up to 4 quick-access locations
  const quickLocations = savedLocations.slice(0, 4);

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {quickLocations.map((location) => {
        const Icon = iconMap[location.icon] || MapPin;
        return (
          <button
            key={location.id}
            onClick={() => handleClick(location)}
            className="flex items-center gap-2 px-3 py-2 bg-muted hover:bg-muted/80 rounded-full transition-colors flex-shrink-0"
          >
            <Icon className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium whitespace-nowrap">{location.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default QuickLocationPicker;
