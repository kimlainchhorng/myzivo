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

interface ActivitySearchRequest {
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
  language?: string;
  destination?: string; // Destination code
  paxes?: Array<{
    type: string; // ADULT, CHILD
    age?: number;
  }>;
  filters?: {
    searchFilterItems?: Array<{
      type: string;
      value: string[];
    }>;
  };
  pagination?: {
    itemsPerPage: number;
    page: number;
  };
  order?: string;
}

interface ActivityBookingRequest {
  holder: {
    name: string;
    surname: string;
    email: string;
    telephones: Array<{
      type: string;
      number: string;
    }>;
  };
  activities: Array<{
    preferedLanguage?: string;
    serviceLanguage?: string;
    rateKey: string;
    from: string;
    to: string;
    paxes: Array<{
      name: string;
      surname: string;
      type: string;
      age?: number;
    }>;
    answers?: Array<{
      question: string;
      answer: string;
    }>;
  }>;
  clientReference: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const HOTELBEDS_API_KEY = Deno.env.get("HOTELBEDS_ACTIVITY_API_KEY");
    const HOTELBEDS_SECRET = Deno.env.get("HOTELBEDS_ACTIVITY_SECRET");
    const HOTELBEDS_BASE_URL = Deno.env.get("HOTELBEDS_BASE_URL") || "https://api.test.hotelbeds.com";

    if (!HOTELBEDS_API_KEY || !HOTELBEDS_SECRET) {
      throw new Error("Hotelbeds Activities API credentials not configured");
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
        endpoint = `${HOTELBEDS_BASE_URL}/activity-api/1.0/status`;
        response = await fetch(endpoint, {
          method: "GET",
          headers: authHeaders,
        });
        break;
      }

      case "search": {
        endpoint = `${HOTELBEDS_BASE_URL}/activity-api/1.0/activities/availability`;
        const searchPayload: ActivitySearchRequest = payload;
        
        // Validate required fields
        if (!searchPayload.from || !searchPayload.to) {
          throw new Error("From and to dates are required");
        }
        if (!searchPayload.destination) {
          throw new Error("Destination code is required");
        }

        response = await fetch(endpoint, {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify(searchPayload),
        });
        break;
      }

      case "details": {
        const { code } = payload;
        if (!code) {
          throw new Error("Activity code is required");
        }
        endpoint = `${HOTELBEDS_BASE_URL}/activity-api/1.0/activities/${code}`;
        response = await fetch(endpoint, {
          method: "GET",
          headers: authHeaders,
        });
        break;
      }

      case "book": {
        endpoint = `${HOTELBEDS_BASE_URL}/activity-api/1.0/bookings`;
        const bookingPayload: ActivityBookingRequest = payload;
        
        if (!bookingPayload.holder?.name || !bookingPayload.holder?.surname) {
          throw new Error("Holder name and surname are required");
        }
        if (!bookingPayload.holder?.email) {
          throw new Error("Holder email is required");
        }
        if (!bookingPayload.activities?.length) {
          throw new Error("At least one activity is required");
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
        endpoint = `${HOTELBEDS_BASE_URL}/activity-api/1.0/bookings/${bookingId}`;
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
        endpoint = `${HOTELBEDS_BASE_URL}/activity-api/1.0/bookings/${bookingId}`;
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
          error: data.error?.message || "Activity API request failed",
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
    console.error("Hotelbeds Activities error:", error);
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
