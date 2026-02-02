/**
 * Car Search Page
 * Full-featured vehicle search with cascading filters
 */

import { useCarInventory } from "@/hooks/useCarInventory";
import { CarSearchFilters } from "@/components/car-search/CarSearchFilters";
import { CarSearchResults } from "@/components/car-search/CarSearchResults";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CarSearch = () => {
  const navigate = useNavigate();
  const {
    filters,
    updateFilter,
    resetFilters,
    makes,
    models,
    years,
    results,
    loadingMakes,
    loadingModels,
    loadingYears,
    loadingResults,
    searchVehicles,
    hasSearched,
  } = useCarInventory();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Car Search</h1>
            <p className="text-sm text-muted-foreground">
              Find your perfect vehicle
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Filters */}
        <CarSearchFilters
          filters={filters}
          makes={makes}
          models={models}
          years={years}
          loadingMakes={loadingMakes}
          loadingModels={loadingModels}
          loadingYears={loadingYears}
          loadingResults={loadingResults}
          onFilterChange={updateFilter}
          onSearch={searchVehicles}
          onReset={resetFilters}
        />

        {/* Results */}
        <CarSearchResults
          results={results}
          loading={loadingResults}
          hasSearched={hasSearched}
        />
      </main>
    </div>
  );
};

export default CarSearch;
