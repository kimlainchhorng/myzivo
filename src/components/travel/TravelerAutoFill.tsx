import { useState } from "react";
import { User, ChevronDown, Star, Check, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSavedTravelers } from "@/hooks/useSavedTravelers";
import type { SavedTraveler } from "@/types/travelers";

interface TravelerAutoFillProps {
  travelerType?: "adult" | "child" | "infant";
  onSelect: (traveler: SavedTraveler) => void;
  selectedId?: string;
  disabled?: boolean;
}

export default function TravelerAutoFill({
  travelerType,
  onSelect,
  selectedId,
  disabled = false,
}: TravelerAutoFillProps) {
  const { data: travelers = [], isLoading } = useSavedTravelers();
  const [open, setOpen] = useState(false);

  // Filter by traveler type if specified
  const filteredTravelers = travelerType
    ? travelers.filter((t) => t.traveler_type === travelerType)
    : travelers;

  const selectedTraveler = travelers.find((t) => t.id === selectedId);

  if (isLoading) {
    return (
      <Button variant="outline" size="sm" disabled className="gap-2">
        <User className="h-4 w-4" />
        Loading...
      </Button>
    );
  }

  if (filteredTravelers.length === 0) {
    return null; // Don't show if no saved travelers
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className="gap-2 text-primary border-primary/30 hover:bg-primary/10"
        >
          <UserPlus className="h-4 w-4" />
          {selectedTraveler ? (
            <span className="truncate max-w-[120px]">
              {selectedTraveler.given_name} {selectedTraveler.family_name}
            </span>
          ) : (
            "Use Saved Traveler"
          )}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Saved Travelers
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {filteredTravelers.map((traveler) => (
          <DropdownMenuItem
            key={traveler.id}
            onClick={() => {
              onSelect(traveler);
              setOpen(false);
            }}
            className="cursor-pointer"
          >
            <div className="flex items-center gap-3 w-full">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-teal-400/20 flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="font-medium text-sm truncate">
                    {traveler.title ? `${traveler.title}. ` : ""}
                    {traveler.given_name} {traveler.family_name}
                  </p>
                  {traveler.is_primary && (
                    <Star className="h-3 w-3 text-amber-500 fill-amber-500 flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground capitalize truncate">
                  {traveler.traveler_type}
                  {traveler.email && ` • ${traveler.email}`}
                </p>
              </div>
              {selectedId === traveler.id && (
                <Check className="h-4 w-4 text-primary flex-shrink-0" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
