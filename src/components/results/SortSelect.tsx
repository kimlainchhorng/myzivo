/**
 * Sort Select Component
 * Unified sorting for all results pages
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown } from "lucide-react";

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

export const flightSortOptions: SortOption[] = [
  { value: "price", label: "Cheapest" },
  { value: "duration", label: "Fastest" },
  { value: "best", label: "Best Value" },
  { value: "departure", label: "Departure Time" },
];

export const hotelSortOptions: SortOption[] = [
  { value: "price", label: "Lowest Price" },
  { value: "rating", label: "Guest Rating" },
  { value: "stars", label: "Star Rating" },
  { value: "distance", label: "Distance" },
];

export const carSortOptions: SortOption[] = [
  { value: "price", label: "Lowest Price" },
  { value: "category", label: "Car Category" },
  { value: "company", label: "Company" },
];

export function SortSelect({ value, onValueChange, options, className }: SortSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className || "w-[160px] h-9"}>
        <ArrowUpDown className="w-4 h-4 mr-2 text-muted-foreground" />
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
