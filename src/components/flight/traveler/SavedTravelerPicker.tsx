/**
 * Saved Traveler Picker — select from saved profiles to autofill passenger cards
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, User, ChevronDown, Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTravelerProfiles, type TravelerProfile } from "@/hooks/useTravelerProfiles";
import type { PassengerForm } from "./PassengerFormCard";

interface SavedTravelerPickerProps {
  passengerIndex: number;
  onSelect: (profile: TravelerProfile) => void;
  selectedProfileId?: string;
}

/** Map a saved TravelerProfile → PassengerForm fields */
export function profileToPassenger(profile: TravelerProfile): Partial<PassengerForm> {
  return {
    given_name: profile.first_name || "",
    family_name: profile.last_name || "",
    gender: profile.gender === "male" ? "m" : profile.gender === "female" ? "f" : "",
    born_on: profile.date_of_birth || "",
    email: profile.email || "",
    phone_number: profile.phone || "",
    nationality: profile.nationality || "",
    passport_number: profile.passport_number || "",
    passport_expiry: profile.passport_expiry || "",
  };
}

export function SavedTravelerPicker({ passengerIndex, onSelect, selectedProfileId }: SavedTravelerPickerProps) {
  const { data: profiles, isLoading } = useTravelerProfiles();
  const [expanded, setExpanded] = useState(false);

  if (isLoading || !profiles || profiles.length === 0) return null;

  const getInitials = (p: TravelerProfile) => {
    const f = p.first_name?.[0] || "";
    const l = p.last_name?.[0] || "";
    return (f + l).toUpperCase() || "?";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-2"
    >
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "w-full flex items-center gap-2.5 p-2.5 rounded-xl border transition-all text-left",
          expanded
            ? "bg-[hsl(var(--flights))]/5 border-[hsl(var(--flights))]/20"
            : "bg-muted/20 border-border/30 hover:border-[hsl(var(--flights))]/20"
        )}
      >
        <div className="w-7 h-7 rounded-lg bg-[hsl(var(--flights))]/10 flex items-center justify-center shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-[hsl(var(--flights))]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold">
            {selectedProfileId ? "Change saved traveler" : `Autofill Passenger ${passengerIndex + 1}`}
          </p>
          <p className="text-[9px] text-muted-foreground">
            {profiles.length} saved profile{profiles.length > 1 ? "s" : ""} available
          </p>
        </div>
        <ChevronDown className={cn(
          "w-4 h-4 text-muted-foreground transition-transform",
          expanded && "rotate-180"
        )} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-1.5 space-y-1.5">
              {profiles.map((profile) => {
                const isSelected = selectedProfileId === profile.id;
                return (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => {
                      onSelect(profile);
                      setExpanded(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-2.5 p-2.5 rounded-xl border transition-all text-left",
                      isSelected
                        ? "bg-[hsl(var(--flights))]/10 border-[hsl(var(--flights))]/30"
                        : "bg-card border-border/30 hover:border-[hsl(var(--flights))]/20 hover:bg-muted/30"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0",
                      isSelected
                        ? "bg-[hsl(var(--flights))] text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}>
                      {isSelected ? <Check className="w-3.5 h-3.5" /> : getInitials(profile)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-[12px] font-semibold truncate">
                          {profile.first_name} {profile.last_name}
                        </p>
                        {profile.is_primary && (
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-[9px] text-muted-foreground truncate">
                        {[
                          profile.nationality,
                          profile.passport_number ? `Passport: ···${profile.passport_number.slice(-4)}` : null,
                        ].filter(Boolean).join(" · ") || "No passport info"}
                      </p>
                    </div>
                    {isSelected && (
                      <Badge className="text-[7px] h-3.5 px-1 bg-[hsl(var(--flights))]/15 text-[hsl(var(--flights))] border-0">
                        Applied
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
