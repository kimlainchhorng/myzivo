/**
 * Pricing Debug Panel
 * Shows detailed pricing breakdown for development/testing
 * 
 * Enable: localStorage.setItem('zivo_debug_pricing', 'true')
 * Disable: localStorage.removeItem('zivo_debug_pricing')
 */
import type { RidePriceQuote } from "@/lib/pricing";

interface PricingDebugPanelProps {
  quote: RidePriceQuote | null;
  show: boolean;
}

export function PricingDebugPanel({ quote, show }: PricingDebugPanelProps) {
  if (!show || !quote) return null;

  return (
    <div className="fixed bottom-24 left-4 z-[100] bg-zinc-900/95 text-green-400 font-mono text-[10px] p-3 rounded-lg max-w-[200px] shadow-xl border border-green-500/30 backdrop-blur-sm">
      <div className="font-bold text-yellow-400 mb-2 flex items-center gap-1.5">
        <span>🔧</span>
        <span>Pricing Debug</span>
      </div>
      
      {/* Route Info */}
      <div className="space-y-0.5 mb-2">
        <div className="flex justify-between">
          <span className="text-zinc-500">Miles:</span>
          <span>{quote.debug.distanceMiles}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">Minutes:</span>
          <span>{quote.debug.durationMinutes}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">Ride:</span>
          <span className="text-cyan-400">{quote.debug.rideType}</span>
        </div>
        {quote.city && (
          <div className="flex justify-between">
            <span className="text-zinc-500">City:</span>
            <span className="text-purple-400">{quote.city}</span>
          </div>
        )}
      </div>
      
      {/* Base Breakdown */}
      <div className="border-t border-green-800/50 pt-2 space-y-0.5">
        <div className="flex justify-between">
          <span className="text-zinc-500">Base:</span>
          <span>${quote.baseFare.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">Distance:</span>
          <span>${quote.distanceFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">Time:</span>
          <span>${quote.timeFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">Subtotal:</span>
          <span>${quote.subtotal.toFixed(2)}</span>
        </div>
      </div>
      
      {/* Multipliers */}
      <div className="border-t border-green-800/50 pt-2 mt-2 space-y-0.5">
        <div className="flex justify-between">
          <span className="text-zinc-500">× rideType:</span>
          <span className={quote.rideTypeMultiplier !== 1.0 ? "text-orange-400" : ""}>
            {quote.rideTypeMultiplier.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">× zone:</span>
          <span className={quote.zoneMultiplier !== 1.0 ? "text-orange-400" : ""}>
            {quote.zoneMultiplier.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">× surge:</span>
          <span className={quote.surgeMultiplier !== 1.0 ? "text-red-400" : ""}>
            {quote.surgeMultiplier.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">× longTrip:</span>
          <span className={quote.longTripMultiplier !== 1.0 ? "text-blue-400" : ""}>
            {quote.longTripMultiplier.toFixed(2)}
          </span>
        </div>
      </div>
      
      {/* Fees */}
      <div className="border-t border-green-800/50 pt-2 mt-2 space-y-0.5">
        <div className="flex justify-between">
          <span className="text-zinc-500">Booking fee:</span>
          <span>${quote.bookingFee.toFixed(2)}</span>
        </div>
        {quote.minimumApplied && (
          <div className="text-yellow-400 text-[9px]">⚠ Min fare applied</div>
        )}
      </div>
      
      {/* Total */}
      <div className="border-t border-green-800/50 pt-2 mt-2">
        <div className="flex justify-between font-bold text-white text-xs">
          <span>Final:</span>
          <span className="text-green-300">${quote.total.toFixed(2)}</span>
        </div>
        <div className="text-zinc-600 text-[8px] mt-1">
          Range: ${quote.estimatedMin}-${quote.estimatedMax}
        </div>
      </div>
    </div>
  );
}

export default PricingDebugPanel;
