import { useState } from "react";
import { Home, Briefcase, Star, MapPin, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SavedLocation,
  useSavedLocations,
  useAddSavedLocation,
  useDeleteSavedLocation,
} from "@/hooks/useSavedLocations";
import { useLocationSearch, Location } from "@/hooks/useRiderBooking";

interface SavedLocationsPanelProps {
  userId: string | undefined;
  onSelect: (location: Location) => void;
}

const iconMap: Record<string, React.ElementType> = {
  home: Home,
  work: Briefcase,
  star: Star,
  pin: MapPin,
};

const SavedLocationsPanel = ({ userId, onSelect }: SavedLocationsPanelProps) => {
  const { data: savedLocations, isLoading } = useSavedLocations(userId);
  const addLocation = useAddSavedLocation();
  const deleteLocation = useDeleteSavedLocation();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newIcon, setNewIcon] = useState("pin");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Location | null>(null);
  const { searchLocations, isSearching } = useLocationSearch();

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length >= 3) {
      const results = await searchLocations(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectSearchResult = (location: Location) => {
    setSelectedAddress(location);
    setSearchQuery(location.address);
    setSearchResults([]);
  };

  const handleSave = async () => {
    if (!selectedAddress || !newLabel.trim()) return;

    await addLocation.mutateAsync({
      label: newLabel,
      address: selectedAddress.address,
      lat: selectedAddress.lat,
      lng: selectedAddress.lng,
      icon: newIcon,
    });

    setIsAddOpen(false);
    setNewLabel("");
    setNewIcon("pin");
    setSearchQuery("");
    setSelectedAddress(null);
  };

  const handleLocationClick = (saved: SavedLocation) => {
    onSelect({
      address: saved.address,
      lat: saved.lat,
      lng: saved.lng,
    });
  };

  if (!userId) return null;

  const presetLocations = [
    { label: "Home", icon: "home" },
    { label: "Work", icon: "work" },
  ];

  const homeLocation = savedLocations?.find(l => l.label.toLowerCase() === "home");
  const workLocation = savedLocations?.find(l => l.label.toLowerCase() === "work");
  const otherLocations = savedLocations?.filter(
    l => l.label.toLowerCase() !== "home" && l.label.toLowerCase() !== "work"
  );

  return (
    <div className="space-y-3">
      {/* Preset Locations (Home & Work) */}
      <div className="grid grid-cols-2 gap-2">
        {presetLocations.map((preset) => {
          const saved = preset.label === "Home" ? homeLocation : workLocation;
          const Icon = iconMap[preset.icon];

          return (
            <Card
              key={preset.label}
              className={`cursor-pointer transition-colors ${
                saved ? "hover:bg-muted" : "border-dashed"
              }`}
              onClick={() => saved && handleLocationClick(saved)}
            >
              <CardContent className="p-3 flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  saved ? "bg-primary/10" : "bg-muted"
                }`}>
                  <Icon className={`w-4 h-4 ${saved ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{preset.label}</p>
                  {saved ? (
                    <p className="text-xs text-muted-foreground truncate">{saved.address}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">Add address</p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Other Saved Locations */}
      {otherLocations && otherLocations.length > 0 && (
        <div className="space-y-2">
          {otherLocations.map((location) => {
            const Icon = iconMap[location.icon] || MapPin;
            return (
              <div
                key={location.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer group"
                onClick={() => handleLocationClick(location)}
              >
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-accent-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{location.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{location.address}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteLocation.mutate(location.id);
                  }}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add New Location Button */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Saved Location
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Saved Location</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Label</label>
                <Input
                  placeholder="e.g., Gym, Mom's House"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Icon</label>
                <Select value={newIcon} onValueChange={setNewIcon}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">
                      <div className="flex items-center gap-2">
                        <Home className="w-4 h-4" /> Home
                      </div>
                    </SelectItem>
                    <SelectItem value="work">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4" /> Work
                      </div>
                    </SelectItem>
                    <SelectItem value="star">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4" /> Favorite
                      </div>
                    </SelectItem>
                    <SelectItem value="pin">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> Pin
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="relative">
              <label className="text-sm font-medium mb-1 block">Address</label>
              <Input
                placeholder="Search for address..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
              {searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {searchResults.map((result, idx) => (
                    <button
                      key={idx}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-start gap-2"
                      onClick={() => handleSelectSearchResult(result)}
                    >
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                      <span className="truncate">{result.address}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedAddress && (
              <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-sm flex-1 truncate">{selectedAddress.address}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => {
                    setSelectedAddress(null);
                    setSearchQuery("");
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}

            <Button
              className="w-full"
              onClick={handleSave}
              disabled={!selectedAddress || !newLabel.trim() || addLocation.isPending}
            >
              {addLocation.isPending ? "Saving..." : "Save Location"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SavedLocationsPanel;
