import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();
    if (!email || typeof email !== 'string') {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find stores by email directly from profiles or store_profiles
    // First try to find user by email using filtered listUsers
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers({
      filter: `email.eq.${email.toLowerCase()}`,
      page: 1,
      perPage: 1,
    });
    
    let userId: string | null = null;
    
    if (!userError && userData?.users?.length > 0) {
      userId = userData.users[0].id;
    } else {
      // Fallback: search all users page by page (max 5 pages)
      for (let page = 1; page <= 5; page++) {
        const { data: pageData, error: pageError } = await supabase.auth.admin.listUsers({
          page,
          perPage: 500,
        });
        if (pageError || !pageData?.users?.length) break;
        const found = pageData.users.find(
          (u: any) => u.email?.toLowerCase() === email.toLowerCase()
        );
        if (found) { userId = found.id; break; }
      }
    }

    if (!userId) {
      return new Response(JSON.stringify({ error: 'No account found with this email' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Find stores owned by this user
    const { data: stores, error: storeError } = await supabase
      .from('store_profiles')
      .select('id, name')
      .eq('owner_id', user.id);

    if (storeError) throw storeError;

    if (!stores || stores.length === 0) {
      return new Response(JSON.stringify({ error: 'No stores found for this email' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Return store IDs (masked partially for security — show first 4 + last 4 chars)
    const storeIds = stores.map((s: any) => ({
      name: s.name,
      id: s.id.length > 8
        ? s.id.substring(0, 4) + '****' + s.id.substring(s.id.length - 4)
        : s.id,
      full_id: s.id,
    }));

    return new Response(JSON.stringify({ stores: storeIds }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
