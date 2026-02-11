import { serve } from "../_shared/deps.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Generate Hotelbeds authentication signature
 * X-Signature = SHA256(apiKey + secret + unixTimestampSeconds)
 */
async function generateSignature(apiKey: string, secret: string): Promise<string> {
  const timestamp = Math.floor(Date.now() / 1000);
  const data = `${apiKey}${secret}${timestamp}`;
  
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(data));
  
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Create authenticated headers for Hotelbeds API
 */
async function getAuthHeaders(apiKey: string, secret: string): Promise<Headers> {
  const signature = await generateSignature(apiKey, secret);
  
  return new Headers({
    "Api-key": apiKey,
    "X-Signature": signature,
    "Accept": "application/json",
    "Content-Type": "application/json",
  });
}

interface TransferAvailabilityRequest {
  language: string;
  fromType: string; // IATA, ATLAS, GPS
  fromCode: string;
  toType: string;
  toCode: string;
  outbound: {
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
    companyName?: string;
    flightNumber?: string;
  };
  inbound?: {
    date: string;
    time: string;
    companyName?: string;
    flightNumber?: string;
  };
  adults: number;
  children: number;
  infants: number;
}

interface TransferBookingRequest {
  holder: {
    name: string;
    surname: string;
    email: string;
    phone: string;
  };
  transfers: Array<{
    rateKey: string;
    transferDetails: Array<{
      type: string; // ARRIVAL, DEPARTURE
      direction: string; // OUTBOUND, INBOUND
      code: string;
      companyName?: string;
      number?: string;
    }>;
  }>;
  clientReference: string;
  welcomeMessage?: string;
  remark?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const HOTELBEDS_API_KEY = Deno.env.get("HOTELBEDS_TRANSFER_API_KEY");
    const HOTELBEDS_SECRET = Deno.env.get("HOTELBEDS_TRANSFER_SECRET");
    const HOTELBEDS_BASE_URL = Deno.env.get("HOTELBEDS_BASE_URL") || "https://api.test.hotelbeds.com";

    if (!HOTELBEDS_API_KEY || !HOTELBEDS_SECRET) {
      throw new Error("Hotelbeds Transfers API credentials not configured");
    }

    const { action, ...payload } = await req.json();

    if (!action) {
      throw new Error("Action is required");
    }

    const authHeaders = await getAuthHeaders(HOTELBEDS_API_KEY, HOTELBEDS_SECRET);
    let response: Response;
    let endpoint: string;

    switch (action) {
      case "status": {
        endpoint = `${HOTELBEDS_BASE_URL}/transfer-api/1.0/status`;
        response = await fetch(endpoint, {
          method: "GET",
          headers: authHeaders,
        });
        break;
      }

      case "availability": {
        endpoint = `${HOTELBEDS_BASE_URL}/transfer-api/1.0/availability`;
        const availabilityPayload: TransferAvailabilityRequest = payload;
        
        // Validate required fields
        if (!availabilityPayload.fromType || !availabilityPayload.fromCode) {
          throw new Error("Pickup location (fromType, fromCode) is required");
        }
        if (!availabilityPayload.toType || !availabilityPayload.toCode) {
          throw new Error("Dropoff location (toType, toCode) is required");
        }
        if (!availabilityPayload.outbound?.date || !availabilityPayload.outbound?.time) {
          throw new Error("Outbound date and time are required");
        }
        if (availabilityPayload.adults < 1) {
          throw new Error("At least one adult is required");
        }

        response = await fetch(endpoint, {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify(availabilityPayload),
        });
        break;
      }

      case "book": {
        endpoint = `${HOTELBEDS_BASE_URL}/transfer-api/1.0/bookings`;
        const bookingPayload: TransferBookingRequest = payload;
        
        if (!bookingPayload.holder?.name || !bookingPayload.holder?.surname) {
          throw new Error("Holder name and surname are required");
        }
        if (!bookingPayload.holder?.email) {
          throw new Error("Holder email is required");
        }
        if (!bookingPayload.holder?.phone) {
          throw new Error("Holder phone is required");
        }
        if (!bookingPayload.transfers?.length) {
          throw new Error("At least one transfer is required");
        }
        if (!bookingPayload.clientReference) {
          throw new Error("Client reference is required");
        }

        response = await fetch(endpoint, {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify(bookingPayload),
        });
        break;
      }

      case "getBooking": {
        const { bookingId } = payload;
        if (!bookingId) {
          throw new Error("Booking ID is required");
        }
        endpoint = `${HOTELBEDS_BASE_URL}/transfer-api/1.0/bookings/${bookingId}`;
        response = await fetch(endpoint, {
          method: "GET",
          headers: authHeaders,
        });
        break;
      }

      case "cancelBooking": {
        const { bookingId } = payload;
        if (!bookingId) {
          throw new Error("Booking ID is required");
        }
        endpoint = `${HOTELBEDS_BASE_URL}/transfer-api/1.0/bookings/${bookingId}`;
        response = await fetch(endpoint, {
          method: "DELETE",
          headers: authHeaders,
        });
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    // Handle rate limiting
    if (response.status === 429) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Rate limit exceeded. Please try again later.",
          code: "RATE_LIMITED",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 429,
        }
      );
    }

    // Handle authentication errors
    if (response.status === 401 || response.status === 403) {
      console.error("Hotelbeds auth error:", response.status);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Authentication failed. Please try again.",
          code: "AUTH_FAILED",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 403,
        }
      );
    }

    const data = await response.json();

    if (!response.ok) {
      console.error("Hotelbeds API error:", data);
      return new Response(
        JSON.stringify({
          success: false,
          error: data.error?.message || "Transfer API request failed",
          code: data.error?.code || "API_ERROR",
          details: data.error,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: response.status,
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    console.error("Hotelbeds Transfers error:", error);
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
