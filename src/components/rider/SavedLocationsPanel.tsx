import { useState } from "react";
import { Home, Briefcase, Star, MapPin, Plus, Trash2, X, Check, Sparkles, Heart } from "lucide-react";
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
import { cn } from "@/lib/utils";

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

const colorMap: Record<string, { bg: string; iconBg: string; text: string }> = {
  home: { 
    bg: "from-blue-500/10 to-blue-600/5", 
    iconBg: "bg-blue-500/20",
    text: "text-blue-500" 
  },
  work: { 
    bg: "from-amber-500/10 to-amber-600/5", 
    iconBg: "bg-amber-500/20",
    text: "text-amber-500" 
  },
  star: { 
    bg: "from-purple-500/10 to-purple-600/5", 
    iconBg: "bg-purple-500/20",
    text: "text-purple-500" 
  },
  pin: { 
    bg: "from-emerald-500/10 to-emerald-600/5", 
    iconBg: "bg-emerald-500/20",
    text: "text-emerald-500" 
  },
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
    <div className="space-y-2.5">
      {/* Section Header */}
      <div className="flex items-center gap-1.5">
        <Heart className="w-3.5 h-3.5 text-primary" />
        <h3 className="text-xs font-semibold">Saved Places</h3>
      </div>

      {/* Preset Locations (Home & Work) */}
      <div className="grid grid-cols-2 gap-2">
        {presetLocations.map((preset, index) => {
          const saved = preset.label === "Home" ? homeLocation : workLocation;
          const Icon = iconMap[preset.icon];
          const colors = colorMap[preset.icon];

          return (
            <div
              key={preset.label}
              className="animate-in fade-in slide-in-from-bottom-2"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Card
                className={cn(
                  "cursor-pointer transition-all duration-200 overflow-hidden border",
                  saved 
                    ? "active:scale-[0.98] border-border/50 hover:shadow-md" 
                    : "border-dashed border-muted-foreground/20"
                )}
                onClick={() => saved && handleLocationClick(saved)}
              >
                <CardContent className={cn(
                  "p-2.5 bg-gradient-to-br",
                  saved ? colors.bg : "from-muted/30 to-muted/10"
                )}>
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center transition-colors",
                      saved ? colors.iconBg : "bg-muted/50"
                    )}>
                      <Icon className={cn(
                        "w-4 h-4",
                        saved ? colors.text : "text-muted-foreground"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold">{preset.label}</p>
                      {saved ? (
                        <p className="text-[10px] text-muted-foreground truncate">{saved.address.split(',')[0]}</p>
                      ) : (
                        <p className="text-[10px] text-muted-foreground">Tap to add</p>
                      )}
                    </div>
                    {saved && (
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <Check className="w-3 h-3 text-emerald-500" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Other Saved Locations */}
      {otherLocations && otherLocations.length > 0 && (
        <div className="space-y-1.5 animate-in fade-in duration-200">
          {otherLocations.map((location, index) => {
            const Icon = iconMap[location.icon] || MapPin;
            const colors = colorMap[location.icon] || colorMap.pin;
            
            return (
              <div
                key={location.id}
                className={cn(
                  "flex items-center gap-2 p-2.5 rounded-xl cursor-pointer group transition-all duration-200 active:scale-[0.98] touch-manipulation",
                  "bg-gradient-to-r",
                  colors.bg,
                  "border border-border/30 hover:shadow-md",
                  "animate-in fade-in slide-in-from-left-2"
                )}
                style={{ animationDelay: `${index * 30}ms` }}
                onClick={() => handleLocationClick(location)}
              >
                <div className={cn(
                  "w-7 h-7 rounded-xl flex items-center justify-center",
                  colors.iconBg
                )}>
                  <Icon className={cn("w-3.5 h-3.5", colors.text)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold">{location.label}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{location.address}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 rounded-md hover:bg-destructive/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteLocation.mutate(location.id);
                  }}
                >
                  <Trash2 className="w-3 h-3 text-destructive" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add New Location Button */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full h-10 rounded-xl border border-dashed border-primary/30 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 text-xs active:scale-[0.97] touch-manipulation"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5 text-primary" />
            <span className="text-primary font-medium">Add New Place</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="border-0 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <DialogTitle>Add Saved Location</DialogTitle>
            </div>
          </DialogHeader>
          <div className="space-y-5 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Label</label>
                <Input
                  placeholder="e.g., Gym, Mom's House"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Icon</label>
                <Select value={newIcon} onValueChange={setNewIcon}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(iconMap).map(([key, Icon]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <span className="capitalize">{key}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="relative">
              <label className="text-sm font-medium mb-2 block">Address</label>
              <Input
                placeholder="Search for address..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="h-11 rounded-xl"
              />
              {searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                  {searchResults.map((result, idx) => (
                    <button
                      key={idx}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-muted/50 flex items-start gap-3 transition-all duration-200 active:scale-[0.98] touch-manipulation"
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
              <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl animate-in fade-in zoom-in-95 duration-200">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-emerald-500" />
                </div>
                <span className="text-sm flex-1 truncate font-medium">{selectedAddress.address}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-xl hover:bg-destructive/10 active:scale-[0.90] transition-all duration-200 touch-manipulation"
                  onClick={() => {
                    setSelectedAddress(null);
                    setSearchQuery("");
                  }}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}

            <Button
              className="w-full h-12 rounded-xl font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/30"
              onClick={handleSave}
              disabled={!selectedAddress || !newLabel.trim() || addLocation.isPending}
            >
              {addLocation.isPending ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                  Saving...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Save Location
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SavedLocationsPanel;
