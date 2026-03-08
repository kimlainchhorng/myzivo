import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { input, proximity } = await req.json();

    // Input validation
    if (!input || typeof input !== "string" || input.trim().length < 2 || input.length > 200) {
      return new Response(JSON.stringify({ error: "Input must be 2-200 characters" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const key = Deno.env.get("GOOGLE_MAPS_API_KEY");
    if (!key) {
      console.error("[maps-autocomplete] GOOGLE_MAPS_API_KEY not configured");
      return new Response(JSON.stringify({ error: "Maps service unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const normalizedInput = input.trim();
    const airportKeywordPattern = /\b(airport|terminal|gate|concourse|airline|arrivals?|departures?|pickup|drop[\s-]?off|zone|msy|jfk|lax|ord|atl|dfw)\b/i;
    const shouldBoostAirportContext = airportKeywordPattern.test(normalizedInput);

    const queryInputs = shouldBoostAirportContext
      ? Array.from(new Set([
          normalizedInput,
          /\bterminal\b/i.test(normalizedInput) ? "" : `${normalizedInput} terminal`,
          /\b(zone|pickup|drop[\s-]?off)\b/i.test(normalizedInput) ? "" : `${normalizedInput} pickup zone`,
          /\b(arrivals?|departures?)\b/i.test(normalizedInput) ? "" : `${normalizedInput} arrivals`,
        ].filter((value): value is string => Boolean(value))))
      : [normalizedInput];

    const fetchPredictions = async (query: string) => {
      let url = `https://maps.googleapis.com/maps/api/place/autocomplete/json` +
        `?input=${encodeURIComponent(query)}` +
        `&components=country:us` +
        `&key=${encodeURIComponent(key)}`;

      if (proximity?.lat && proximity?.lng) {
        url += `&location=${proximity.lat},${proximity.lng}&radius=80000&strictbounds=true`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
        console.error("[maps-autocomplete] Google API error:", data.status, data.error_message, "for query:", query);
        return [];
      }

      return data.predictions ?? [];
    };

    console.log(`[maps-autocomplete] Fetching suggestions for: "${normalizedInput}"`);

    const predictionGroups = await Promise.all(queryInputs.map(fetchPredictions));
    let mergedPredictions = predictionGroups.flat();

    if (shouldBoostAirportContext) {
      const detectedAirportCode = mergedPredictions
        .map((prediction: any) => {
          const description = String(prediction?.description ?? "");
          const match = description.match(/\(([A-Z]{3})\)/);
          return match?.[1] ?? null;
        })
        .find((code): code is string => Boolean(code));

      if (detectedAirportCode) {
        const airportCodeQueries = [`${detectedAirportCode} arrivals`, `${detectedAirportCode} departures`, `${detectedAirportCode} pickup zone`];
        const airportCodePredictionGroups = await Promise.all(airportCodeQueries.map(fetchPredictions));
        mergedPredictions = [...mergedPredictions, ...airportCodePredictionGroups.flat()];
      }
    }

    const uniquePredictions = Array.from(
      new Map(mergedPredictions.map((p: any) => [p.place_id, p])).values()
    );

    const requiresAirportSpecificResults = /\b(airport|terminal|gate|concourse|airline|arrivals?|departures?|pickup|drop[\s-]?off|zone|msy|jfk|lax|ord|atl|dfw)\b/i.test(normalizedInput);

    const airportContextRank = (text: string) => {
      const value = text.toLowerCase();
      const mentionsAirportContext = value.includes("airport") || value.includes("terminal") || value.includes("gate") || value.includes("concourse") || value.includes("arrivals") || value.includes("departures") || value.includes("airline") || value.includes("msy");

      let score = 0;
      if (value.includes("zone") && mentionsAirportContext) score += 6;
      if (value.includes("pickup") || value.includes("drop off") || value.includes("drop-off")) score += 4;
      if (value.includes("arrivals") || value.includes("departures")) score += 6;
      if (value.includes("terminal") || value.includes("concourse") || value.includes("gate")) score += 4;
      if (value.includes("airport")) score += 2;
      if (value.includes("airline") || value.includes("american") || value.includes("delta") || value.includes("united") || value.includes("southwest")) score += 2;
      if (value.includes("hotel") || value.includes("inn") || value.includes("rental") || value.includes("restaurant")) score -= 4;
      if (requiresAirportSpecificResults && !mentionsAirportContext) score -= 6;

      return score;
    };

    const suggestions = uniquePredictions
      .map((p: any) => {
        const description = p.description ?? "";
        const mainText = p.structured_formatting?.main_text ?? description.split(",")[0] ?? "";
        const score = airportContextRank(`${mainText} ${description}`);

        return {
          description,
          place_id: p.place_id,
          main_text: mainText,
          score,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(({ score: _score, ...item }) => item);

    console.log(`[maps-autocomplete] Returning ${suggestions.length} suggestions`);

    return new Response(JSON.stringify({ ok: true, suggestions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[maps-autocomplete] Error:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
