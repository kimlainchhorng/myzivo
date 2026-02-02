/**
 * Booking Return Handler
 * 
 * Processes partner callbacks at /booking/return
 * 
 * Partner sends:
 * - bookingRef (required)
 * - status (optional: success, failed, pending)
 * - subid (our search session ID)
 * 
 * On return we:
 * 1. Read subid from URL
 * 2. Match it to SearchSession
 * 3. Save bookingRef
 * 4. Mark as Converted
 */

import { supabase } from '@/integrations/supabase/client';

export interface BookingReturnParams {
  bookingRef?: string | null;
  status?: string | null;
  subid?: string | null;
  partner?: string | null;
  type?: 'flights' | 'hotels' | 'cars' | null;
  // Additional params partners might send
  confirmationNumber?: string | null;
  orderId?: string | null;
  transactionId?: string | null;
  error?: string | null;
  errorCode?: string | null;
}

export interface BookingReturnResult {
  success: boolean;
  bookingRef: string | null;
  status: 'converted' | 'failed' | 'pending' | 'unknown';
  searchSession: {
    id: string;
    type: string;
    origin?: string;
    destination?: string;
  } | null;
  redirectLog: {
    id: string;
    partnerName: string;
  } | null;
  error?: string;
}

/**
 * Parse booking return URL parameters
 */
export function parseBookingReturnParams(searchParams: URLSearchParams): BookingReturnParams {
  // Partners use different param names - normalize them
  const bookingRef = 
    searchParams.get('bookingRef') || 
    searchParams.get('booking_ref') ||
    searchParams.get('confirmationNumber') ||
    searchParams.get('confirmation_number') ||
    searchParams.get('ref') ||
    searchParams.get('orderId') ||
    searchParams.get('order_id') ||
    searchParams.get('id');

  const status = 
    searchParams.get('status') || 
    searchParams.get('booking_status') ||
    searchParams.get('result');

  const subid = 
    searchParams.get('subid') || 
    searchParams.get('sub_id') ||
    searchParams.get('sid') ||
    searchParams.get('aid') ||
    searchParams.get('affcid') ||
    searchParams.get('tracking_id');

  const partner = 
    searchParams.get('partner') || 
    searchParams.get('source') ||
    searchParams.get('affiliate');

  const type = searchParams.get('type') as BookingReturnParams['type'];

  return {
    bookingRef,
    status,
    subid,
    partner,
    type,
    confirmationNumber: searchParams.get('confirmationNumber'),
    orderId: searchParams.get('orderId'),
    transactionId: searchParams.get('transactionId'),
    error: searchParams.get('error'),
    errorCode: searchParams.get('errorCode') || searchParams.get('error_code'),
  };
}

/**
 * Normalize partner status to our internal status
 */
function normalizeStatus(
  status: string | null | undefined,
  bookingRef: string | null | undefined,
  error: string | null | undefined
): 'converted' | 'failed' | 'pending' | 'unknown' {
  // If there's an error, it's failed
  if (error) {
    return 'failed';
  }

  // If we have a booking ref, consider it converted
  if (bookingRef) {
    return 'converted';
  }

  // Normalize status strings
  const normalizedStatus = status?.toLowerCase().trim();

  switch (normalizedStatus) {
    case 'success':
    case 'confirmed':
    case 'completed':
    case 'booked':
    case 'converted':
      return 'converted';
    
    case 'failed':
    case 'error':
    case 'cancelled':
    case 'canceled':
    case 'declined':
    case 'rejected':
      return 'failed';
    
    case 'pending':
    case 'processing':
    case 'awaiting':
    case 'in_progress':
      return 'pending';
    
    default:
      return 'unknown';
  }
}

/**
 * Log a conversion event for analytics
 */
async function logConversionEvent(data: {
  subid: string;
  bookingRef: string;
  partner: string;
  type: 'flights' | 'hotels' | 'cars';
  searchSessionId?: string;
  redirectLogId?: string;
}) {
  console.log('[BookingReturn] Conversion logged:', {
    subid: data.subid,
    bookingRef: data.bookingRef,
    partner: data.partner,
    type: data.type,
  });

  // Store in session for immediate UI feedback
  const conversions = JSON.parse(sessionStorage.getItem('hizovo_conversions') || '[]');
  conversions.push({
    ...data,
    timestamp: new Date().toISOString(),
  });
  sessionStorage.setItem('hizovo_conversions', JSON.stringify(conversions.slice(-20)));
}

/**
 * Process booking return and update database
 */
export async function processBookingReturn(params: BookingReturnParams): Promise<BookingReturnResult> {
  const { bookingRef, status, subid, partner, type } = params;

  console.log('[BookingReturn] Processing:', { bookingRef, status, subid, partner, type });

  // Determine booking status from partner response
  const normalizedStatus = normalizeStatus(status, bookingRef, params.error);

  // If no subid, we can't match to a session but still track the return
  if (!subid) {
    console.warn('[BookingReturn] No subid provided - cannot match to search session');
    return {
      success: !!bookingRef,
      bookingRef: bookingRef || null,
      status: normalizedStatus,
      searchSession: null,
      redirectLog: null,
      error: 'No subid provided by partner',
    };
  }

  try {
    // Define types for query results
    type SearchSessionResult = { id: string; session_id: string; type: string; origin: string | null; destination: string | null };
    type RedirectLogResult = { id: string; partner_name: string; search_type: string; metadata: Record<string, unknown> | null };

    // 1. Find the search session by subid
    let searchSession: SearchSessionResult | null = null;
    try {
      const result = await supabase
        .from('search_sessions')
        .select('id, session_id, type, origin, destination')
        .eq('session_id', subid)
        .maybeSingle();
      searchSession = result.data as SearchSessionResult | null;
      if (result.error) {
        console.error('[BookingReturn] Error finding search session:', result.error);
      }
    } catch (e) {
      console.error('[BookingReturn] Exception finding search session:', e);
    }

    // 2. Find the partner redirect log
    // Cast to any to avoid TypeScript deep type instantiation issue with complex Supabase types
    let redirectLog: RedirectLogResult | null = null;
    try {
      const query = (supabase as unknown as { from: (table: string) => unknown }).from('partner_redirect_logs');
      const result = await (query as {
        select: (cols: string) => {
          eq: (col: string, val: string) => {
            order: (col: string, opts: { ascending: boolean }) => {
              limit: (n: number) => Promise<{ data: RedirectLogResult[] | null; error: unknown }>;
            };
          };
        };
      }).select('id, partner_name, search_type, metadata')
        .eq('session_id', subid)
        .order('created_at', { ascending: false })
        .limit(1);
      
      redirectLog = result.data?.[0] || null;
      if (result.error) {
        console.error('[BookingReturn] Error finding redirect log:', result.error);
      }
    } catch (e) {
      console.error('[BookingReturn] Exception finding redirect log:', e);
    }

    // 3. Update the redirect log with booking result
    if (redirectLog) {
      const updateData: Record<string, unknown> = {
        status: normalizedStatus === 'converted' ? 'returned' : normalizedStatus,
        returned_at: new Date().toISOString(),
      };

      if (bookingRef) {
        updateData.booking_ref = bookingRef;
      }

      if (params.error) {
        updateData.metadata = {
          ...((redirectLog.metadata as Record<string, unknown>) || {}),
          error: params.error,
          errorCode: params.errorCode,
        };
      }

      const { error: updateError } = await supabase
        .from('partner_redirect_logs')
        .update(updateData)
        .eq('id', redirectLog.id);

      if (updateError) {
        console.error('[BookingReturn] Error updating redirect log:', updateError);
      } else {
        console.log('[BookingReturn] Updated redirect log:', redirectLog.id);
      }
    }

    // 4. Log the conversion event
    if (normalizedStatus === 'converted' && bookingRef) {
      let conversionType: 'flights' | 'hotels' | 'cars' = 'flights';
      
      if (type) {
        conversionType = type;
      } else if (searchSession?.type === 'flights' || searchSession?.type === 'hotels' || searchSession?.type === 'cars') {
        conversionType = searchSession.type;
      } else if (redirectLog?.search_type === 'flights' || redirectLog?.search_type === 'hotels' || redirectLog?.search_type === 'cars') {
        conversionType = redirectLog.search_type;
      }
      
      await logConversionEvent({
        subid,
        bookingRef,
        partner: partner || redirectLog?.partner_name || 'unknown',
        type: conversionType,
        searchSessionId: searchSession?.id,
        redirectLogId: redirectLog?.id,
      });
    }

    return {
      success: normalizedStatus === 'converted',
      bookingRef: bookingRef || null,
      status: normalizedStatus,
      searchSession: searchSession ? {
        id: searchSession.id,
        type: searchSession.type,
        origin: searchSession.origin || undefined,
        destination: searchSession.destination || undefined,
      } : null,
      redirectLog: redirectLog ? {
        id: redirectLog.id,
        partnerName: redirectLog.partner_name,
      } : null,
    };

  } catch (error) {
    console.error('[BookingReturn] Processing error:', error);
    return {
      success: false,
      bookingRef: bookingRef || null,
      status: 'unknown',
      searchSession: null,
      redirectLog: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get recent conversions for debugging
 */
export function getRecentConversions(): Array<{
  subid: string;
  bookingRef: string;
  partner: string;
  type: string;
  timestamp: string;
}> {
  return JSON.parse(sessionStorage.getItem('hizovo_conversions') || '[]');
}
