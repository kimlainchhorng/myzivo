import { createClient } from "../_shared/deps.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

// Find nearby online drivers and create job_offers for a ride request.
// Uses Haversine distance fallback if PostGIS not available.
Deno.serve(async (req) => {
  const cors = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    const { ride_request_id, radius_km = 10 } = await req.json();
    if (!ride_request_id) {
      return new Response(JSON.stringify({ error: "ride_request_id required" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const { data: ride, error: rideErr } = await admin
      .from("ride_requests")
      .select("id, pickup_lat, pickup_lng, status")
      .eq("id", ride_request_id)
      .single();
    if (rideErr || !ride) {
      return new Response(JSON.stringify({ error: "Ride not found" }), { status: 404, headers: { ...cors, "Content-Type": "application/json" } });
    }
    if (!ride.pickup_lat || !ride.pickup_lng) {
      return new Response(JSON.stringify({ error: "Ride missing pickup coordinates" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }

    // Pull online drivers (cap to bound the result set)
    const { data: drivers } = await admin
      .from("drivers")
      .select("id, current_lat, current_lng, rating, is_online")
      .eq("is_online", true)
      .not("current_lat", "is", null)
      .not("current_lng", "is", null)
      .limit(500);

    const haversine = (lat1: number, lng1: number, lat2: number, lng2: number) => {
      const R = 6371;
      const toRad = (d: number) => (d * Math.PI) / 180;
      const dLat = toRad(lat2 - lat1);
      const dLng = toRad(lng2 - lng1);
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
      return 2 * R * Math.asin(Math.sqrt(a));
    };

    const candidates = (drivers ?? [])
      .map((d: any) => ({
        ...d,
        distance_km: haversine(ride.pickup_lat, ride.pickup_lng, d.current_lat, d.current_lng),
      }))
      .filter((d: any) => d.distance_km <= radius_km)
      .sort((a: any, b: any) => {
        // Combined score: distance weighted more, rating tiebreaker
        const sa = a.distance_km - (a.rating ?? 0) * 0.2;
        const sb = b.distance_km - (b.rating ?? 0) * 0.2;
        return sa - sb;
      })
      .slice(0, 5);

    if (candidates.length === 0) {
      return new Response(JSON.stringify({ ok: true, offered: 0, message: "No drivers in radius" }), {
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const offers = candidates.map((d: any) => ({
      ride_request_id,
      driver_id: d.id,
      status: "pending",
      distance_km: d.distance_km,
      expires_at: new Date(Date.now() + 15_000).toISOString(),
    }));

    const { error: insErr } = await admin.from("job_offers").insert(offers as any);
    if (insErr) console.error("[dispatch-ride] insert offers", insErr);

    await admin.from("ride_requests").update({ status: "dispatching" } as any).eq("id", ride_request_id);

    return new Response(JSON.stringify({ ok: true, offered: candidates.length, candidates: candidates.map((c: any) => c.id) }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[dispatch-ride]", e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
  }
});
