/**
 * Car Search Filters Component
 * Cascading dropdowns: Make → Model → Year + optional filters
 */

import { Search, RotateCcw, Loader2, MapPin, DollarSign, Gauge, Fuel, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CarMake, CarModel, CarSearchFilters as FilterTypes, fuelTypeOptions, transmissionOptions } from "@/types/carInventory";

interface CarSearchFiltersProps {
  filters: FilterTypes;
  makes: CarMake[];
  models: CarModel[];
  years: number[];
  loadingMakes: boolean;
  loadingModels: boolean;
  loadingYears: boolean;
  loadingResults: boolean;
  onFilterChange: <K extends keyof FilterTypes>(key: K, value: FilterTypes[K]) => void;
  onSearch: () => void;
  onReset: () => void;
}

export function CarSearchFilters({
  filters,
  makes,
  models,
  years,
  loadingMakes,
  loadingModels,
  loadingYears,
  loadingResults,
  onFilterChange,
  onSearch,
  onReset,
}: CarSearchFiltersProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Search className="w-5 h-5 text-primary" />
        Find Your Car
      </h2>

      {/* Primary Cascading Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Make Dropdown */}
        <div className="space-y-2">
          <Label htmlFor="make" className="text-sm font-medium">Make</Label>
          <Select
            value={filters.makeId || ""}
            onValueChange={(value) => onFilterChange("makeId", value || null)}
            disabled={loadingMakes}
          >
            <SelectTrigger id="make" className="w-full">
              <SelectValue placeholder={loadingMakes ? "Loading..." : "Select Make"} />
            </SelectTrigger>
            <SelectContent>
              {makes.map((make) => (
                <SelectItem key={make.id} value={make.id}>
                  {make.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Model Dropdown */}
        <div className="space-y-2">
          <Label htmlFor="model" className="text-sm font-medium">Model</Label>
          <Select
            value={filters.modelId || ""}
            onValueChange={(value) => onFilterChange("modelId", value || null)}
            disabled={!filters.makeId || loadingModels}
          >
            <SelectTrigger id="model" className="w-full">
              <SelectValue 
                placeholder={
                  !filters.makeId 
                    ? "Select Make first" 
                    : loadingModels 
                      ? "Loading..." 
                      : "Select Model"
                } 
              />
            </SelectTrigger>
            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Year Dropdown */}
        <div className="space-y-2">
          <Label htmlFor="year" className="text-sm font-medium">Year</Label>
          <Select
            value={filters.year?.toString() || ""}
            onValueChange={(value) => onFilterChange("year", value ? parseInt(value) : null)}
            disabled={!filters.modelId || loadingYears}
          >
            <SelectTrigger id="year" className="w-full">
              <SelectValue 
                placeholder={
                  !filters.modelId 
                    ? "Select Model first" 
                    : loadingYears 
                      ? "Loading..." 
                      : years.length === 0 
                        ? "No years available"
                        : "Select Year"
                } 
              />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Optional Filters */}
      <div className="border-t border-border pt-4">
        <p className="text-sm text-muted-foreground mb-4">Optional Filters</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Price Range */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-1">
              <DollarSign className="w-3 h-3" /> Price Min
            </Label>
            <Input
              type="number"
              placeholder="Min"
              value={filters.minPrice || ""}
              onChange={(e) => onFilterChange("minPrice", e.target.value ? parseInt(e.target.value) : null)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-1">
              <DollarSign className="w-3 h-3" /> Price Max
            </Label>
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxPrice || ""}
              onChange={(e) => onFilterChange("maxPrice", e.target.value ? parseInt(e.target.value) : null)}
            />
          </div>

          {/* Mileage Range */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-1">
              <Gauge className="w-3 h-3" /> Mileage Min
            </Label>
            <Input
              type="number"
              placeholder="Min"
              value={filters.minMileage || ""}
              onChange={(e) => onFilterChange("minMileage", e.target.value ? parseInt(e.target.value) : null)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-1">
              <Gauge className="w-3 h-3" /> Mileage Max
            </Label>
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxMileage || ""}
              onChange={(e) => onFilterChange("maxMileage", e.target.value ? parseInt(e.target.value) : null)}
            />
          </div>

          {/* Fuel Type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-1">
              <Fuel className="w-3 h-3" /> Fuel Type
            </Label>
            <Select
              value={filters.fuel || ""}
              onValueChange={(value) => onFilterChange("fuel", value || null)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                {fuelTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Transmission */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-1">
              <Settings className="w-3 h-3" /> Transmission
            </Label>
            <Select
              value={filters.transmission || ""}
              onValueChange={(value) => onFilterChange("transmission", value || null)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                {transmissionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div className="space-y-2 sm:col-span-2">
            <Label className="text-sm font-medium flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Location
            </Label>
            <Input
              placeholder="City or State"
              value={filters.location || ""}
              onChange={(e) => onFilterChange("location", e.target.value || null)}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <Button
          onClick={onSearch}
          disabled={loadingResults}
          className="flex-1 gap-2"
        >
          {loadingResults ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              Search
            </>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={onReset}
          className="gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>
    </div>
  );
}
