import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * API Health Check Endpoint
 * GET /api-health - Returns status of all travel API integrations
 * 
 * Required ENV vars:
 * - TRAVELPAYOUTS_API_TOKEN
 * - TRAVELPAYOUTS_MARKER  
 * - HOTELBEDS_HOTEL_API_KEY
 * - HOTELBEDS_HOTEL_SECRET
 * - DUFFEL_API_KEY
 */

interface HealthStatus {
  status: "ok" | "fail" | "degraded";
  lastChecked: string;
  responseTime?: number;
  error?: string;
}

interface HealthCheckResponse {
  overall: "healthy" | "degraded" | "unhealthy";
  flights_travelpayouts: HealthStatus;
  flights_duffel: HealthStatus;
  hotels_hotelbeds: HealthStatus;
  hotels_tripadvisor: HealthStatus;
  cars_affiliate: HealthStatus;
  activities_hotelbeds: HealthStatus;
  transfers_hotelbeds: HealthStatus;
  timestamp: string;
  secrets_configured: {
    travelpayouts: boolean;
    duffel: boolean;
    hotelbeds_hotels: boolean;
    hotelbeds_activities: boolean;
    hotelbeds_transfers: boolean;
    tripadvisor: boolean;
  };
}

// Generate Hotelbeds signature
async function generateHotelbedsSignature(apiKey: string, secret: string): Promise<string> {
  const timestamp = Math.floor(Date.now() / 1000);
  const data = `${apiKey}${secret}${timestamp}`;
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(data));
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

// Check Hotelbeds API status
async function checkHotelbeds(apiKey: string, secret: string): Promise<HealthStatus> {
  const start = Date.now();
  try {
    const signature = await generateHotelbedsSignature(apiKey, secret);
    const response = await fetch("https://api.hotelbeds.com/hotel-api/1.0/status", {
      method: "GET",
      headers: {
        "Api-key": apiKey,
        "X-Signature": signature,
        "Accept": "application/json",
      },
    });
    
    const responseTime = Date.now() - start;
    
    if (response.ok) {
      return { status: "ok", lastChecked: new Date().toISOString(), responseTime };
    } else {
      return { 
        status: "fail", 
        lastChecked: new Date().toISOString(), 
        responseTime,
        error: `HTTP ${response.status}` 
      };
    }
  } catch (error) {
    return { 
      status: "fail", 
      lastChecked: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

// Check Duffel API status
async function checkDuffel(apiKey: string): Promise<HealthStatus> {
  const start = Date.now();
  try {
    const response = await fetch("https://api.duffel.com/air/airports?limit=1", {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Accept": "application/json",
        "Duffel-Version": "v2",
      },
    });
    
    const responseTime = Date.now() - start;
    
    if (response.ok) {
      return { status: "ok", lastChecked: new Date().toISOString(), responseTime };
    } else {
      return { 
        status: "fail", 
        lastChecked: new Date().toISOString(), 
        responseTime,
        error: `HTTP ${response.status}` 
      };
    }
  } catch (error) {
    return { 
      status: "fail", 
      lastChecked: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

// Check TripAdvisor API status  
async function checkTripAdvisor(apiKey: string): Promise<HealthStatus> {
  const start = Date.now();
  try {
    const response = await fetch(
      `https://api.content.tripadvisor.com/api/v1/location/search?key=${apiKey}&searchQuery=test&language=en`,
      { headers: { "Accept": "application/json" } }
    );
    
    const responseTime = Date.now() - start;
    
    if (response.ok) {
      return { status: "ok", lastChecked: new Date().toISOString(), responseTime };
    } else {
      return { 
        status: "fail", 
        lastChecked: new Date().toISOString(), 
        responseTime,
        error: `HTTP ${response.status}` 
      };
    }
  } catch (error) {
    return { 
      status: "fail", 
      lastChecked: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get all API keys from environment
    const TRAVELPAYOUTS_TOKEN = Deno.env.get("TRAVELPAYOUTS_API_TOKEN");
    const TRAVELPAYOUTS_MARKER = Deno.env.get("TRAVELPAYOUTS_MARKER");
    const DUFFEL_API_KEY = Deno.env.get("DUFFEL_API_KEY");
    const HOTELBEDS_HOTEL_API_KEY = Deno.env.get("HOTELBEDS_HOTEL_API_KEY");
    const HOTELBEDS_HOTEL_SECRET = Deno.env.get("HOTELBEDS_HOTEL_SECRET");
    const HOTELBEDS_ACTIVITY_API_KEY = Deno.env.get("HOTELBEDS_ACTIVITY_API_KEY");
    const HOTELBEDS_ACTIVITY_SECRET = Deno.env.get("HOTELBEDS_ACTIVITY_SECRET");
    const HOTELBEDS_TRANSFER_API_KEY = Deno.env.get("HOTELBEDS_TRANSFER_API_KEY");
    const HOTELBEDS_TRANSFER_SECRET = Deno.env.get("HOTELBEDS_TRANSFER_SECRET");
    const TRIPADVISOR_API_KEY = Deno.env.get("TRIPADVISOR_API_KEY");

    // Check secrets configuration
    const secretsConfigured = {
      travelpayouts: Boolean(TRAVELPAYOUTS_TOKEN && TRAVELPAYOUTS_MARKER),
      duffel: Boolean(DUFFEL_API_KEY),
      hotelbeds_hotels: Boolean(HOTELBEDS_HOTEL_API_KEY && HOTELBEDS_HOTEL_SECRET),
      hotelbeds_activities: Boolean(HOTELBEDS_ACTIVITY_API_KEY && HOTELBEDS_ACTIVITY_SECRET),
      hotelbeds_transfers: Boolean(HOTELBEDS_TRANSFER_API_KEY && HOTELBEDS_TRANSFER_SECRET),
      tripadvisor: Boolean(TRIPADVISOR_API_KEY),
    };

    // Run health checks in parallel
    const [duffelStatus, hotelbedsStatus, tripadvisorStatus] = await Promise.all([
      DUFFEL_API_KEY ? checkDuffel(DUFFEL_API_KEY) : { status: "fail" as const, lastChecked: new Date().toISOString(), error: "API key not configured" },
      (HOTELBEDS_HOTEL_API_KEY && HOTELBEDS_HOTEL_SECRET) ? checkHotelbeds(HOTELBEDS_HOTEL_API_KEY, HOTELBEDS_HOTEL_SECRET) : { status: "fail" as const, lastChecked: new Date().toISOString(), error: "API key not configured" },
      TRIPADVISOR_API_KEY ? checkTripAdvisor(TRIPADVISOR_API_KEY) : { status: "fail" as const, lastChecked: new Date().toISOString(), error: "API key not configured" },
    ]);

    // Travelpayouts is affiliate-based (no direct health check endpoint)
    const travelpayoutsStatus: HealthStatus = secretsConfigured.travelpayouts 
      ? { status: "ok", lastChecked: new Date().toISOString() }
      : { status: "fail", lastChecked: new Date().toISOString(), error: "API credentials not configured" };

    // Cars are affiliate redirect only (always ok if page loads)
    const carsStatus: HealthStatus = { status: "ok", lastChecked: new Date().toISOString() };

    // Hotelbeds activities/transfers (check if credentials exist)
    const activitiesStatus: HealthStatus = secretsConfigured.hotelbeds_activities
      ? { status: "ok", lastChecked: new Date().toISOString() }
      : { status: "fail", lastChecked: new Date().toISOString(), error: "API credentials not configured" };
    
    const transfersStatus: HealthStatus = secretsConfigured.hotelbeds_transfers
      ? { status: "ok", lastChecked: new Date().toISOString() }
      : { status: "fail", lastChecked: new Date().toISOString(), error: "API credentials not configured" };

    // Calculate overall status
    const allStatuses = [travelpayoutsStatus, duffelStatus, hotelbedsStatus, carsStatus];
    const failCount = allStatuses.filter(s => s.status === "fail").length;
    const overall = failCount === 0 ? "healthy" : failCount <= 1 ? "degraded" : "unhealthy";

    const response: HealthCheckResponse = {
      overall,
      flights_travelpayouts: travelpayoutsStatus,
      flights_duffel: duffelStatus,
      hotels_hotelbeds: hotelbedsStatus,
      hotels_tripadvisor: tripadvisorStatus,
      cars_affiliate: carsStatus,
      activities_hotelbeds: activitiesStatus,
      transfers_hotelbeds: transfersStatus,
      timestamp: new Date().toISOString(),
      secrets_configured: secretsConfigured,
    };

    return new Response(JSON.stringify(response, null, 2), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Health check error:", error);
    return new Response(
      JSON.stringify({ 
        overall: "unhealthy", 
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
