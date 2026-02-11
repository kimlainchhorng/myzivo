import { serve, createClient } from "../_shared/deps.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RegisterTokenRequest {
  token: string;
  platform: 'ios' | 'android' | 'web';
  device_name?: string;
  app_version?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body: RegisterTokenRequest = await req.json();
    
    if (!body.token || !body.platform) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: token, platform' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate platform
    if (!['ios', 'android', 'web'].includes(body.platform)) {
      return new Response(
        JSON.stringify({ error: 'Invalid platform. Must be ios, android, or web' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Deactivate any existing tokens for this user on this platform
    // (user can only have one active token per platform)
    await supabase
      .from('device_tokens')
      .update({ is_active: false })
      .eq('user_id', user.id)
      .eq('platform', body.platform);

    // Upsert the new token
    const { data: tokenData, error: upsertError } = await supabase
      .from('device_tokens')
      .upsert({
        user_id: user.id,
        token: body.token,
        platform: body.platform,
        device_name: body.device_name || null,
        app_version: body.app_version || null,
        is_active: true,
        last_used_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'token',
        ignoreDuplicates: false,
      })
      .select()
      .single();

    if (upsertError) {
      console.error('Token upsert error:', upsertError);
      
      // If conflict on token, try to update existing
      if (upsertError.code === '23505') {
        const { error: updateError } = await supabase
          .from('device_tokens')
          .update({
            user_id: user.id,
            platform: body.platform,
            device_name: body.device_name || null,
            app_version: body.app_version || null,
            is_active: true,
            last_used_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('token', body.token);

        if (updateError) {
          console.error('Token update error:', updateError);
          return new Response(
            JSON.stringify({ error: 'Failed to register token' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else {
        return new Response(
          JSON.stringify({ error: 'Failed to register token' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log(`[register-push-token] Registered token for user ${user.id} on ${body.platform}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Push token registered successfully',
        platform: body.platform,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in register-push-token:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
