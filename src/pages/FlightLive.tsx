/**
 * Flight Live Results Page
 * 
 * Embeds the partner white-label search in an iframe.
 * URL params: origin, dest, depart, return (optional), passengers, cabin
 */

import { useSearchParams } from "react-router-dom";
import { format, parse } from "date-fns";
import { AlertCircle, ExternalLink, ShieldCheck } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";

// Public config (safe to expose)
const WL_BASE_URL = "https://search.jetradar.com/flights";
const MARKER = "700031";

const cabinMap: Record<string, string> = {
  economy: "Y",
  premium: "W",
  business: "C",
  first: "F",
};

function buildWhitelabelUrl(params: URLSearchParams): string {
  const origin = (params.get("origin") || "").toUpperCase();
  const dest = (params.get("dest") || "").toUpperCase();
  const depart = params.get("depart") || "";
  const returnDate = params.get("return") || "";
  const passengers = params.get("passengers") || "1";
  const cabin = params.get("cabin") || "economy";

  const urlParams = new URLSearchParams({
    origin_iata: origin,
    destination_iata: dest,
    depart_date: depart,
    adults: passengers,
    trip_class: cabinMap[cabin] || "Y",
    marker: MARKER,
    with_request: "true",
  });

  if (returnDate) {
    urlParams.set("return_date", returnDate);
  }

  return `${WL_BASE_URL}?${urlParams.toString()}`;
}

export default function FlightLive() {
  const [searchParams] = useSearchParams();

  const origin = searchParams.get("origin") || "";
  const dest = searchParams.get("dest") || "";
  const depart = searchParams.get("depart") || "";

  // Validate required params
  const isValid = origin.length === 3 && dest.length === 3 && depart;

  const whitelabelUrl = isValid ? buildWhitelabelUrl(searchParams) : "";

  // Debug log
  console.log("[FlightLive] Params:", Object.fromEntries(searchParams));
  console.log("[FlightLive] Built URL:", whitelabelUrl);

  if (!isValid) {
    return (
      <div className="min-h-screen bg-background">
        <SEOHead title="Live Flight Search | ZIVO" description="Search and compare live flight prices" />
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Invalid Search Parameters</h1>
          <p className="text-muted-foreground mb-6">
            Missing origin, destination, or departure date.
          </p>
          <Button asChild>
            <a href="/flights">Back to Flight Search</a>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title={`${origin} to ${dest} Flights | ZIVO`}
        description={`Compare live flight prices from ${origin} to ${dest}`}
      />
      <Header />

      {/* Notice Banner */}
      <div className="bg-sky-500/10 border-b border-sky-500/30 py-3">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-sm text-foreground flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>
              <strong>Live prices & booking on partner site.</strong> Final price
              confirmed at checkout.
            </span>
          </p>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => window.open(whitelabelUrl, "_blank", "noopener,noreferrer")}
          >
            <ExternalLink className="w-4 h-4" />
            Open in New Tab
          </Button>
        </div>
      </div>

      {/* Debug Link */}
      <div className="container mx-auto px-4 py-2 text-xs text-muted-foreground">
        Debug: <a href={whitelabelUrl} target="_blank" rel="noopener noreferrer" className="underline text-sky-500 break-all">{whitelabelUrl}</a>
      </div>

      {/* Iframe Container */}
      <main className="flex-1 relative">
        <iframe
          src={whitelabelUrl}
          title="Live Flight Results"
          className="w-full h-full min-h-[600px] border-0"
          style={{ minHeight: "calc(100vh - 200px)" }}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
        />
      </main>

      <Footer />
    </div>
  );
}
