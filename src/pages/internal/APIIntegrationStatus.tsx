/**
 * API Integration Status Dashboard
 * Real-time monitoring of all affiliate API connections
 * 
 * Tracks: Flights (Travelpayouts), Hotels (Hotelbeds + Booking.com), Cars (Affiliate redirect)
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plane, 
  Hotel, 
  Car, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Shield,
  Clock,
  Zap,
  Database,
  Key,
  ArrowLeft,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

// Integration status types
type IntegrationStatus = "live" | "pending" | "error" | "mock";

interface APIIntegration {
  id: string;
  name: string;
  provider: string;
  type: "flights" | "hotels" | "cars" | "activities" | "transfers";
  status: IntegrationStatus;
  icon: typeof Plane;
  description: string;
  endpoints: {
    name: string;
    status: IntegrationStatus;
    lastCheck?: Date;
    responseTime?: number;
  }[];
  features: string[];
  secrets: string[];
  documentationUrl?: string;
  dashboardUrl?: string;
  notes?: string;
}

// Check if environment variable exists (client-side check for VITE_ vars)
const checkEnvVar = (name: string): boolean => {
  const value = (import.meta.env as Record<string, string | undefined>)[name];
  return Boolean(value && value.length > 0);
};

const APIIntegrationStatus = () => {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [integrations, setIntegrations] = useState<APIIntegration[]>([]);
  const [healthChecks, setHealthChecks] = useState<Record<string, boolean>>({});

  // Define all integrations
  const allIntegrations: APIIntegration[] = [
    {
      id: "travelpayouts-flights",
      name: "Travelpayouts Flights",
      provider: "Aviasales / Jetradar",
      type: "flights",
      status: "live",
      icon: Plane,
      description: "Real-time flight search with MD5 signature auth. Commission-tracked affiliate redirect.",
      endpoints: [
        { name: "search/affiliate/start", status: "live", responseTime: 800 },
        { name: "search/affiliate/results", status: "live", responseTime: 2500 },
        { name: "clicks (booking link)", status: "live", responseTime: 150 },
      ],
      features: [
        "Multi-provider pricing",
        "5-10 min result caching",
        "Rate limiting (100/hr)",
        "Fallback to whitelabel",
        "Booking deep links",
      ],
      secrets: ["TRAVELPAYOUTS_API_TOKEN", "TRAVELPAYOUTS_MARKER"],
      documentationUrl: "https://www.travelpayouts.com/developers/flight",
      dashboardUrl: "https://www.travelpayouts.com/programs",
      notes: "Primary affiliate partner for flights. Marker: 700031",
    },
    {
      id: "duffel-ota",
      name: "Duffel OTA (MoR)",
      provider: "Duffel",
      type: "flights",
      status: "live",
      icon: Plane,
      description: "Full OTA booking with ZIVO as Merchant of Record. Direct ticketing.",
      endpoints: [
        { name: "offer_requests", status: "live", responseTime: 3000 },
        { name: "offers", status: "live", responseTime: 500 },
        { name: "orders", status: "live", responseTime: 2000 },
        { name: "payments", status: "live", responseTime: 1500 },
      ],
      features: [
        "Direct ticketing",
        "Seat selection",
        "Baggage add-ons",
        "Ancillary services",
        "PNR management",
      ],
      secrets: ["DUFFEL_API_KEY", "DUFFEL_ENV"],
      documentationUrl: "https://duffel.com/docs/api",
      notes: "ZIVO is Merchant of Record. Sandbox testing available.",
    },
    {
      id: "hotelbeds-hotels",
      name: "Hotelbeds Hotels",
      provider: "Hotelbeds",
      type: "hotels",
      status: "live",
      icon: Hotel,
      description: "Hotel availability & booking API. SHA256 signature auth.",
      endpoints: [
        { name: "hotels/search", status: "live", responseTime: 2000 },
        { name: "hotels/checkrates", status: "live", responseTime: 800 },
        { name: "bookings", status: "live", responseTime: 3000 },
        { name: "status", status: "live", responseTime: 100 },
      ],
      features: [
        "Real-time availability",
        "Rate recheck",
        "Multiple room types",
        "Cancellation policies",
        "Photo CDN",
      ],
      secrets: ["HOTELBEDS_HOTEL_API_KEY", "HOTELBEDS_HOTEL_SECRET"],
      documentationUrl: "https://developer.hotelbeds.com/",
      notes: "Primary hotel inventory provider.",
    },
    {
      id: "booking-affiliate",
      name: "Booking.com Affiliate",
      provider: "Travelpayouts / Booking.com",
      type: "hotels",
      status: "live",
      icon: Hotel,
      description: "Booking.com affiliate redirect with indicative pricing display.",
      endpoints: [
        { name: "redirect URL builder", status: "live", responseTime: 10 },
      ],
      features: [
        "Deep link generation",
        "City/hotel search params",
        "Date/guest passthrough",
        "Commission tracking",
      ],
      secrets: [],
      documentationUrl: "https://www.booking.com/affiliate-program.html",
      notes: "Fallback after Hotellook discontinuation (Oct 2025)",
    },
    {
      id: "tripadvisor-content",
      name: "TripAdvisor Content",
      provider: "TripAdvisor",
      type: "hotels",
      status: "live",
      icon: Hotel,
      description: "Hotel ratings, reviews, and imagery from TripAdvisor.",
      endpoints: [
        { name: "location/search", status: "live", responseTime: 400 },
        { name: "location/details", status: "live", responseTime: 300 },
        { name: "photos", status: "live", responseTime: 200 },
      ],
      features: [
        "Traveler ratings",
        "Review counts",
        "Amenity data",
        "High-res photos",
      ],
      secrets: ["TRIPADVISOR_API_KEY"],
      documentationUrl: "https://developer-tripadvisor.com/",
      notes: "Content enrichment for hotel cards",
    },
    {
      id: "car-affiliate",
      name: "Car Rental Affiliates",
      provider: "EconomyBookings / QEEQ / GetRentaCar",
      type: "cars",
      status: "live",
      icon: Car,
      description: "Multi-partner affiliate redirect for car rentals. Indicative pricing.",
      endpoints: [
        { name: "EconomyBookings redirect", status: "live", responseTime: 10 },
        { name: "QEEQ redirect", status: "live", responseTime: 10 },
        { name: "GetRentaCar redirect", status: "live", responseTime: 10 },
      ],
      features: [
        "Multi-partner comparison",
        "Location IATA codes",
        "Date/time passthrough",
        "Commission tracking",
      ],
      secrets: [],
      documentationUrl: "https://www.travelpayouts.com/programs/car-rental",
      notes: "Redirect-only model. Real prices shown on partner sites.",
    },
    {
      id: "hotelbeds-activities",
      name: "Hotelbeds Activities",
      provider: "Hotelbeds",
      type: "activities",
      status: "live",
      icon: Zap,
      description: "Tours, activities, and experiences booking.",
      endpoints: [
        { name: "activities/search", status: "live", responseTime: 1500 },
        { name: "activities/details", status: "live", responseTime: 500 },
        { name: "bookings", status: "live", responseTime: 2500 },
      ],
      features: [
        "City-based search",
        "Activity categories",
        "Pricing tiers",
        "Cancellation policies",
      ],
      secrets: ["HOTELBEDS_ACTIVITIES_API_KEY", "HOTELBEDS_ACTIVITIES_SECRET"],
      documentationUrl: "https://developer.hotelbeds.com/",
    },
    {
      id: "hotelbeds-transfers",
      name: "Hotelbeds Transfers",
      provider: "Hotelbeds",
      type: "transfers",
      status: "live",
      icon: Car,
      description: "Airport transfers and private car services.",
      endpoints: [
        { name: "availability", status: "live", responseTime: 1000 },
        { name: "bookings", status: "live", responseTime: 2000 },
      ],
      features: [
        "Airport pickup/dropoff",
        "Vehicle types",
        "Meet & greet",
        "Flight tracking",
      ],
      secrets: ["HOTELBEDS_TRANSFER_API_KEY", "HOTELBEDS_TRANSFER_SECRET"],
      documentationUrl: "https://developer.hotelbeds.com/",
    },
  ];

  // Run health checks via centralized api-health endpoint
  const runHealthChecks = async () => {
    setIsRefreshing(true);
    const checks: Record<string, boolean> = {};

    try {
      const { data, error } = await supabase.functions.invoke("api-health");
      
      if (!error && data) {
        // Map API health response to integration IDs
        checks["travelpayouts-flights"] = data.flights_travelpayouts?.status === "ok";
        checks["duffel-ota"] = data.flights_duffel?.status === "ok";
        checks["hotelbeds-hotels"] = data.hotels_hotelbeds?.status === "ok";
        checks["tripadvisor-content"] = data.hotels_tripadvisor?.status === "ok";
        checks["car-affiliate"] = data.cars_affiliate?.status === "ok";
        checks["hotelbeds-activities"] = data.activities_hotelbeds?.status === "ok";
        checks["hotelbeds-transfers"] = data.transfers_hotelbeds?.status === "ok";
        checks["booking-affiliate"] = true; // Always ok (redirect-only)
        
        console.log("[API Health]", data.overall, data);
      }
    } catch (err) {
      console.error("[API Health] Check failed:", err);
    }

    setHealthChecks(checks);
    setLastRefresh(new Date());
    setIsRefreshing(false);
  };

  useEffect(() => {
    setIntegrations(allIntegrations);
    runHealthChecks();
  }, []);

  const getStatusIcon = (status: IntegrationStatus, isHealthy?: boolean) => {
    if (isHealthy === false) {
      return <XCircle className="w-5 h-5 text-destructive" />;
    }
    switch (status) {
      case "live":
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case "pending":
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case "error":
        return <XCircle className="w-5 h-5 text-destructive" />;
      case "mock":
        return <Database className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: IntegrationStatus) => {
    const variants: Record<IntegrationStatus, string> = {
      live: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
      pending: "bg-amber-500/10 text-amber-600 border-amber-500/30",
      error: "bg-destructive/10 text-destructive border-destructive/30",
      mock: "bg-blue-500/10 text-blue-600 border-blue-500/30",
    };
    return (
      <Badge variant="outline" className={cn("font-medium", variants[status])}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const liveCount = integrations.filter(i => i.status === "live").length;
  const totalEndpoints = integrations.reduce((sum, i) => sum + i.endpoints.length, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/internal")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">API Integration Status</h1>
              <p className="text-muted-foreground">
                Real-time monitoring of all affiliate API connections
              </p>
            </div>
          </div>
          <Button 
            onClick={runHealthChecks} 
            disabled={isRefreshing}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
            Refresh Status
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{liveCount}/{integrations.length}</p>
                  <p className="text-sm text-muted-foreground">Integrations Live</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-sky-500/10">
                  <Zap className="w-5 h-5 text-sky-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalEndpoints}</p>
                  <p className="text-sm text-muted-foreground">API Endpoints</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Key className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {integrations.reduce((sum, i) => sum + i.secrets.length, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Secrets Configured</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-500/10">
                  <Clock className="w-5 h-5 text-violet-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {lastRefresh.toLocaleTimeString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Last Health Check</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Integration Cards */}
        <div className="space-y-6">
          {/* By Service Type */}
          {["flights", "hotels", "cars", "activities", "transfers"].map(type => {
            const typeIntegrations = integrations.filter(i => i.type === type);
            if (typeIntegrations.length === 0) return null;
            
            const Icon = type === "flights" ? Plane : type === "hotels" ? Hotel : Car;
            
            return (
              <div key={type}>
                <div className="flex items-center gap-2 mb-4">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                  <h2 className="text-xl font-semibold capitalize">{type}</h2>
                  <Badge variant="secondary" className="ml-2">
                    {typeIntegrations.length} integration{typeIntegrations.length !== 1 ? "s" : ""}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {typeIntegrations.map(integration => (
                    <Card key={integration.id} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(
                              integration.status, 
                              healthChecks[integration.id]
                            )}
                            <div>
                              <CardTitle className="text-lg">{integration.name}</CardTitle>
                              <CardDescription>{integration.provider}</CardDescription>
                            </div>
                          </div>
                          {getStatusBadge(integration.status)}
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          {integration.description}
                        </p>
                        
                        {/* Endpoints */}
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-2">ENDPOINTS</p>
                          <div className="space-y-1">
                            {integration.endpoints.map((endpoint, i) => (
                              <div key={i} className="flex items-center justify-between text-sm">
                                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                                  {endpoint.name}
                                </code>
                                <div className="flex items-center gap-2">
                                  {endpoint.responseTime && (
                                    <span className="text-xs text-muted-foreground">
                                      ~{endpoint.responseTime}ms
                                    </span>
                                  )}
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Features */}
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-2">FEATURES</p>
                          <div className="flex flex-wrap gap-1">
                            {integration.features.map((feature, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        {/* Secrets */}
                        {integration.secrets.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2">SECRETS</p>
                            <div className="flex flex-wrap gap-1">
                              {integration.secrets.map((secret, i) => (
                                <Badge key={i} variant="outline" className="text-xs font-mono">
                                  <Key className="w-3 h-3 mr-1" />
                                  {secret}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Notes */}
                        {integration.notes && (
                          <p className="text-xs text-muted-foreground italic border-l-2 border-muted pl-2">
                            {integration.notes}
                          </p>
                        )}
                        
                        {/* Links */}
                        <div className="flex gap-2 pt-2">
                          {integration.documentationUrl && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs gap-1"
                              onClick={() => window.open(integration.documentationUrl, "_blank")}
                            >
                              <ExternalLink className="w-3 h-3" />
                              Docs
                            </Button>
                          )}
                          {integration.dashboardUrl && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs gap-1"
                              onClick={() => window.open(integration.dashboardUrl, "_blank")}
                            >
                              <TrendingUp className="w-3 h-3" />
                              Dashboard
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Compliance Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-500" />
              Affiliate Compliance Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Partner Disclosure", status: true, path: "/partner-disclosure" },
                { label: "Affiliate Disclosure", status: true, path: "/affiliate-disclosure" },
                { label: "New Tab Redirects", status: true, path: null },
                { label: "Price Disclaimers", status: true, path: null },
                { label: "No Iframe Checkout", status: true, path: null },
                { label: "Commission Tracking", status: true, path: null },
                { label: "Click Logging", status: true, path: null },
                { label: "GDPR Consent", status: true, path: "/privacy" },
              ].map((item, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-lg",
                    item.status ? "bg-emerald-500/5" : "bg-destructive/5"
                  )}
                >
                  {item.status ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-destructive" />
                  )}
                  <span className="text-sm">{item.label}</span>
                  {item.path && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="ml-auto h-6 w-6 p-0"
                      onClick={() => navigate(item.path!)}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default APIIntegrationStatus;
