import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SearchRequest {
  query: string;
  category?: string;
  latLong?: string;
  language?: string;
  currency?: string;
}

interface LocationSearchResult {
  location_id: string;
  name: string;
  distance?: string;
  rating?: string;
  bearing?: string;
  address_obj: {
    street1?: string;
    street2?: string;
    city?: string;
    state?: string;
    country?: string;
    postalcode?: string;
    address_string?: string;
  };
}

interface LocationDetailsResult {
  location_id: string;
  name: string;
  description?: string;
  web_url?: string;
  address_obj: {
    street1?: string;
    street2?: string;
    city?: string;
    state?: string;
    country?: string;
    postalcode?: string;
    address_string?: string;
  };
  ancestors?: Array<{
    level: string;
    name: string;
    location_id: string;
  }>;
  latitude?: string;
  longitude?: string;
  timezone?: string;
  email?: string;
  phone?: string;
  website?: string;
  write_review?: string;
  ranking_data?: {
    geo_location_id: string;
    ranking_string: string;
    geo_location_name: string;
    ranking_out_of: string;
    ranking: string;
  };
  rating?: string;
  rating_image_url?: string;
  num_reviews?: string;
  review_rating_count?: Record<string, string>;
  photo_count?: string;
  see_all_photos?: string;
  price_level?: string;
  hours?: {
    periods?: Array<{
      open: { day: number; time: string };
      close: { day: number; time: string };
    }>;
    weekday_text?: string[];
  };
  amenities?: string[];
  category?: {
    name: string;
    localized_name: string;
  };
  subcategory?: Array<{
    name: string;
    localized_name: string;
  }>;
  groups?: Array<{
    name: string;
    localized_name: string;
    categories: Array<{
      name: string;
      localized_name: string;
    }>;
  }>;
  neighborhood_info?: Array<{
    location_id: string;
    name: string;
  }>;
  trip_types?: Array<{
    name: string;
    localized_name: string;
    value: string;
  }>;
  awards?: Array<{
    award_type: string;
    year: string;
    images: {
      small: string;
      large: string;
    };
    categories: string[];
    display_name: string;
  }>;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const TRIPADVISOR_API_KEY = Deno.env.get("TRIPADVISOR_API_KEY");
    
    if (!TRIPADVISOR_API_KEY) {
      throw new Error("TRIPADVISOR_API_KEY is not configured");
    }

    const { query, category = "hotels", latLong, language = "en", currency = "USD" }: SearchRequest = await req.json();

    if (!query) {
      throw new Error("Search query is required");
    }

    const baseUrl = "https://api.content.tripadvisor.com/api/v1";
    
    // Build search URL
    const searchParams = new URLSearchParams({
      key: TRIPADVISOR_API_KEY,
      searchQuery: query,
      category,
      language,
    });

    if (latLong) {
      searchParams.set("latLong", latLong);
    }

    // Search for locations
    const searchResponse = await fetch(
      `${baseUrl}/location/search?${searchParams.toString()}`,
      {
        method: "GET",
        headers: {
          "accept": "application/json",
        },
      }
    );

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error("Tripadvisor API Error:", errorText);
      throw new Error(`Tripadvisor API error: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();
    const locations: LocationSearchResult[] = searchData.data || [];

    // Get details for each location (up to 5)
    const detailedLocations = await Promise.all(
      locations.slice(0, 5).map(async (location) => {
        try {
          const detailParams = new URLSearchParams({
            key: TRIPADVISOR_API_KEY,
            language,
            currency,
          });

          const detailResponse = await fetch(
            `${baseUrl}/location/${location.location_id}/details?${detailParams.toString()}`,
            {
              method: "GET",
              headers: {
                "accept": "application/json",
              },
            }
          );

          if (detailResponse.ok) {
            const details: LocationDetailsResult = await detailResponse.json();
            
            // Also try to get photos
            let photos: any[] = [];
            try {
              const photosResponse = await fetch(
                `${baseUrl}/location/${location.location_id}/photos?key=${TRIPADVISOR_API_KEY}&language=${language}`,
                {
                  method: "GET",
                  headers: {
                    "accept": "application/json",
                  },
                }
              );
              if (photosResponse.ok) {
                const photosData = await photosResponse.json();
                photos = photosData.data || [];
              }
            } catch (e) {
              console.error("Error fetching photos:", e);
            }

            return {
              ...details,
              photos: photos.slice(0, 5),
            };
          }
          return location;
        } catch (e) {
          console.error("Error fetching details for location:", location.location_id, e);
          return location;
        }
      })
    );

    return new Response(
      JSON.stringify({
        success: true,
        data: detailedLocations,
        meta: {
          query,
          category,
          total: detailedLocations.length,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    console.error("Search hotels error:", error);
    const errorMessage = error instanceof Error ? error.message : "An error occurred while searching hotels";
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
