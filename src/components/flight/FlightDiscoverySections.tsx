import { toast } from "sonner";
import { format } from "date-fns";
import { Globe, Zap, Plane } from "lucide-react";
import PopularRoutes from "./PopularRoutes";
import FlexibleDatesCalendar from "./FlexibleDatesCalendar";
import AITripSuggestions from "./AITripSuggestions";
import DealFinder from "./DealFinder";
import ExploreMap from "./ExploreMap";
import CalendarHeatmap from "./CalendarHeatmap";
import NearbyAirports from "./NearbyAirports";
import PricePrediction from "./PricePrediction";
import PriceLock from "./PriceLock";

import ZivoMilesProgram from "./ZivoMilesProgram";
import TravelAlerts from "./TravelAlerts";
import MultiCityPlanner from "./MultiCityPlanner";
import CorporateTravel from "./CorporateTravel";
import GroupBooking from "./GroupBooking";



import AirlinePartnersHub from "./AirlinePartnersHub";

import ItineraryBuilder from "./ItineraryBuilder";
import TravelDocuments from "./TravelDocuments";
import FlightPriceAlert from "./FlightPriceAlert";
import PriceAlertsDashboard from "./PriceAlertsDashboard";
import AirportGuide from "./AirportGuide";
import FlightTracker from "./FlightTracker";
import TravelPackages from "./TravelPackages";
import TripSharing from "./TripSharing";
import AirlineLogosCarousel from "./AirlineLogosCarousel";
import MyTripsDashboard from "./MyTripsDashboard";
import CodeshareFlights from "./CodeshareFlights";
import TravelCompanionFinder from "./TravelCompanionFinder";
import GroundTransportBooking from "./GroundTransportBooking";
import FlightBookings from "./FlightBookings";
import { airports } from "@/data/airports";

interface FlightDiscoverySectionsProps {
  fromCity: string;
  toCity: string;
  fromCode: string;
  toCode: string;
  departDate?: Date;
  returnDate?: Date;
  passengers: string;
  setFromCity: (city: string) => void;
  setToCity: (city: string) => void;
  setDepartDate: (date: Date | undefined) => void;
  setPassengers: (pax: string) => void;
  setSelectedLoyaltyProgram: (id: string | null) => void;
}

export default function FlightDiscoverySections({
  fromCity,
  toCity,
  fromCode,
  toCode,
  departDate,
  returnDate,
  passengers,
  setFromCity,
  setToCity,
  setDepartDate,
  setPassengers,
  setSelectedLoyaltyProgram,
}: FlightDiscoverySectionsProps) {
  return (
    <>
      {/* My Bookings Dashboard */}
      <section className="py-12 border-t border-border/50">
        <div className="container mx-auto px-4">
          <FlightBookings />
        </div>
      </section>

      {/* My Trips Dashboard */}
      <section className="py-12 border-t border-border/50">
        <div className="container mx-auto px-4">
          <MyTripsDashboard className="max-w-5xl mx-auto" />
        </div>
      </section>

      {/* Codeshare Flights */}
      {toCity && (
        <section className="py-12 border-t border-border/50">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
              <Plane className="w-6 h-6 text-sky-500" />
              Codeshare Partners
            </h2>
            <CodeshareFlights
              codeshares={[
                {
                  operatingCarrier: { code: "UA", name: "United Airlines", flightNumber: "UA1234" },
                  marketingCarriers: [
                    { code: "LH", name: "Lufthansa", flightNumber: "LH7890", alliance: "Star Alliance" },
                    { code: "SQ", name: "Singapore Airlines", flightNumber: "SQ5678", alliance: "Star Alliance" },
                  ],
                },
              ]}
              showDetails
            />
          </div>
        </section>
      )}

      {/* Travel Companion Finder */}
      {toCity && (
        <section className="py-12 border-t border-border/50">
          <div className="container mx-auto px-4 max-w-4xl">
            <TravelCompanionFinder
              flightNumber="ZV-1234"
              currentSeat="15A"
              departureDate={departDate || new Date()}
              route={{ from: fromCode, to: toCode }}
              onConnectionMade={(id, type) => toast.success(`Connected with traveler for ${type}!`)}
            />
          </div>
        </section>
      )}

      {/* Ground Transport Booking */}
      {toCity && (
        <section className="py-12 border-t border-border/50">
          <div className="container mx-auto px-4 max-w-4xl">
            <GroundTransportBooking
              arrivalAirport={toCode}
              arrivalTime={departDate || new Date()}
              destination={toCity.split(" (")[0]}
              onTransportBooked={(id, details) => toast.success(`Transport booked: ${details.pickup} → ${details.dropoff}`)}
            />
          </div>
        </section>
      )}

      {/* Popular Routes with Live Pricing */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <PopularRoutes
            onSelectRoute={(from, to, price) => {
              const fromAirport = airports.find((a) => a.code === from);
              const toAirport = airports.find((a) => a.code === to);
              setFromCity(
                fromAirport ? `${fromAirport.city} (${fromAirport.code})` : `${from}`
              );
              setToCity(
                toAirport ? `${toAirport.city} (${toAirport.code})` : `${to}`
              );
              if (price) {
                toast.success(`Selected route with live price: $${price}`);
              }
            }}
          />
        </div>
      </section>

      {/* Flexible Dates Calendar */}
      {fromCity && toCity && (
        <section className="py-12 border-t border-border/50">
          <div className="container mx-auto px-4">
            <FlexibleDatesCalendar
              origin={fromCode}
              destination={toCode}
              basePrice={299}
              onSelectDate={(date, price) => {
                setDepartDate(date);
                toast.success(`Selected ${format(date, "MMM d")} - $${price} fare`);
              }}
              className="max-w-3xl mx-auto"
            />
          </div>
        </section>
      )}

      {/* AI Trip Suggestions */}
      <section className="py-12 border-t border-border/50">
        <div className="container mx-auto px-4">
          <AITripSuggestions
            origin={fromCity.split(" (")[0] || "New York"}
            onSelectDestination={(airportCode, city) => {
              const airport = airports.find((a) => a.code === airportCode);
              if (airport) {
                setToCity(`${airport.city} (${airport.code})`);
                toast.success(`Selected ${city} as your destination`);
              } else {
                setToCity(`${city} (${airportCode})`);
              }
            }}
            className="max-w-4xl mx-auto"
          />
        </div>
      </section>

      {/* Deal Finder Section */}
      <section className="py-12 border-t border-border/50">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-500" />
            Flash Deals & Exclusive Offers
          </h2>
          <DealFinder className="max-w-4xl mx-auto" />
        </div>
      </section>

      {/* Explore Map Section */}
      <section className="py-12 border-t border-border/50">
        <div className="container mx-auto px-4">
          <ExploreMap origin={fromCode} className="max-w-5xl mx-auto" />
        </div>
      </section>

      {/* Calendar Heatmap */}
      {toCity && (
        <section className="py-12 border-t border-border/50">
          <div className="container mx-auto px-4">
            <CalendarHeatmap
              origin={fromCode}
              destination={toCode}
              onMonthSelect={(month, year) => {
                toast.success(`Viewing prices for ${month} ${year}`);
              }}
              className="max-w-3xl mx-auto"
            />
          </div>
        </section>
      )}

      {/* Nearby Airports Comparison */}
      {toCity && (
        <section className="py-12 border-t border-border/50">
          <div className="container mx-auto px-4">
            <NearbyAirports
              mainAirport={toCode}
              destination={toCode}
              mainPrice={299}
              className="max-w-4xl mx-auto"
            />
          </div>
        </section>
      )}

      {/* Price Prediction & Lock */}
      {toCity && (
        <section className="py-12 border-t border-border/50">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
              <PricePrediction
                route={{
                  origin: fromCity.split(" (")[0] || "Los Angeles",
                  originCode: fromCode,
                  destination: toCity.split(" (")[0] || "New York",
                  destCode: toCode,
                }}
                departureDate={departDate}
                currentPrice={299}
              />
              <PriceLock flightPrice={299} route={{ from: fromCode, to: toCode }} />
            </div>
          </div>
        </section>
      )}


      {/* ZIVO Miles Program */}
      <section className="py-12 border-t border-border/50">
        <div className="container mx-auto px-4">
          <ZivoMilesProgram className="max-w-4xl mx-auto" />
        </div>
      </section>

      {/* Travel Alerts */}
      <section className="py-12 border-t border-border/50">
        <div className="container mx-auto px-4">
          <TravelAlerts className="max-w-4xl mx-auto" />
        </div>
      </section>

      {/* Multi-City Planner */}
      <section className="py-12 border-t border-border/50">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
            <Globe className="w-6 h-6 text-sky-500" />
            Multi-City Trip Planner
          </h2>
          <div className="max-w-4xl mx-auto">
            <MultiCityPlanner
              onSearch={(legs, pax) => {
                if (legs.length > 0) {
                  const first = legs[0];
                  if (first.from && first.to) {
                    setFromCity(`${first.from.city} (${first.from.code})`);
                    setToCity(`${first.to.city} (${first.to.code})`);
                    toast.success(
                      `Planning ${legs.length}-city trip for ${pax} passengers`
                    );
                  }
                }
              }}
            />
          </div>
        </div>
      </section>

      {/* Corporate Travel */}
      <section className="py-12 border-t border-border/50">
        <div className="container mx-auto px-4">
          <CorporateTravel className="max-w-4xl mx-auto" />
        </div>
      </section>

      {/* Group Booking */}
      <section className="py-12 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <GroupBooking
              basePrice={299}
              onPassengersChange={(pax) => {
                setPassengers(String(pax.length));
              }}
              className="w-full"
            />
          </div>
        </div>
      </section>




      {/* Airline Partners Hub */}
      <section className="py-12 border-t border-border/50">
        <div className="container mx-auto px-4">
          <AirlinePartnersHub className="max-w-4xl mx-auto" />
        </div>
      </section>


      {/* Itinerary Builder */}
      {toCity && (
        <section className="py-12 border-t border-border/50">
          <div className="container mx-auto px-4">
            <ItineraryBuilder
              tripName={`${toCity.split(" (")[0]} Adventure`}
              startDate={departDate}
              className="max-w-4xl mx-auto"
            />
          </div>
        </section>
      )}

      {/* Travel Documents */}
      {toCity && (
        <section className="py-12 border-t border-border/50">
          <div className="container mx-auto px-4">
            <TravelDocuments className="max-w-4xl mx-auto" />
          </div>
        </section>
      )}

      {/* Flight Price Alert */}
      {toCity && (
        <section className="py-12 border-t border-border/50">
          <div className="container mx-auto px-4">
            <FlightPriceAlert
              route={{
                from: fromCity.split(" (")[0] || "Los Angeles",
                fromCode: fromCode,
                to: toCity.split(" (")[0] || "New York",
                toCode: toCode,
              }}
              currentPrice={299}
              historicalLow={249}
              departureDate={
                departDate ? format(departDate, "yyyy-MM-dd") : undefined
              }
              returnDate={returnDate ? format(returnDate, "yyyy-MM-dd") : undefined}
              className="max-w-2xl mx-auto"
            />
          </div>
        </section>
      )}

      {/* Price Alerts Dashboard */}
      {toCity && (
        <section className="py-12 border-t border-border/50">
          <div className="container mx-auto px-4">
            <PriceAlertsDashboard className="max-w-4xl mx-auto" />
          </div>
        </section>
      )}

      {/* Airport Guide */}
      {toCity && (
        <section className="py-12 border-t border-border/50">
          <div className="container mx-auto px-4">
            <AirportGuide airportCode={toCode} className="max-w-4xl mx-auto" />
          </div>
        </section>
      )}

      {/* Flight Tracker Demo */}
      {toCity && (
        <section className="py-12 border-t border-border/50">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
              <Plane className="w-6 h-6 text-sky-500" />
              Track Your Flight
            </h2>
            <FlightTracker
              flightNumber="ZV-1234"
              airline="ZIVO Airways"
              departure={{
                code: fromCode,
                city: fromCity.split(" (")[0] || "Los Angeles",
                time: "08:00",
                date: departDate || new Date(),
                terminal: "T4",
                gate: "B12",
              }}
              arrival={{
                code: toCode,
                city: toCity.split(" (")[0] || "New York",
                time: "16:30",
                date: departDate || new Date(),
              }}
              duration="5h 30m"
              aircraft="Boeing 787-9 Dreamliner"
            />
          </div>
        </section>
      )}

      {/* Travel Packages */}
      <section className="py-12 border-t border-border/50">
        <div className="container mx-auto px-4">
          <TravelPackages className="max-w-4xl mx-auto" />
        </div>
      </section>

      {/* Trip Sharing */}
      {toCity && (
        <section className="py-12 border-t border-border/50">
          <div className="container mx-auto px-4">
            <TripSharing
              tripId={`trip-${fromCode}-${toCode}`}
              tripName={`${fromCity.split(" (")[0]} to ${toCity.split(" (")[0]}`}
              className="max-w-2xl mx-auto"
            />
          </div>
        </section>
      )}

      {/* Airline Partners Carousel */}
      <section className="py-12 border-t border-border/50">
        <div className="container mx-auto px-4">
          <AirlineLogosCarousel />
        </div>
      </section>
    </>
  );
}
