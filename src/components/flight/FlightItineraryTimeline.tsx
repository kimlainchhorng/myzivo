/**
 * Flight Itinerary Timeline
 * Mobile-friendly timeline layout for flight segments
 */

import { Plane, Clock, MapPin, Calendar, Briefcase, Package, Luggage } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getAirlineLogo } from "@/data/airlines";
import { format, parseISO } from "date-fns";

interface FlightSegment {
  airline: string;
  airlineCode: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  departureCode: string;
  departureCity: string;
  arrivalCode: string;
  arrivalCity: string;
  duration: string;
  aircraft?: string;
}

interface LayoverInfo {
  airport: string;
  city: string;
  duration: string;
}

interface FlightItineraryTimelineProps {
  segments: FlightSegment[];
  layovers?: LayoverInfo[];
  departDate?: string;
  returnDate?: string;
  isReturn?: boolean;
  className?: string;
}

export default function FlightItineraryTimeline({
  segments,
  layovers = [],
  departDate,
  returnDate,
  isReturn = false,
  className,
}: FlightItineraryTimelineProps) {
  if (!segments || segments.length === 0) {
    return null;
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      return format(parseISO(dateStr), "EEEE, MMMM d, yyyy");
    } catch {
      return dateStr;
    }
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Plane className={cn("w-5 h-5 text-sky-500", isReturn && "rotate-180")} />
            {isReturn ? "Return Flight" : "Outbound Flight"}
          </CardTitle>
          {(departDate || returnDate) && (
            <Badge variant="outline" className="gap-1.5">
              <Calendar className="w-3 h-3" />
              {formatDate(isReturn ? returnDate : departDate)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {segments.map((segment, index) => (
          <div key={index}>
            {/* Segment */}
            <div className="p-4 sm:p-6">
              {/* Airline Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-muted/50 border border-border/50 flex items-center justify-center overflow-hidden">
                  <img
                    src={getAirlineLogo(segment.airlineCode)}
                    alt={segment.airline}
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${segment.airlineCode}&background=0ea5e9&color=fff&size=32`;
                    }}
                  />
                </div>
                <div>
                  <p className="font-semibold">{segment.airline}</p>
                  <p className="text-sm text-muted-foreground">{segment.flightNumber}</p>
                </div>
                <Badge variant="outline" className="ml-auto gap-1 text-xs">
                  <Clock className="w-3 h-3" />
                  {segment.duration}
                </Badge>
              </div>

              {/* Timeline Layout */}
              <div className="relative pl-8">
                {/* Timeline Line */}
                <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gradient-to-b from-sky-500 via-sky-500/50 to-sky-500" />
                
                {/* Departure */}
                <div className="relative mb-8">
                  <div className="absolute -left-5 top-1 w-4 h-4 rounded-full bg-sky-500 border-4 border-background shadow-sm" />
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                    <p className="text-2xl font-bold">{segment.departureTime}</p>
                    <div>
                      <p className="font-semibold text-sky-500">{segment.departureCode}</p>
                      <p className="text-sm text-muted-foreground">{segment.departureCity}</p>
                    </div>
                  </div>
                </div>

                {/* Arrival */}
                <div className="relative">
                  <div className="absolute -left-5 top-1 w-4 h-4 rounded-full bg-sky-500 border-4 border-background shadow-sm" />
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                    <p className="text-2xl font-bold">{segment.arrivalTime}</p>
                    <div>
                      <p className="font-semibold text-sky-500">{segment.arrivalCode}</p>
                      <p className="text-sm text-muted-foreground">{segment.arrivalCity}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Aircraft Info */}
              {segment.aircraft && (
                <p className="text-xs text-muted-foreground mt-4 pl-8">
                  Aircraft: {segment.aircraft}
                </p>
              )}
            </div>

            {/* Layover between segments */}
            {layovers[index] && index < segments.length - 1 && (
              <div className="px-4 py-3 bg-amber-500/10 border-y border-amber-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-amber-600">
                      {layovers[index].duration} layover in {layovers[index].city}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {layovers[index].airport}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
