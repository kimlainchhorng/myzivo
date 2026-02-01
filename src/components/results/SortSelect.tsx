/**
 * Sort Select Component
 * Unified sorting for all results pages
 * Premium design with consistent styling
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SortOption = {
  value: string;
  label: string;
};

interface SortSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SortOption[];
  className?: string;
}

// Flights: cheapest first, then duration-based options
export const flightSortOptions: SortOption[] = [
  { value: "price", label: "Cheapest First" },
  { value: "best", label: "Best Value" },
  { value: "duration", label: "Fastest" },
  { value: "departure", label: "Departure Time" },
];

// Hotels: value-focused, then ratings
export const hotelSortOptions: SortOption[] = [
  { value: "price", label: "Lowest Price" },
  { value: "rating", label: "Guest Rating" },
  { value: "stars", label: "Star Rating" },
  { value: "distance", label: "Distance" },
];

// Cars: price and practical options
export const carSortOptions: SortOption[] = [
  { value: "price", label: "Lowest Price" },
  { value: "category", label: "Car Category" },
  { value: "company", label: "Supplier A-Z" },
];

export function SortSelect({ value, onValueChange, options, className }: SortSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={cn("w-[160px] h-9 text-sm", className)}>
        <ArrowUpDown className="w-4 h-4 mr-2 text-muted-foreground" />
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent align="end">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value} className="text-sm">
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
