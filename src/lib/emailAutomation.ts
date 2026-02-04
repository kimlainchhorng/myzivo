/**
 * Email Automation Client Library
 * 
 * Functions to trigger automated emails from the frontend.
 * All emails go through edge functions for proper logging and compliance.
 */

import { supabase } from "@/integrations/supabase/client";

type TravelEmailType = 
  | "abandoned_search"
  | "redirect_confirmation"
  | "booking_status"
  | "support_auto_reply"
  | "price_alert"
  | "trip_reminder"
  | "booking_confirmation";

interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Send a travel-related email via edge function
 */
export async function sendTravelEmail(
  type: TravelEmailType,
  recipientEmail: string,
  data: Record<string, unknown>
): Promise<SendEmailResult> {
  try {
    const { data: result, error } = await supabase.functions.invoke("send-travel-email", {
      body: { type, recipientEmail, data },
    });

    if (error) {
      console.error(`Failed to send ${type} email:`, error);
      return { success: false, error: error.message };
    }

    console.log(`Email (${type}) sent successfully:`, result);
    return { success: true, id: result?.id };
  } catch (err: any) {
    console.error(`Error sending ${type} email:`, err);
    return { success: false, error: err.message };
  }
}

/**
 * Send price alert email
 */
export async function sendPriceAlertEmail(params: {
  email: string;
  origin: string;
  destination: string;
  oldPrice?: number;
  newPrice?: number;
  searchUrl: string;
}): Promise<SendEmailResult> {
  return sendTravelEmail("price_alert", params.email, {
    origin: params.origin,
    destination: params.destination,
    oldPrice: params.oldPrice,
    newPrice: params.newPrice,
    searchUrl: params.searchUrl,
  });
}

/**
 * Send trip reminder email (3-5 days before departure)
 */
export async function sendTripReminderEmail(params: {
  email: string;
  destination: string;
  departureDate: string;
  daysUntil: number;
  bookingRef?: string;
  partnerName?: string;
  manageUrl?: string;
}): Promise<SendEmailResult> {
  return sendTravelEmail("trip_reminder", params.email, {
    destination: params.destination,
    departureDate: params.departureDate,
    daysUntil: params.daysUntil,
    bookingRef: params.bookingRef,
    partnerName: params.partnerName,
    manageUrl: params.manageUrl,
  });
}

/**
 * Send booking confirmation email
 */
export async function sendBookingConfirmationEmail(params: {
  email: string;
  partnerName: string;
  tripSummary: string;
  tripsUrl?: string;
}): Promise<SendEmailResult> {
  return sendTravelEmail("booking_confirmation", params.email, {
    partnerName: params.partnerName,
    tripSummary: params.tripSummary,
    tripsUrl: params.tripsUrl || "https://hizivo.com/trips",
  });
}

/**
 * Track abandoned search for later email
 * Called when user searches but doesn't redirect to checkout
 */
export async function trackAbandonedSearch(params: {
  email: string;
  searchSessionId: string;
  searchType: "flights" | "hotels" | "cars";
  searchParams: {
    origin?: string;
    destination?: string;
    departureDate?: string;
    returnDate?: string;
    [key: string]: unknown;
  };
}): Promise<{ success: boolean; error?: string }> {
  try {
    const insertData: {
      email: string;
      search_session_id: string;
      search_type: string;
      search_params: Record<string, unknown>;
      checkout_initiated: boolean;
      email_sent: boolean;
    } = {
      email: params.email,
      search_session_id: params.searchSessionId,
      search_type: params.searchType,
      search_params: params.searchParams,
      checkout_initiated: false,
      email_sent: false,
    };
    
    // @ts-expect-error - Supabase types are strict but this matches the schema
    const { error } = await supabase.from("abandoned_searches").insert([insertData]);

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error("Failed to track abandoned search:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Mark search as converted (checkout initiated)
 * Call this when user redirects to partner checkout
 */
export async function markSearchConverted(searchSessionId: string): Promise<void> {
  try {
    await supabase
      .from("abandoned_searches")
      .update({
        checkout_initiated: true,
        checkout_initiated_at: new Date().toISOString(),
      })
      .eq("search_session_id", searchSessionId);
  } catch (err) {
    console.error("Failed to mark search converted:", err);
  }
}
