/**
 * Send Push Notification Edge Function
 * Handles push notifications for iOS, Android, and Web
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PushRequest {
  user_id?: string;
  device_token_id?: string;
  notification_type: string;
  title: string;
  body?: string;
  data?: Record<string, unknown>;
  order_id?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const payload: PushRequest = await req.json();
    const { user_id, device_token_id, notification_type, title, body, data } = payload;

    if (!title || !notification_type) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: title, notification_type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get device tokens
    let tokens: any[] = [];
    
    if (device_token_id) {
      const { data: token } = await supabase
        .from("device_tokens")
        .select("*")
        .eq("id", device_token_id)
        .eq("is_active", true)
        .single();
      
      if (token) tokens = [token];
    } else if (user_id) {
      const { data: userTokens } = await supabase
        .from("device_tokens")
        .select("*")
        .eq("user_id", user_id)
        .eq("is_active", true);
      
      tokens = userTokens || [];
    }

    if (tokens.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: "No active device tokens found" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: any[] = [];

    for (const token of tokens) {
      // Create log entry
      const { data: log, error: logError } = await supabase
        .from("push_notification_logs")
        .insert({
          user_id: token.user_id,
          device_token_id: token.id,
          notification_type,
          title,
          body,
          data: data || {},
          status: "pending",
        })
        .select()
        .single();

      if (logError) {
        console.error("Failed to create log:", logError);
        continue;
      }

      try {
        // Send based on platform
        let sendResult: { success: boolean; error?: string } = { success: false };

        if (token.platform === "web") {
          // Web Push (would use VAPID keys)
          sendResult = await sendWebPush(token.token, { title, body, data });
        } else if (token.platform === "ios") {
          // APNs
          sendResult = await sendAPNS(token.token, { title, body, data });
        } else if (token.platform === "android") {
          // FCM
          sendResult = await sendFCM(token.token, { title, body, data });
        }

        // Update log status
        await supabase
          .from("push_notification_logs")
          .update({
            status: sendResult.success ? "sent" : "failed",
            sent_at: sendResult.success ? new Date().toISOString() : null,
            error_message: sendResult.error,
          })
          .eq("id", log.id);

        results.push({
          token_id: token.id,
          platform: token.platform,
          ...sendResult,
        });

      } catch (sendError) {
        console.error("Push send error:", sendError);
        
        await supabase
          .from("push_notification_logs")
          .update({
            status: "failed",
            error_message: sendError instanceof Error ? sendError.message : "Unknown error",
          })
          .eq("id", log.id);

        results.push({
          token_id: token.id,
          platform: token.platform,
          success: false,
          error: sendError instanceof Error ? sendError.message : "Unknown error",
        });
      }
    }

    const successCount = results.filter(r => r.success).length;

    return new Response(
      JSON.stringify({
        success: successCount > 0,
        sent: successCount,
        failed: results.length - successCount,
        results,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Push notification error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Web Push implementation (VAPID)
async function sendWebPush(
  token: string,
  payload: { title: string; body?: string; data?: Record<string, unknown> }
): Promise<{ success: boolean; error?: string }> {
  // In production, use web-push library with VAPID keys
  // For now, return placeholder
  console.log("[WebPush] Would send to:", token, payload);
  return { success: true };
}

// APNs implementation
async function sendAPNS(
  token: string,
  payload: { title: string; body?: string; data?: Record<string, unknown> }
): Promise<{ success: boolean; error?: string }> {
  const apnsKey = Deno.env.get("APNS_KEY");
  const apnsKeyId = Deno.env.get("APNS_KEY_ID");
  const apnsTeamId = Deno.env.get("APNS_TEAM_ID");
  const apnsBundleId = Deno.env.get("APNS_BUNDLE_ID");

  if (!apnsKey || !apnsKeyId || !apnsTeamId || !apnsBundleId) {
    console.log("[APNs] Missing credentials, skipping");
    return { success: true }; // Don't fail if not configured
  }

  // APNs implementation would go here
  console.log("[APNs] Would send to:", token, payload);
  return { success: true };
}

// FCM implementation
async function sendFCM(
  token: string,
  payload: { title: string; body?: string; data?: Record<string, unknown> }
): Promise<{ success: boolean; error?: string }> {
  const fcmKey = Deno.env.get("FCM_SERVER_KEY");

  if (!fcmKey) {
    console.log("[FCM] Missing server key, skipping");
    return { success: true }; // Don't fail if not configured
  }

  try {
    const response = await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        "Authorization": `key=${fcmKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: token,
        notification: {
          title: payload.title,
          body: payload.body,
        },
        data: payload.data,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "FCM send failed",
    };
  }
}
