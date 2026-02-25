/**
 * Pricing Debug Panel
 * Shows simplified pricing breakdown for development/testing
 * 
 * Enable: ?debug=1 in URL OR localStorage.setItem('zivo_debug_pricing', 'true')
 * Disable: Remove ?debug=1 from URL OR localStorage.removeItem('zivo_debug_pricing')
 */
import type { RidePriceQuote } from "@/lib/pricing";

interface PricingDebugPanelProps {
  quote: RidePriceQuote | null;
  show: boolean;
}

export function PricingDebugPanel({ quote, show }: PricingDebugPanelProps) {
  if (!show || !quote) return null;

  return (
    <div className="fixed bottom-24 left-4 z-[100] bg-zinc-900/95 text-green-400 font-mono text-[10px] p-3 rounded-xl max-w-[200px] shadow-xl border border-green-500/30 backdrop-blur-sm">
      <div className="font-bold text-yellow-400 mb-2 flex items-center gap-1.5">
        <span>🔧</span>
        <span>Pricing Debug</span>
      </div>
      
      {/* Zone & Ride Type */}
      <div className="space-y-0.5 mb-2">
        {quote.zoneName && (
          <div className="flex justify-between">
            <span className="text-zinc-500">Zone:</span>
            <span className="text-purple-400 truncate max-w-[100px]">{quote.zoneName}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-zinc-500">Ride:</span>
          <span className="text-cyan-400">{quote.debug.rideType}</span>
        </div>
      </div>
      
      {/* Route Info */}
      <div className="border-t border-green-800/50 pt-2 space-y-0.5">
        <div className="flex justify-between">
          <span className="text-zinc-500">Miles:</span>
          <span>{quote.debug.distanceMiles.toFixed(1)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">Minutes:</span>
          <span>{quote.debug.durationMinutes}</span>
        </div>
      </div>
      
      {/* Fare Breakdown */}
      <div className="border-t border-green-800/50 pt-2 mt-2 space-y-0.5">
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
          <span className="text-zinc-500">Booking:</span>
          <span>${quote.bookingFee.toFixed(2)}</span>
        </div>
      </div>
      
      {/* Subtotal & Multiplier */}
      <div className="border-t border-green-800/50 pt-2 mt-2 space-y-0.5">
        <div className="flex justify-between">
          <span className="text-zinc-500">Subtotal:</span>
          <span>${quote.subtotal.toFixed(2)}</span>
        </div>
        {quote.minimumApplied && (
          <div className="text-yellow-400 text-[9px]">⚠ Min fare applied</div>
        )}
        <div className="flex justify-between">
          <span className="text-zinc-500">× Mult:</span>
          <span className={quote.multiplier !== 1.0 ? "text-orange-400" : ""}>
            {quote.multiplier.toFixed(2)}
          </span>
        </div>
      </div>
      
      {/* Final */}
      <div className="border-t border-green-800/50 pt-2 mt-2">
        <div className="flex justify-between font-bold text-white text-xs">
          <span>Final:</span>
          <span className="text-green-300">${quote.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

export default PricingDebugPanel;
