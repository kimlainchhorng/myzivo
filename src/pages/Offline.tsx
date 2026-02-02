/**
 * Offline Fallback Page
 * Shown when PWA is offline and page is not cached
 */
import { WifiOff, RefreshCw, Home, Plane, Hotel, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Offline = () => {
  const navigate = useNavigate();

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      {/* Offline Icon */}
      <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center mb-6">
        <WifiOff className="w-12 h-12 text-muted-foreground" />
      </div>

      {/* Message */}
      <h1 className="text-2xl font-bold mb-2">You're Offline</h1>
      <p className="text-muted-foreground mb-8 max-w-sm">
        It looks like you've lost your internet connection. Some features may not be available.
      </p>

      {/* Retry Button */}
      <Button onClick={handleRetry} className="gap-2 rounded-xl mb-6">
        <RefreshCw className="w-4 h-4" />
        Try Again
      </Button>

      {/* Cached Pages Hint */}
      <div className="bg-muted/30 rounded-2xl p-6 max-w-sm">
        <p className="text-sm font-medium mb-4">Previously visited pages may still be available:</p>
        <div className="flex justify-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="flex-col h-auto py-3 px-4 rounded-xl"
            onClick={() => navigate("/")}
          >
            <Home className="w-5 h-5 mb-1" />
            <span className="text-xs">Home</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-col h-auto py-3 px-4 rounded-xl"
            onClick={() => navigate("/flights")}
          >
            <Plane className="w-5 h-5 mb-1 text-flights" />
            <span className="text-xs">Flights</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-col h-auto py-3 px-4 rounded-xl"
            onClick={() => navigate("/hotels")}
          >
            <Hotel className="w-5 h-5 mb-1 text-hotels" />
            <span className="text-xs">Hotels</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-col h-auto py-3 px-4 rounded-xl"
            onClick={() => navigate("/cars")}
          >
            <Car className="w-5 h-5 mb-1 text-cars" />
            <span className="text-xs">Cars</span>
          </Button>
        </div>
      </div>

      {/* Disclosure */}
      <p className="text-xs text-muted-foreground mt-8 max-w-sm">
        Hizovo is not the merchant of record. Travel bookings are fulfilled by licensed third-party providers.
      </p>
    </div>
  );
};

export default Offline;
