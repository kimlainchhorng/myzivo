import { createClient, serve } from "../_shared/deps.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

type JsonRecord = Record<string, unknown>;

type BridgeRequest = {
  table?: string;
  schema?: string;
  operation?: string;
  record?: JsonRecord;
};

type MetaUserData = {
  em?: string[];
  ph?: string[];
  client_ip_address?: string;
  client_user_agent?: string;
};

type MetaCustomData = {
  value: number;
  currency: string;
  content_name: string;
  content_category: string;
};

type MetaEvent = {
  event_name: "Purchase";
  event_time: number;
  event_id: string;
  action_source: "app";
  user_data: MetaUserData;
  custom_data: MetaCustomData;
};

function asString(value: unknown): string | null {
  if (typeof value === "string") {
    const v = value.trim();
    return v.length ? v : null;
  }
  return null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function normalizeCurrency(value: unknown): string {
  const code = asString(value)?.toUpperCase();
  return code && code.length <= 5 ? code : "USD";
}

function getNestedMeta(record: JsonRecord, key: string): unknown {
  const metadata = record.metadata;
  if (!metadata || typeof metadata !== "object") return null;
  return (metadata as JsonRecord)[key];
}

function inferCategory(table: string, record: JsonRecord): string {
  if (["trips", "travel_bookings", "flight_bookings", "hotel_bookings", "travel_orders"].includes(table)) {
    return "Travel";
  }
  if (table === "food_orders") return "Food & Beverage";
  if (["shopping_orders", "store_orders", "marketplace_orders"].includes(table)) return "Retail";

  if (table === "transactions") {
    if (record.trip_id) return "Travel";
    if (record.food_order_id) return "Food & Beverage";

    const serviceType = asString(getNestedMeta(record, "service_type"))?.toLowerCase();
    const vertical = asString(getNestedMeta(record, "vertical"))?.toLowerCase();
    const moduleName = asString(getNestedMeta(record, "module"))?.toLowerCase();

    const travelTags = ["flight", "flights", "hotel", "hotels", "travel", "ride", "rides", "car", "cars"];
    const foodTags = ["food", "restaurant", "eats", "grocery"];
    const retailTags = ["shopping", "store", "marketplace", "retail"];

    const bucket = [serviceType, vertical, moduleName].filter(Boolean).join(" ");
    if (travelTags.some((tag) => bucket.includes(tag))) return "Travel";
    if (foodTags.some((tag) => bucket.includes(tag))) return "Food & Beverage";
    if (retailTags.some((tag) => bucket.includes(tag))) return "Retail";
  }

  return "General";
}

function inferContentName(table: string, record: JsonRecord): string {
  if (table === "trips") {
    return asString(record.dropoff_address) ?? "Ride booking";
  }
  if (table === "food_orders") {
    return asString(record.restaurant_name) ?? "Food order";
  }
  if (table === "flight_bookings") {
    return asString(record.flight_route_name) ?? "Flight booking";
  }
  if (table === "hotel_bookings") {
    return asString(record.hotel_name) ?? "Hotel booking";
  }
  if (table === "travel_bookings") {
    const serviceType = asString(record.service_type)?.toLowerCase();
    if (serviceType === "flights") return "Flight booking";
    if (serviceType === "hotels") return "Hotel booking";
    if (serviceType === "cars") return "Car booking";
    return "Travel booking";
  }
  if (table === "shopping_orders") {
    return asString(record.store) ?? "Shopping order";
  }
  if (table === "store_orders") {
    return asString(record.store_name) ?? "Store order";
  }
  if (table === "marketplace_orders") {
    return "Marketplace order";
  }
  if (table === "transactions") {
    return (
      asString(record.description) ??
      asString(getNestedMeta(record, "content_name")) ??
      "ZiVo transaction"
    );
  }

  return `${table} purchase`;
}

function inferValueCurrency(table: string, record: JsonRecord): { value: number; currency: string } | null {
  if (table === "transactions") {
    const value = asNumber(record.amount);
    if (value === null) return null;
    return { value, currency: normalizeCurrency(record.currency) };
  }
  if (table === "trips") {
    const value = asNumber(record.fare_amount);
    if (value === null) return null;
    return { value, currency: normalizeCurrency(getNestedMeta(record, "currency")) };
  }
  if (table === "food_orders") {
    const value = asNumber(record.total_amount);
    if (value === null) return null;
    return { value, currency: normalizeCurrency(getNestedMeta(record, "currency") ?? record.currency) };
  }
  if (table === "flight_bookings" || table === "hotel_bookings") {
    const value = asNumber(record.total_amount);
    if (value === null) return null;
    return { value, currency: normalizeCurrency(record.currency) };
  }
  if (table === "travel_bookings") {
    const value = asNumber(record.offer_price_amount);
    if (value === null) return null;
    return { value, currency: normalizeCurrency(record.offer_price_currency) };
  }
  if (table === "shopping_orders") {
    const value = asNumber(record.total_amount);
    if (value === null) return null;
    return { value, currency: normalizeCurrency(record.currency) };
  }
  if (table === "store_orders") {
    const cents = asNumber(record.total_cents);
    if (cents === null) return null;
    return { value: cents / 100, currency: normalizeCurrency(record.currency) };
  }
  if (table === "marketplace_orders") {
    const cents = asNumber(record.total_cents);
    if (cents === null) return null;
    return { value: cents / 100, currency: normalizeCurrency(record.currency) };
  }

  return null;
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input.trim().toLowerCase());
  const hash = await crypto.subtle.digest("SHA-256", data);
  const bytes = Array.from(new Uint8Array(hash));
  return bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function getUserIdFromRecord(record: JsonRecord): string | null {
  return (
    asString(record.user_id) ??
    asString(record.customer_id) ??
    asString(record.rider_id) ??
    asString(record.buyer_id) ??
    null
  );
}

async function enrichRecord(
  supabase: ReturnType<typeof createClient>,
  table: string,
  source: JsonRecord,
): Promise<JsonRecord> {
  const record = { ...source };

  // Resolve profile email/phone when a user reference exists.
  const userId = getUserIdFromRecord(record);
  if (userId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, phone")
      .eq("user_id", userId)
      .maybeSingle();

    if (!record.email && profile?.email) record.email = profile.email;
    if (!record.customer_email && profile?.email) record.customer_email = profile.email;
    if (!record.phone && profile?.phone) record.phone = profile.phone;
    if (!record.customer_phone && profile?.phone) record.customer_phone = profile.phone;
  }

  if (table === "food_orders" && record.restaurant_id) {
    const { data: restaurant } = await supabase
      .from("restaurants")
      .select("name")
      .eq("id", String(record.restaurant_id))
      .maybeSingle();
    if (restaurant?.name) record.restaurant_name = restaurant.name;
  }

  if (table === "flight_bookings" && record.flight_id) {
    const { data: flight } = await supabase
      .from("flights")
      .select("departure_city, arrival_city")
      .eq("id", String(record.flight_id))
      .maybeSingle();
    if (flight?.departure_city && flight?.arrival_city) {
      record.flight_route_name = `${flight.departure_city} Flight to ${flight.arrival_city}`;
    }
  }

  if (table === "hotel_bookings" && record.hotel_id) {
    const { data: hotel } = await supabase
      .from("hotels")
      .select("name")
      .eq("id", String(record.hotel_id))
      .maybeSingle();
    if (hotel?.name) record.hotel_name = hotel.name;
  }

  if (table === "travel_bookings" && record.offer_id) {
    const { data: offer } = await supabase
      .from("travel_offers")
      .select("price_amount, price_currency")
      .eq("id", String(record.offer_id))
      .maybeSingle();

    if (offer?.price_amount != null) record.offer_price_amount = offer.price_amount;
    if (offer?.price_currency) record.offer_price_currency = offer.price_currency;
  }

  if (table === "store_orders" && record.store_id) {
    const { data: store } = await supabase
      .from("store_profiles")
      .select("name")
      .eq("id", String(record.store_id))
      .maybeSingle();
    if (store?.name) record.store_name = store.name;
  }

  return record;
}

function readEmail(record: JsonRecord): string | null {
  return (
    asString(record.email) ??
    asString(record.customer_email) ??
    asString(record.guest_email) ??
    asString(record.holder_email) ??
    null
  );
}

function readPhone(record: JsonRecord): string | null {
  return (
    asString(record.phone) ??
    asString(record.customer_phone) ??
    asString(record.guest_phone) ??
    asString(record.holder_phone) ??
    null
  );
}

function readClientIp(record: JsonRecord): string | null {
  return (
    asString(record.client_ip_address) ??
    asString(record.ip_address) ??
    asString(getNestedMeta(record, "client_ip_address")) ??
    asString(getNestedMeta(record, "ip_address")) ??
    null
  );
}

function readClientUa(record: JsonRecord): string | null {
  return (
    asString(record.client_user_agent) ??
    asString(record.user_agent) ??
    asString(getNestedMeta(record, "client_user_agent")) ??
    asString(getNestedMeta(record, "user_agent")) ??
    null
  );
}

function shouldSkip(table: string, record: JsonRecord): boolean {
  const status = asString(record.status)?.toLowerCase();

  // Accept delivered as completed for store-like flows.
  if (["store_orders", "shopping_orders"].includes(table)) {
    return !(status === "completed" || status === "delivered" || status === "payment_confirmed");
  }

  return status !== "completed";
}

serve(async (req: Request) => {
  const cors = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors });
  }

  try {
    const pixelId = Deno.env.get("META_PIXEL_ID");
    const accessToken = Deno.env.get("META_ACCESS_TOKEN");
    const testEventCode = Deno.env.get("META_TEST_EVENT_CODE");

    if (!pixelId || !accessToken) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "META_PIXEL_ID or META_ACCESS_TOKEN is missing",
        }),
        { status: 500, headers: { ...cors, "Content-Type": "application/json" } },
      );
    }

    const payload = (await req.json()) as BridgeRequest;
    const table = (payload.table ?? "").trim();
    const record = payload.record ?? {};

    if (!table || !record || typeof record !== "object") {
      return new Response(JSON.stringify({ ok: false, error: "Invalid webhook payload" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    if (shouldSkip(table, record)) {
      return new Response(JSON.stringify({ ok: true, skipped: true, reason: "status_not_completed" }), {
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const enriched = await enrichRecord(supabase as any, table, record);

    const valueCurrency = inferValueCurrency(table, enriched);
    if (!valueCurrency) {
      return new Response(JSON.stringify({ ok: true, skipped: true, reason: "missing_value" }), {
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const rawEmail = readEmail(enriched);
    const rawPhone = readPhone(enriched);

    const userData: MetaUserData = {
      client_ip_address: readClientIp(enriched) ?? undefined,
      client_user_agent: readClientUa(enriched) ?? undefined,
    };

    if (rawEmail) userData.em = [await sha256Hex(rawEmail)];
    if (rawPhone) userData.ph = [await sha256Hex(rawPhone)];

    const eventId = asString(enriched.id) ?? crypto.randomUUID();

    const event: MetaEvent = {
      event_name: "Purchase",
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      action_source: "app",
      user_data: userData,
      custom_data: {
        value: valueCurrency.value,
        currency: valueCurrency.currency,
        content_name: inferContentName(table, enriched),
        content_category: inferCategory(table, enriched),
      },
    };

    const body: JsonRecord = { data: [event] };
    if (testEventCode) body.test_event_code = testEventCode;

    const metaUrl = `https://graph.facebook.com/v19.0/${pixelId}/events`;
    const metaRes = await fetch(metaUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...body,
        access_token: accessToken,
      }),
    });

    const metaJson = await metaRes.json().catch(() => ({}));

    if (!metaRes.ok) {
      console.error("[meta-capi-bridge] Meta API error", {
        status: metaRes.status,
        table,
        eventId,
        response: metaJson,
      });

      return new Response(
        JSON.stringify({ ok: false, status: metaRes.status, table, eventId, meta: metaJson }),
        { status: 502, headers: { ...cors, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        table,
        event_id: eventId,
        event_name: event.event_name,
        category: event.custom_data.content_category,
        meta: metaJson,
      }),
      { headers: { ...cors, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[meta-capi-bridge] Unexpected error", message);

    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
