import { useState } from 'react';
import FlightTicketCard from './FlightTicketCard';
import FlightDetailsModal from './FlightDetailsModal';
import { getAirlineLogo } from '@/data/airlines';
import type { GeneratedFlight } from '@/data/flightGenerator';

interface FlightCardWithModalProps {
  flight: GeneratedFlight;
  onSelect: (flight: GeneratedFlight) => void;
  isSelected?: boolean;
  index?: number;
}

export default function FlightCardWithModal({
  flight,
  onSelect,
  isSelected = false,
  index = 0,
}: FlightCardWithModalProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Ensure logo is set from CDN if not already provided
  const airlineLogo = flight.logo || (flight.airlineCode ? getAirlineLogo(flight.airlineCode) : undefined);

  // Build affiliate URL for partner redirect
  const getAffiliateUrl = () => {
    if (flight.bookingLink) return flight.bookingLink;
    return `https://www.skyscanner.com/transport/flights/${flight.departure.code}/${flight.arrival.code}/`;
  };

  // Full flight object for modal with real data support
  const modalFlight: GeneratedFlight = {
    ...flight,
    logo: airlineLogo,
    aircraft: flight.aircraft || 'Boeing 787-9',
    onTimePerformance: flight.onTimePerformance || 85,
    carbonOffset: flight.carbonOffset || 180,
    bookingLink: getAffiliateUrl(),
  };

  const handleSelectClick = () => {
    // Open details modal first for more info
    setShowDetails(true);
  };

  return (
    <>
      <FlightTicketCard
        flight={{
          ...flight,
          id: String(flight.id),
          logo: airlineLogo,
          isLowest: index === 0,
          isFastest: flight.stops === 0 && parseFloat(flight.duration) < 5.5,
          co2: flight.carbonOffset ? `${flight.carbonOffset}kg` : `${120 + index * 15}kg`,
          isRealPrice: flight.isRealPrice || !!flight.bookingLink,
          bookingLink: getAffiliateUrl(),
        }}
        onSelect={handleSelectClick}
        isSelected={isSelected}
      />

      <FlightDetailsModal
        open={showDetails}
        onOpenChange={setShowDetails}
        flight={modalFlight}
        onSelectFlight={() => {
          setShowDetails(false);
          onSelect(flight);
        }}
      />
    </>
  );
}
