/**
 * Email Service Client
 * 
 * Client-side helper for sending emails through the travel email edge function
 */

import { supabase } from "@/integrations/supabase/client";

export type EmailType = 'abandoned_search' | 'redirect_confirmation' | 'booking_status' | 'support_auto_reply';

interface EmailData {
  type: EmailType;
  recipientEmail: string;
  data: Record<string, unknown>;
}

interface EmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Send an email through the travel email edge function
 */
export async function sendTravelEmail(emailData: EmailData): Promise<EmailResult> {
  try {
    const { data, error } = await supabase.functions.invoke('send-travel-email', {
      body: emailData,
    });

    if (error) {
      console.error('[EmailService] Error:', error);
      return { success: false, error: error.message };
    }

    return data as EmailResult;
  } catch (err) {
    console.error('[EmailService] Exception:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Send abandoned search recovery email
 */
export async function sendAbandonedSearchEmail(params: {
  recipientEmail: string;
  origin: string;
  destination: string;
  searchType: 'flights' | 'hotels' | 'cars';
  departureDate?: string;
  returnDate?: string;
  searchSessionId?: string;
}): Promise<EmailResult> {
  const continueSearchUrl = buildContinueSearchUrl(params);
  
  return sendTravelEmail({
    type: 'abandoned_search',
    recipientEmail: params.recipientEmail,
    data: {
      origin: params.origin,
      destination: params.destination,
      searchType: params.searchType,
      departureDate: params.departureDate,
      returnDate: params.returnDate,
      continueSearchUrl,
      searchSessionId: params.searchSessionId,
    },
  });
}

/**
 * Send partner redirect confirmation email
 */
export async function sendRedirectConfirmationEmail(params: {
  recipientEmail: string;
  partnerName: string;
  tripSummary: string;
  searchSessionId?: string;
}): Promise<EmailResult> {
  return sendTravelEmail({
    type: 'redirect_confirmation',
    recipientEmail: params.recipientEmail,
    data: {
      partnerName: params.partnerName,
      tripSummary: params.tripSummary,
      tripsUrl: 'https://hizovo.com/trips',
      searchSessionId: params.searchSessionId,
    },
  });
}

/**
 * Send booking status email
 */
export async function sendBookingStatusEmail(params: {
  recipientEmail: string;
  status: 'success' | 'pending' | 'unknown';
  bookingRef?: string;
  partnerName: string;
  tripSummary: string;
  searchSessionId?: string;
}): Promise<EmailResult> {
  return sendTravelEmail({
    type: 'booking_status',
    recipientEmail: params.recipientEmail,
    data: {
      status: params.status,
      bookingRef: params.bookingRef,
      partnerName: params.partnerName,
      tripSummary: params.tripSummary,
      tripsUrl: 'https://hizovo.com/trips',
      searchSessionId: params.searchSessionId,
    },
  });
}

/**
 * Send support auto-reply email
 */
export async function sendSupportAutoReplyEmail(params: {
  recipientEmail: string;
  ticketNumber: string;
  category: string;
  subject: string;
  isBookingRelated: boolean;
  partnerName?: string;
  responseWindowHours?: number;
}): Promise<EmailResult> {
  return sendTravelEmail({
    type: 'support_auto_reply',
    recipientEmail: params.recipientEmail,
    data: {
      ticketNumber: params.ticketNumber,
      category: params.category,
      subject: params.subject,
      isBookingRelated: params.isBookingRelated,
      partnerName: params.partnerName,
      responseWindowHours: params.responseWindowHours || 24,
    },
  });
}

/**
 * Record email consent
 */
export async function recordEmailConsent(params: {
  email: string;
  searchSessionId?: string;
  consentType?: string;
  consentText?: string;
}): Promise<boolean> {
  try {
    const { error } = await supabase.from('email_consents').insert({
      email: params.email,
      search_session_id: params.searchSessionId,
      consent_type: params.consentType || 'trip_updates',
      consent_text: params.consentText || 'I agree to receive trip updates and to share my information with the booking partner.',
      ip_address: null, // Will be set server-side if needed
      user_agent: navigator.userAgent,
    });

    if (error) {
      console.error('[EmailService] Consent recording error:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[EmailService] Consent exception:', err);
    return false;
  }
}

/**
 * Track abandoned search for later email
 */
export async function trackAbandonedSearch(params: {
  email: string;
  searchSessionId: string;
  searchType: 'flights' | 'hotels' | 'cars';
  searchParams: Record<string, unknown>;
}): Promise<boolean> {
  try {
    const { error } = await supabase.from('abandoned_searches').insert([{
      email: params.email,
      search_session_id: params.searchSessionId,
      search_type: params.searchType,
      search_params: params.searchParams as unknown as Record<string, never>,
    }]);

    if (error) {
      console.error('[EmailService] Abandoned search tracking error:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[EmailService] Abandoned search exception:', err);
    return false;
  }
}

/**
 * Mark search as checkout initiated (prevents abandoned email)
 */
export async function markCheckoutInitiated(searchSessionId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('abandoned_searches')
      .update({
        checkout_initiated: true,
        checkout_initiated_at: new Date().toISOString(),
      })
      .eq('search_session_id', searchSessionId);

    if (error) {
      console.error('[EmailService] Checkout mark error:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[EmailService] Checkout mark exception:', err);
    return false;
  }
}

// Helper to build continue search URL
function buildContinueSearchUrl(params: {
  origin: string;
  destination: string;
  searchType: 'flights' | 'hotels' | 'cars';
  departureDate?: string;
  returnDate?: string;
}): string {
  const base = `https://hizovo.com/${params.searchType}`;
  const searchParams = new URLSearchParams({
    origin: params.origin,
    destination: params.destination,
    ...(params.departureDate && { departureDate: params.departureDate }),
    ...(params.returnDate && { returnDate: params.returnDate }),
    utm_source: 'email',
    utm_medium: 'abandoned_search',
    utm_campaign: 'recovery',
  });
  return `${base}?${searchParams.toString()}`;
}
