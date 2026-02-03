/**
 * Cross-Service Suggestions Hook
 * Contextual upsells between ZIVO services
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CrossSellSuggestion {
  id: string;
  source_service: string;
  suggested_service: string;
  suggestion_type: string;
  context: Record<string, unknown>;
  is_shown: boolean;
  is_clicked: boolean;
  is_converted: boolean;
  created_at: string;
}

interface SuggestionContext {
  flight?: {
    destination?: string;
    arrival_date?: string;
    departure_date?: string;
    airport?: string;
  };
  car?: {
    pickup_location?: string;
    pickup_date?: string;
    return_date?: string;
  };
  hotel?: {
    city?: string;
    check_in?: string;
    check_out?: string;
  };
}

// Generate contextual suggestions based on recent activity
export function useCrossSellSuggestions(sourceService: string, context?: SuggestionContext) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["cross-sell-suggestions", user?.id, sourceService, context],
    queryFn: async () => {
      const suggestions: Array<{
        service: string;
        title: string;
        description: string;
        icon: string;
        link: string;
        priority: number;
      }> = [];

      // Flight → Car Rental suggestion
      if (sourceService === "flights" && context?.flight) {
        suggestions.push({
          service: "cars",
          title: "Need a car?",
          description: `Rent a car in ${context.flight.destination || "your destination"}`,
          icon: "🚗",
          link: `/car-rental?location=${context.flight.destination}&pickup=${context.flight.arrival_date}`,
          priority: 1,
        });

        // Flight → Hotel suggestion
        suggestions.push({
          service: "hotels",
          title: "Book a hotel",
          description: `Find hotels in ${context.flight.destination || "your destination"}`,
          icon: "🏨",
          link: `/hotels?city=${context.flight.destination}&checkin=${context.flight.arrival_date}`,
          priority: 2,
        });
      }

      // Car Rental → Airport pickup suggestion
      if (sourceService === "cars" && context?.car) {
        suggestions.push({
          service: "rides",
          title: "Need a ride?",
          description: "Book airport pickup with ZIVO Rides",
          icon: "🚕",
          link: `/rides`,
          priority: 1,
        });
      }

      // Hotel → Restaurant/Eats suggestion
      if (sourceService === "hotels" && context?.hotel) {
        suggestions.push({
          service: "eats",
          title: "Hungry?",
          description: `Discover restaurants in ${context.hotel.city || "your city"}`,
          icon: "🍔",
          link: `/eats`,
          priority: 1,
        });
      }

      // Eats → Move suggestion
      if (sourceService === "eats") {
        suggestions.push({
          service: "move",
          title: "Need something delivered?",
          description: "Use ZIVO Move for package delivery",
          icon: "📦",
          link: `/move`,
          priority: 2,
        });
      }

      return suggestions.sort((a, b) => a.priority - b.priority);
    },
    enabled: !!user && !!sourceService,
  });
}

// Track suggestion interaction
export function useTrackSuggestion() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      sourceService,
      suggestedService,
      action,
    }: {
      sourceService: string;
      suggestedService: string;
      action: "shown" | "clicked" | "converted";
    }) => {
      const updateField =
        action === "shown"
          ? { is_shown: true, shown_at: new Date().toISOString() }
          : action === "clicked"
          ? { is_clicked: true, clicked_at: new Date().toISOString() }
          : { is_converted: true, converted_at: new Date().toISOString() };

      // Upsert the suggestion record
      const { error } = await (supabase as any)
        .from("zivo_cross_sell_suggestions")
        .upsert(
          {
            user_id: user!.id,
            source_service: sourceService,
            suggested_service: suggestedService,
            suggestion_type: "contextual",
            ...updateField,
          },
          { onConflict: "id" }
        );

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cross-sell-suggestions"] });
    },
  });
}
