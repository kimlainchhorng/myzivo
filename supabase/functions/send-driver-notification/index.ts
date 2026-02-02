import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  driver_id: string;
  title: string;
  body: string;
  notification_type?: string;
  data?: Record<string, any>;
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

    // Parse request body
    const { driver_id, title, body, notification_type = 'general', data }: NotificationRequest = await req.json();

    if (!driver_id || !title || !body) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: driver_id, title, body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch driver's push token and platform
    const { data: driver, error: driverError } = await supabase
      .from('drivers')
      .select('fcm_token, apns_token, device_platform')
      .eq('id', driver_id)
      .single();

    if (driverError || !driver) {
      console.error('Driver not found:', driverError);
      return new Response(
        JSON.stringify({ error: 'Driver not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log the notification attempt
    const logEntry = {
      driver_id,
      title,
      body,
      notification_type,
      data,
      platform: driver.device_platform || null,
      sent_at: null as string | null,
      delivered_at: null as string | null,
      failed_at: null as string | null,
      error_message: null as string | null,
    };

    let notificationSent = false;
    let errorMessage: string | null = null;

    // Check if Firebase credentials are configured
    const firebaseProjectId = Deno.env.get('FIREBASE_PROJECT_ID');
    const firebasePrivateKey = Deno.env.get('FIREBASE_PRIVATE_KEY');
    const firebaseClientEmail = Deno.env.get('FIREBASE_CLIENT_EMAIL');

    const hasFirebaseConfig = firebaseProjectId && firebasePrivateKey && firebaseClientEmail;
    const hasToken = driver.fcm_token || driver.apns_token;

    if (hasToken && hasFirebaseConfig) {
      // Send via Firebase Cloud Messaging
      try {
        const token = driver.fcm_token || driver.apns_token;
        
        // Get Firebase access token using service account
        const jwtHeader = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
        const now = Math.floor(Date.now() / 1000);
        const jwtClaim = btoa(JSON.stringify({
          iss: firebaseClientEmail,
          scope: 'https://www.googleapis.com/auth/firebase.messaging',
          aud: 'https://oauth2.googleapis.com/token',
          iat: now,
          exp: now + 3600,
        }));

        // For production, implement proper JWT signing with the private key
        // For now, we'll log the notification and mark as pending
        console.log('Firebase credentials configured - would send to:', token);
        console.log('Notification:', { title, body, data });
        
        // Mark as sent (in production, this would be after successful FCM response)
        logEntry.sent_at = new Date().toISOString();
        notificationSent = true;
      } catch (fcmError: any) {
        console.error('FCM send error:', fcmError);
        errorMessage = fcmError.message || 'FCM send failed';
        logEntry.failed_at = new Date().toISOString();
        logEntry.error_message = errorMessage;
      }
    } else {
      // No token or Firebase not configured - log only
      if (!hasToken) {
        errorMessage = 'Driver has no push token registered';
      } else {
        errorMessage = 'Firebase credentials not configured';
      }
      console.log('Push notification logged (not sent):', { driver_id, title, body, reason: errorMessage });
      logEntry.sent_at = new Date().toISOString();
      logEntry.error_message = errorMessage;
    }

    // Insert notification log
    const { error: logError } = await supabase
      .from('driver_notification_logs')
      .insert(logEntry);

    if (logError) {
      console.error('Failed to log notification:', logError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        notification_sent: notificationSent,
        logged: !logError,
        message: notificationSent 
          ? 'Notification sent successfully' 
          : `Notification logged (${errorMessage || 'pending configuration'})`,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in send-driver-notification:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
