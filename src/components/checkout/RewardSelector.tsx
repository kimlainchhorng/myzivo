/**
 * RewardSelector — Checkout widget to auto-apply or select available rewards
 */
import { useState, useEffect } from "react";
import { Gift, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Reward {
  id: string;
  reward_type: string;
  reward_value: number;
  status: string;
  expires_at: string | null;
}

interface RewardSelectorProps {
  rewards: Reward[];
  selectedReward: Reward | null;
  onSelect: (reward: Reward | null) => void;
}

function getLabel(type: string): string {
  const labels: Record<string, string> = {
    "5_orders": "5 Orders",
    "10_orders": "10 Orders",
    "25_orders": "25 Orders",
    tier_traveler: "Traveler Tier",
    tier_elite: "Elite Tier",
  };
  return labels[type] || type;
}

export function RewardSelector({ rewards, selectedReward, onSelect }: RewardSelectorProps) {
  // Auto-select nearest-expiring reward on mount
  useEffect(() => {
    if (rewards.length > 0 && !selectedReward) {
      const sorted = [...rewards].sort((a, b) => {
        if (!a.expires_at) return 1;
        if (!b.expires_at) return -1;
        return new Date(a.expires_at).getTime() - new Date(b.expires_at).getTime();
      });
      onSelect(sorted[0]);
    }
  }, [rewards, selectedReward, onSelect]);

  if (rewards.length === 0) return null;

  return (
    <div className="space-y-2">
      {selectedReward ? (
        <div className="flex items-center justify-between p-3 rounded-2xl bg-primary/10 border border-primary/20 transition-all duration-200">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-primary" />
            <div>
              <p className="text-sm font-bold text-primary">
                Reward Applied: ${selectedReward.reward_value} off
              </p>
              <p className="text-xs text-muted-foreground">
                {getLabel(selectedReward.reward_type)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {rewards.length > 1 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="ghost" size="sm" className="h-7 px-2">
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {rewards
                    .filter((r) => r.id !== selectedReward.id)
                    .map((r) => (
                      <DropdownMenuItem key={r.id} onClick={() => onSelect(r)}>
                        <Gift className="w-3 h-3 mr-2" />
                        ${r.reward_value} off — {getLabel(r.reward_type)}
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <button
              type="button"
              onClick={() => onSelect(null)}
              className="p-1.5 rounded-full hover:bg-muted active:scale-90 transition-all duration-200 touch-manipulation min-w-[32px] min-h-[32px] flex items-center justify-center"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full gap-2 text-primary border-primary/30"
          onClick={() => {
            const sorted = [...rewards].sort((a, b) => {
              if (!a.expires_at) return 1;
              if (!b.expires_at) return -1;
              return new Date(a.expires_at).getTime() - new Date(b.expires_at).getTime();
            });
            onSelect(sorted[0]);
          }}
        >
          <Gift className="w-4 h-4" />
          Apply Reward ({rewards.length} available)
        </Button>
      )}
    </div>
  );
}
