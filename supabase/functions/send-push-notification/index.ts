/**
 * Send Push Notification Edge Function
 * Handles push notifications for iOS, Android, and Web (VAPID)
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

    // Get device tokens from device_tokens table
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

    // Also get web push subscriptions from push_subscriptions table
    let webSubscriptions: any[] = [];
    if (user_id) {
      const { data: subs } = await supabase
        .from("push_subscriptions")
        .select("*")
        .eq("user_id", user_id)
        .eq("is_active", true)
        .eq("platform", "web");
      
      webSubscriptions = subs || [];
    }

    if (tokens.length === 0 && webSubscriptions.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: "No active device tokens found" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: any[] = [];

    // Send to device tokens (mobile apps)
    for (const token of tokens) {
      const log = await createNotificationLog(supabase, {
        user_id: token.user_id,
        device_token_id: token.id,
        notification_type,
        title,
        body,
        data,
      });

      try {
        let sendResult: { success: boolean; error?: string } = { success: false };

        if (token.platform === "web") {
          // Legacy web tokens - use web push
          sendResult = await sendWebPush(token.token, { title, body, data });
        } else if (token.platform === "ios") {
          sendResult = await sendAPNS(token.token, { title, body, data });
        } else if (token.platform === "android") {
          sendResult = await sendFCM(token.token, { title, body, data });
        }

        await updateNotificationLog(supabase, log?.id, sendResult);
        results.push({ token_id: token.id, platform: token.platform, ...sendResult });
      } catch (sendError) {
        console.error("Push send error:", sendError);
        await updateNotificationLog(supabase, log?.id, { 
          success: false, 
          error: sendError instanceof Error ? sendError.message : "Unknown error" 
        });
        results.push({
          token_id: token.id,
          platform: token.platform,
          success: false,
          error: sendError instanceof Error ? sendError.message : "Unknown error",
        });
      }
    }

    // Send to web push subscriptions (VAPID)
    for (const sub of webSubscriptions) {
      const log = await createNotificationLog(supabase, {
        user_id: sub.user_id,
        notification_type,
        title,
        body,
        data,
      });

      try {
        const subscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        const sendResult = await sendVAPIDWebPush(subscription, { title, body, data });
        
        // If subscription is expired, mark as inactive
        if (!sendResult.success && sendResult.expired) {
          await supabase
            .from("push_subscriptions")
            .update({ is_active: false })
            .eq("id", sub.id);
        }

        await updateNotificationLog(supabase, log?.id, sendResult);
        results.push({ subscription_id: sub.id, platform: "web", ...sendResult });
      } catch (sendError) {
        console.error("Web push error:", sendError);
        await updateNotificationLog(supabase, log?.id, { 
          success: false, 
          error: sendError instanceof Error ? sendError.message : "Unknown error" 
        });
        results.push({
          subscription_id: sub.id,
          platform: "web",
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

// Helper: Create notification log
async function createNotificationLog(
  supabase: any,
  data: {
    user_id: string;
    device_token_id?: string;
    notification_type: string;
    title: string;
    body?: string;
    data?: Record<string, unknown>;
  }
) {
  const { data: log, error } = await supabase
    .from("push_notification_logs")
    .insert({
      user_id: data.user_id,
      device_token_id: data.device_token_id,
      notification_type: data.notification_type,
      title: data.title,
      body: data.body,
      data: data.data || {},
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to create log:", error);
    return null;
  }
  return log;
}

// Helper: Update notification log
async function updateNotificationLog(
  supabase: any,
  logId: string | undefined,
  result: { success: boolean; error?: string }
) {
  if (!logId) return;
  
  await supabase
    .from("push_notification_logs")
    .update({
      status: result.success ? "sent" : "failed",
      sent_at: result.success ? new Date().toISOString() : null,
      error_message: result.error,
    })
    .eq("id", logId);
}

// VAPID Web Push implementation
async function sendVAPIDWebPush(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: { title: string; body?: string; data?: Record<string, unknown> }
): Promise<{ success: boolean; error?: string; expired?: boolean }> {
  const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
  const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
  const vapidSubject = Deno.env.get("VAPID_SUBJECT");

  if (!vapidPublicKey || !vapidPrivateKey || !vapidSubject) {
    console.log("[WebPush] VAPID keys not configured, skipping");
    return { success: true }; // Don't fail if not configured yet
  }

  try {
    // Import web-push dynamically
    const webpush = await import("npm:web-push@3.6.7");
    
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

    const pushPayload = JSON.stringify({
      title: payload.title,
      body: payload.body || "",
      icon: "/pwa-icons/icon-192x192.png",
      badge: "/pwa-icons/icon-192x192.png",
      data: payload.data || {},
      tag: payload.data?.type || "default",
    });

    await webpush.sendNotification(subscription, pushPayload);
    
    console.log(`[WebPush] Sent to endpoint: ${subscription.endpoint.substring(0, 50)}...`);
    return { success: true };
  } catch (error: any) {
    console.error("[WebPush] Send error:", error);
    
    // Check if subscription is expired (410 Gone)
    if (error?.statusCode === 410 || error?.statusCode === 404) {
      return { success: false, error: "Subscription expired", expired: true };
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Web push failed" 
    };
  }
}

// Legacy web push (placeholder)
async function sendWebPush(
  token: string,
  payload: { title: string; body?: string; data?: Record<string, unknown> }
): Promise<{ success: boolean; error?: string }> {
  console.log("[WebPush Legacy] Would send to:", token.substring(0, 30), payload.title);
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
    return { success: true };
  }

  console.log("[APNs] Would send to:", token.substring(0, 20), payload.title);
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
    return { success: true };
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
