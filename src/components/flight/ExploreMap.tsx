import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Map,
  Search,
  Plane,
  Globe,
  DollarSign,
  Filter,
  ZoomIn,
  ZoomOut,
  Locate,
  ChevronRight,
  MapPin,
  TrendingDown
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Destination {
  id: string;
  city: string;
  country: string;
  code: string;
  lat: number;
  lng: number;
  price: number;
  priceChange: number;
  continent: string;
  popular?: boolean;
}

const DESTINATIONS: Destination[] = [
  { id: '1', city: 'London', country: 'UK', code: 'LHR', lat: 51.5, lng: -0.1, price: 450, priceChange: -12, continent: 'Europe', popular: true },
  { id: '2', city: 'Paris', country: 'France', code: 'CDG', lat: 48.9, lng: 2.4, price: 380, priceChange: 5, continent: 'Europe', popular: true },
  { id: '3', city: 'Tokyo', country: 'Japan', code: 'HND', lat: 35.7, lng: 139.8, price: 890, priceChange: -25, continent: 'Asia', popular: true },
  { id: '4', city: 'Dubai', country: 'UAE', code: 'DXB', lat: 25.3, lng: 55.3, price: 650, priceChange: 8, continent: 'Middle East' },
  { id: '5', city: 'Sydney', country: 'Australia', code: 'SYD', lat: -33.9, lng: 151.2, price: 1200, priceChange: -45, continent: 'Oceania' },
  { id: '6', city: 'New York', country: 'USA', code: 'JFK', lat: 40.6, lng: -73.8, price: 180, priceChange: 0, continent: 'North America' },
  { id: '7', city: 'Singapore', country: 'Singapore', code: 'SIN', lat: 1.4, lng: 103.9, price: 950, priceChange: -18, continent: 'Asia' },
  { id: '8', city: 'Barcelona', country: 'Spain', code: 'BCN', lat: 41.3, lng: 2.1, price: 420, priceChange: -8, continent: 'Europe' },
  { id: '9', city: 'Bangkok', country: 'Thailand', code: 'BKK', lat: 13.7, lng: 100.8, price: 780, priceChange: -30, continent: 'Asia' },
  { id: '10', city: 'Cape Town', country: 'South Africa', code: 'CPT', lat: -33.9, lng: 18.4, price: 890, priceChange: 15, continent: 'Africa' },
  { id: '11', city: 'Rio de Janeiro', country: 'Brazil', code: 'GIG', lat: -22.9, lng: -43.2, price: 720, priceChange: -22, continent: 'South America' },
  { id: '12', city: 'Rome', country: 'Italy', code: 'FCO', lat: 41.8, lng: 12.3, price: 410, priceChange: 3, continent: 'Europe' },
];

const CONTINENTS = ['All', 'Europe', 'Asia', 'North America', 'South America', 'Africa', 'Oceania', 'Middle East'];

interface ExploreMapProps {
  className?: string;
  origin?: string;
}

export const ExploreMap = ({ className, origin = "JFK" }: ExploreMapProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContinent, setSelectedContinent] = useState('All');
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [priceFilter, setPriceFilter] = useState<'all' | 'under500' | 'under1000'>('all');
  const [zoom, setZoom] = useState(1);

  const filteredDestinations = useMemo(() => {
    return DESTINATIONS.filter(dest => {
      const matchesSearch = dest.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           dest.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           dest.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesContinent = selectedContinent === 'All' || dest.continent === selectedContinent;
      const matchesPrice = priceFilter === 'all' || 
                          (priceFilter === 'under500' && dest.price < 500) ||
                          (priceFilter === 'under1000' && dest.price < 1000);
      return matchesSearch && matchesContinent && matchesPrice;
    });
  }, [searchQuery, selectedContinent, priceFilter]);

  // Convert lat/lng to SVG coordinates
  const toSvgCoords = (lat: number, lng: number) => {
    const x = ((lng + 180) / 360) * 800;
    const y = ((90 - lat) / 180) * 400;
    return { x, y };
  };

  const getPriceColor = (price: number) => {
    if (price < 400) return 'fill-emerald-500';
    if (price < 700) return 'fill-amber-500';
    return 'fill-rose-500';
  };

  return (
    <Card className={cn("overflow-hidden border-border/50 bg-card/50 backdrop-blur", className)}>
      <CardHeader className="pb-4 border-b border-border/50">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/40 flex items-center justify-center">
              <Globe className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-xl">Explore Destinations</CardTitle>
              <p className="text-sm text-muted-foreground">
                Discover flights from {origin} worldwide
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setZoom(Math.min(zoom + 0.25, 2))}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setZoom(Math.max(zoom - 0.25, 0.5))}>
              <ZoomOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Filters */}
        <div className="p-4 border-b border-border/50 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search cities, countries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {CONTINENTS.map(continent => (
              <button
                key={continent}
                onClick={() => setSelectedContinent(continent)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-all",
                  selectedContinent === continent
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                )}
              >
                {continent}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <Badge
              variant={priceFilter === 'all' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setPriceFilter('all')}
            >
              All Prices
            </Badge>
            <Badge
              variant={priceFilter === 'under500' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setPriceFilter('under500')}
            >
              Under $500
            </Badge>
            <Badge
              variant={priceFilter === 'under1000' ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setPriceFilter('under1000')}
            >
              Under $1000
            </Badge>
          </div>
        </div>

        {/* Map View */}
        <div className="relative overflow-hidden bg-gradient-to-b from-sky-950/50 to-slate-900/50" style={{ height: '350px' }}>
          <svg
            viewBox="0 0 800 400"
            className="w-full h-full"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
          >
            {/* World outline - simplified */}
            <path
              d="M100,150 Q200,100 300,120 T500,100 T700,150 L700,300 Q500,350 300,320 T100,300 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-border/30"
            />
            
            {/* Grid lines */}
            {[...Array(8)].map((_, i) => (
              <line
                key={`h-${i}`}
                x1="0"
                y1={i * 50}
                x2="800"
                y2={i * 50}
                stroke="currentColor"
                strokeWidth="0.3"
                className="text-border/20"
              />
            ))}
            {[...Array(16)].map((_, i) => (
              <line
                key={`v-${i}`}
                x1={i * 50}
                y1="0"
                x2={i * 50}
                y2="400"
                stroke="currentColor"
                strokeWidth="0.3"
                className="text-border/20"
              />
            ))}

            {/* Destination markers */}
            {filteredDestinations.map((dest, i) => {
              const { x, y } = toSvgCoords(dest.lat, dest.lng);
              const isSelected = selectedDestination?.id === dest.id;
              
              return (
                <g key={dest.id}>
                  {/* Pulse animation for popular */}
                  {dest.popular && (
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? 20 : 12}
                      className="fill-primary/20 animate-ping"
                      style={{ animationDuration: '2s' }}
                    />
                  )}
                  
                  {/* Price circle */}
                  <motion.circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 15 : 10}
                    className={cn(
                      getPriceColor(dest.price),
                      "cursor-pointer transition-all",
                      isSelected && "stroke-white stroke-2"
                    )}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedDestination(dest)}
                  />
                  
                  {/* Price label */}
                  <text
                    x={x}
                    y={y - 18}
                    textAnchor="middle"
                    className="fill-foreground text-[10px] font-bold"
                  >
                    ${dest.price}
                  </text>
                  
                  {/* City code */}
                  {(isSelected || zoom > 1.25) && (
                    <text
                      x={x}
                      y={y + 25}
                      textAnchor="middle"
                      className="fill-muted-foreground text-[8px]"
                    >
                      {dest.code}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 p-2 rounded-lg bg-card/80 backdrop-blur border border-border/50 text-xs">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                &lt;$400
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                $400-700
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                &gt;$700
              </span>
            </div>
          </div>
        </div>

        {/* Selected Destination Panel */}
        {selectedDestination && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 border-t border-border/50 bg-muted/20"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
                  <MapPin className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedDestination.city}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedDestination.country} • {selectedDestination.code}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">${selectedDestination.price}</span>
                  {selectedDestination.priceChange !== 0 && (
                    <Badge className={cn(
                      selectedDestination.priceChange < 0 
                        ? "bg-emerald-500/20 text-emerald-400" 
                        : "bg-rose-500/20 text-rose-400"
                    )}>
                      {selectedDestination.priceChange < 0 ? '↓' : '↑'} 
                      ${Math.abs(selectedDestination.priceChange)}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Round trip from {origin}</p>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button className="flex-1">
                <Plane className="w-4 h-4 mr-2" />
                Search Flights
              </Button>
              <Button variant="outline">
                <TrendingDown className="w-4 h-4 mr-2" />
                Set Alert
              </Button>
            </div>
          </motion.div>
        )}

        {/* Destinations Grid */}
        <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          {filteredDestinations.slice(0, 8).map((dest, i) => (
            <motion.button
              key={dest.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedDestination(dest)}
              className={cn(
                "p-3 rounded-xl border text-left transition-all hover:border-primary/50",
                selectedDestination?.id === dest.id
                  ? "border-primary bg-primary/10"
                  : "border-border/50 bg-muted/30"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm">{dest.city}</span>
                {dest.popular && <Badge className="text-[10px] px-1 py-0">Hot</Badge>}
              </div>
              <p className="text-xs text-muted-foreground">{dest.country}</p>
              <p className="text-lg font-bold mt-1">${dest.price}</p>
            </motion.button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExploreMap;
