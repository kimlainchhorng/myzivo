/**
 * Flight Live Results Page
 * 
 * Embeds the partner white-label search in an iframe.
 * Falls back to new tab if iframe is blocked.
 * URL params: origin, dest, depart, return (optional), passengers, cabin
 */

import { useSearchParams } from "react-router-dom";
import { AlertCircle, ExternalLink, ShieldCheck, Copy, Check, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";

// Read from env with fallbacks
const WL_BASE_URL = import.meta.env.VITE_AVIASALES_WL_BASE_URL || "https://search.jetradar.com/flights";
const MARKER = import.meta.env.VITE_TRAVELPAYOUTS_MARKER || "700031";

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
  const [copied, setCopied] = useState(false);
  const [iframeStatus, setIframeStatus] = useState<"loading" | "loaded" | "blocked">("loading");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const origin = searchParams.get("origin") || "";
  const dest = searchParams.get("dest") || "";
  const depart = searchParams.get("depart") || "";

  // Validate required params
  const isValid = origin.length === 3 && dest.length === 3 && depart;

  const whitelabelUrl = isValid ? buildWhitelabelUrl(searchParams) : "";

  // Debug log
  console.log("[FlightLive] ENV:", { WL_BASE_URL, MARKER });
  console.log("[FlightLive] Params:", Object.fromEntries(searchParams));
  console.log("[FlightLive] Built URL:", whitelabelUrl);

  // Fallback: if iframe doesn't load within 5s, assume blocked
  useEffect(() => {
    if (!isValid) return;
    
    const timeout = setTimeout(() => {
      if (iframeStatus === "loading") {
        console.log("[FlightLive] Iframe timeout - assuming blocked");
        setIframeStatus("blocked");
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [isValid, iframeStatus]);

  // Auto-open in new tab if blocked
  useEffect(() => {
    if (iframeStatus === "blocked" && whitelabelUrl) {
      console.log("[FlightLive] Opening in new tab as fallback");
      window.open(whitelabelUrl, "_blank", "noopener,noreferrer");
    }
  }, [iframeStatus, whitelabelUrl]);

  const handleIframeLoad = () => {
    console.log("[FlightLive] Iframe loaded successfully");
    setIframeStatus("loaded");
  };

  const handleIframeError = () => {
    console.log("[FlightLive] Iframe error - blocked");
    setIframeStatus("blocked");
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(whitelabelUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenNewTab = () => {
    window.open(whitelabelUrl, "_blank", "noopener,noreferrer");
  };

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
            onClick={handleOpenNewTab}
          >
            <ExternalLink className="w-4 h-4" />
            Open in New Tab
          </Button>
        </div>
      </div>

      {/* Debug Panel */}
      <div className="container mx-auto px-4 py-3 bg-muted/30 border-b">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Debug: White-label URL</p>
            <span className={`text-xs px-2 py-0.5 rounded ${
              iframeStatus === "loaded" ? "bg-emerald-500/20 text-emerald-500" :
              iframeStatus === "blocked" ? "bg-amber-500/20 text-amber-500" :
              "bg-sky-500/20 text-sky-500"
            }`}>
              {iframeStatus === "loaded" ? "✓ Loaded" :
               iframeStatus === "blocked" ? "⚠ Blocked" : "Loading..."}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-background p-2 rounded border overflow-x-auto whitespace-nowrap">
              {whitelabelUrl}
            </code>
            <Button variant="ghost" size="sm" onClick={handleCopyUrl} className="shrink-0">
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <a 
            href={whitelabelUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-xs text-sky-500 hover:underline inline-flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3" />
            Open live results directly
          </a>
        </div>
      </div>

      {/* Iframe Container or Blocked Message */}
      <main className="flex-1 relative">
        {iframeStatus === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-sky-500 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Loading live results...</p>
            </div>
          </div>
        )}

        {iframeStatus === "blocked" && (
          <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
            <div className="text-center max-w-md px-4">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Embedded View Unavailable</h2>
              <p className="text-muted-foreground mb-4">
                The partner site doesn't allow embedding. We've opened it in a new tab for you.
              </p>
              <Button onClick={handleOpenNewTab} className="gap-2">
                <ExternalLink className="w-4 h-4" />
                Open Live Results
              </Button>
            </div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={whitelabelUrl}
          title="Live Flight Results"
          className="w-full h-full min-h-[600px] border-0"
          style={{ minHeight: "calc(100vh - 280px)" }}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        />
      </main>

      <Footer />
    </div>
  );
}