import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OfflineAction {
  id: string;
  type: 'update_order_status' | 'update_trip_status' | 'location_update';
  payload: Record<string, any>;
  created_at: string;
}

interface SyncResult {
  action_id: string;
  success: boolean;
  message: string;
  current_status?: string;
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
    const { actions }: { actions: OfflineAction[] } = await req.json();
    
    if (!Array.isArray(actions) || actions.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No actions to sync' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Limit batch size
    if (actions.length > 50) {
      return new Response(
        JSON.stringify({ error: 'Maximum 50 actions per sync request' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results: SyncResult[] = [];

    for (const action of actions) {
      try {
        const clientTimestamp = action.created_at;

        switch (action.type) {
          case 'update_order_status': {
            const { order_id, status } = action.payload;
            
            if (!order_id || !status) {
              results.push({
                action_id: action.id,
                success: false,
                message: 'Missing order_id or status',
              });
              continue;
            }

            // Use idempotent function
            const { data, error } = await supabase.rpc('update_order_status_idempotent', {
              p_order_id: order_id,
              p_new_status: status,
              p_client_timestamp: clientTimestamp,
            });

            if (error) {
              results.push({
                action_id: action.id,
                success: false,
                message: error.message,
              });
            } else if (data && data[0]) {
              results.push({
                action_id: action.id,
                success: data[0].success,
                message: data[0].message,
                current_status: data[0].current_status,
              });
            } else {
              results.push({
                action_id: action.id,
                success: false,
                message: 'No response from server',
              });
            }
            break;
          }

          case 'update_trip_status': {
            const { trip_id, status } = action.payload;
            
            if (!trip_id || !status) {
              results.push({
                action_id: action.id,
                success: false,
                message: 'Missing trip_id or status',
              });
              continue;
            }

            // Use idempotent function
            const { data, error } = await supabase.rpc('update_trip_status_idempotent', {
              p_trip_id: trip_id,
              p_new_status: status,
              p_client_timestamp: clientTimestamp,
            });

            if (error) {
              results.push({
                action_id: action.id,
                success: false,
                message: error.message,
              });
            } else if (data && data[0]) {
              results.push({
                action_id: action.id,
                success: data[0].success,
                message: data[0].message,
                current_status: data[0].current_status,
              });
            } else {
              results.push({
                action_id: action.id,
                success: false,
                message: 'No response from server',
              });
            }
            break;
          }

          case 'location_update': {
            const { lat, lng, heading, speed, accuracy } = action.payload;
            
            if (lat === undefined || lng === undefined) {
              results.push({
                action_id: action.id,
                success: false,
                message: 'Missing lat or lng',
              });
              continue;
            }

            // Get driver ID for this user
            const { data: driver } = await supabase
              .from('drivers')
              .select('id')
              .eq('user_id', user.id)
              .single();

            if (!driver) {
              results.push({
                action_id: action.id,
                success: false,
                message: 'Driver not found',
              });
              continue;
            }

            // Update driver location
            const { error } = await supabase
              .from('drivers')
              .update({
                current_lat: lat,
                current_lng: lng,
                last_active_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq('id', driver.id);

            if (error) {
              results.push({
                action_id: action.id,
                success: false,
                message: error.message,
              });
            } else {
              results.push({
                action_id: action.id,
                success: true,
                message: 'Location updated',
              });
            }
            break;
          }

          default:
            results.push({
              action_id: action.id,
              success: false,
              message: `Unknown action type: ${action.type}`,
            });
        }
      } catch (actionError: any) {
        console.error(`Error processing action ${action.id}:`, actionError);
        results.push({
          action_id: action.id,
          success: false,
          message: actionError.message || 'Unknown error',
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`[sync-offline-actions] User ${user.id}: ${successCount}/${actions.length} actions synced`);

    return new Response(
      JSON.stringify({
        success: true,
        total: actions.length,
        synced: successCount,
        failed: actions.length - successCount,
        results,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in sync-offline-actions:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
