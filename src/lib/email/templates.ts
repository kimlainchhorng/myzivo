/**
 * Hizovo Email Templates
 * 
 * Compliant email templates for travel search/referral platform
 * IMPORTANT: Hizovo is NOT the merchant of record
 */

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface BaseTemplateData {
  recipientEmail: string;
  unsubscribeUrl?: string;
}

interface AbandonedSearchData extends BaseTemplateData {
  origin: string;
  destination: string;
  searchType: 'flights' | 'hotels' | 'cars';
  departureDate?: string;
  returnDate?: string;
  continueSearchUrl: string;
}

interface RedirectConfirmationData extends BaseTemplateData {
  partnerName: string;
  searchType: 'flights' | 'hotels' | 'cars';
  tripSummary: string;
  partnerSupportUrl?: string;
  tripsUrl: string;
}

interface BookingStatusData extends BaseTemplateData {
  status: 'success' | 'pending' | 'unknown';
  bookingRef?: string;
  partnerName: string;
  tripSummary: string;
  tripsUrl: string;
  partnerSupportUrl?: string;
}

interface SupportAutoReplyData extends BaseTemplateData {
  ticketNumber: string;
  category: string;
  subject: string;
  responseWindowHours: number;
  isBookingRelated: boolean;
  partnerName?: string;
  partnerSupportUrl?: string;
}

const FOOTER_HTML = (unsubscribeUrl?: string) => `
  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
    <p style="margin: 0 0 8px 0;">
      <strong>Hizovo LLC</strong><br>
      Travel Search & Comparison Platform
    </p>
    <p style="margin: 0 0 8px 0;">
      Hizovo is a travel search platform. All bookings are completed and fulfilled by our licensed travel partners.<br>
      Hizovo is not the merchant of record and does not process travel payments.
    </p>
    <p style="margin: 0 0 8px 0;">
      Need help? <a href="https://hizovo.com/contact" style="color: #6366f1;">Contact Support</a> | 
      <a href="https://hizovo.com/partner-disclosure" style="color: #6366f1;">Partner Disclosure</a>
    </p>
    ${unsubscribeUrl ? `
    <p style="margin: 0;">
      <a href="${unsubscribeUrl}" style="color: #9ca3af; text-decoration: underline;">Unsubscribe from these emails</a>
    </p>
    ` : ''}
  </div>
`;

const FOOTER_TEXT = (unsubscribeUrl?: string) => `
---
Hizovo LLC - Travel Search & Comparison Platform

Hizovo is a travel search platform. All bookings are completed and fulfilled by our licensed travel partners.
Hizovo is not the merchant of record and does not process travel payments.

Need help? Visit https://hizovo.com/contact
Partner Disclosure: https://hizovo.com/partner-disclosure
${unsubscribeUrl ? `\nUnsubscribe: ${unsubscribeUrl}` : ''}
`;

const HEADER_HTML = `
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #0D0D0F;">
      <span style="color: #6366f1;">Hizovo</span>
    </h1>
    <p style="margin: 4px 0 0 0; font-size: 12px; color: #6b7280;">Travel Search & Comparison</p>
  </div>
`;

/**
 * Abandoned Search Email
 * Sent when user searches but doesn't proceed to partner checkout
 */
export function generateAbandonedSearchEmail(data: AbandonedSearchData): EmailTemplate {
  const searchTypeLabel = data.searchType === 'flights' ? 'flights' : data.searchType === 'hotels' ? 'hotels' : 'car rentals';
  
  const subject = `Still looking for ${data.origin} → ${data.destination}?`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
      ${HEADER_HTML}
      
      <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius: 12px; padding: 30px; text-align: center; color: white; margin-bottom: 24px;">
        <h2 style="margin: 0 0 8px 0; font-size: 24px;">Your ${searchTypeLabel} are waiting!</h2>
        <p style="margin: 0; font-size: 18px; opacity: 0.9;">
          ${data.origin} → ${data.destination}
        </p>
        ${data.departureDate ? `<p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.8;">${data.departureDate}${data.returnDate ? ` - ${data.returnDate}` : ''}</p>` : ''}
      </div>
      
      <p style="font-size: 16px; margin-bottom: 24px;">
        Hi there! We noticed you were searching for ${searchTypeLabel} from <strong>${data.origin}</strong> to <strong>${data.destination}</strong>.
      </p>
      
      <p style="font-size: 16px; margin-bottom: 24px;">
        Great options are still available! Continue your search and compare prices from trusted travel partners.
      </p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${data.continueSearchUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
          Continue Your Search →
        </a>
      </div>
      
      <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin: 24px 0;">
        <p style="margin: 0; font-size: 13px; color: #6b7280;">
          <strong>How it works:</strong> Hizovo helps you search and compare ${searchTypeLabel} from trusted travel partners. 
          Final booking and payment are completed directly with the travel partner of your choice.
        </p>
      </div>
      
      ${FOOTER_HTML(data.unsubscribeUrl)}
    </body>
    </html>
  `;
  
  const text = `
Still looking for ${data.origin} → ${data.destination}?

Hi there! We noticed you were searching for ${searchTypeLabel} from ${data.origin} to ${data.destination}.

Great options are still available! Continue your search and compare prices from trusted travel partners.

Continue Your Search: ${data.continueSearchUrl}

How it works: Hizovo helps you search and compare ${searchTypeLabel} from trusted travel partners. Final booking and payment are completed directly with the travel partner of your choice.

${FOOTER_TEXT(data.unsubscribeUrl)}
  `.trim();
  
  return { subject, html, text };
}

/**
 * Checkout Redirect Confirmation Email
 * Sent when user initiates partner checkout
 */
export function generateRedirectConfirmationEmail(data: RedirectConfirmationData): EmailTemplate {
  const subject = `You're booking with ${data.partnerName}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
      ${HEADER_HTML}
      
      <div style="background: #ecfdf5; border: 1px solid #10b981; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
        <p style="margin: 0; font-size: 16px; color: #065f46;">
          ✈️ You're being redirected to <strong>${data.partnerName}</strong> to complete your booking
        </p>
      </div>
      
      <h2 style="font-size: 20px; margin-bottom: 16px;">Your Trip Summary</h2>
      
      <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <p style="margin: 0; white-space: pre-line;">${data.tripSummary}</p>
      </div>
      
      <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <h3 style="margin: 0 0 8px 0; font-size: 14px; color: #92400e;">⚠️ Important Information</h3>
        <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #78350f;">
          <li>Your booking will be processed by <strong>${data.partnerName}</strong></li>
          <li>${data.partnerName} is the merchant of record for your purchase</li>
          <li>For changes, cancellations, or refunds, contact ${data.partnerName} directly</li>
          ${data.partnerSupportUrl ? `<li><a href="${data.partnerSupportUrl}" style="color: #92400e;">${data.partnerName} Support</a></li>` : ''}
        </ul>
      </div>
      
      <p style="font-size: 14px; margin-bottom: 24px;">
        Once your booking is confirmed by ${data.partnerName}, you'll receive a confirmation email directly from them 
        with your booking reference and travel documents.
      </p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${data.tripsUrl}" style="display: inline-block; background: #1f2937; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          View Your Trips
        </a>
      </div>
      
      ${FOOTER_HTML(data.unsubscribeUrl)}
    </body>
    </html>
  `;
  
  const text = `
You're booking with ${data.partnerName}

You're being redirected to ${data.partnerName} to complete your booking.

YOUR TRIP SUMMARY
${data.tripSummary}

IMPORTANT INFORMATION
• Your booking will be processed by ${data.partnerName}
• ${data.partnerName} is the merchant of record for your purchase
• For changes, cancellations, or refunds, contact ${data.partnerName} directly
${data.partnerSupportUrl ? `• ${data.partnerName} Support: ${data.partnerSupportUrl}` : ''}

Once your booking is confirmed by ${data.partnerName}, you'll receive a confirmation email directly from them with your booking reference and travel documents.

View Your Trips: ${data.tripsUrl}

${FOOTER_TEXT(data.unsubscribeUrl)}
  `.trim();
  
  return { subject, html, text };
}

/**
 * Booking Status Email
 * Sent when user returns from partner checkout
 */
export function generateBookingStatusEmail(data: BookingStatusData): EmailTemplate {
  let subject: string;
  let statusContent: string;
  let statusBadge: string;
  
  if (data.status === 'success' && data.bookingRef) {
    subject = `Booking received: Reference ${data.bookingRef}`;
    statusBadge = `<div style="background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 24px;">
      <p style="margin: 0; font-size: 14px; color: #065f46;">✓ Booking Reference Received</p>
      <p style="margin: 8px 0 0 0; font-size: 24px; font-weight: 700; color: #065f46;">${data.bookingRef}</p>
    </div>`;
    statusContent = `
      <p>Great news! We received confirmation that your booking with <strong>${data.partnerName}</strong> has been initiated.</p>
      <p>Your booking reference is: <strong>${data.bookingRef}</strong></p>
      <p>Please check your email for a confirmation directly from ${data.partnerName} with your complete travel documents and itinerary.</p>
    `;
  } else {
    subject = `Booking status pending`;
    statusBadge = `<div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 24px;">
      <p style="margin: 0; font-size: 14px; color: #92400e;">⏳ Booking Status Pending</p>
    </div>`;
    statusContent = `
      <p>We noticed you returned from <strong>${data.partnerName}</strong>'s checkout.</p>
      <p>If you completed your booking, you should receive a confirmation email directly from ${data.partnerName} shortly.</p>
      <p><strong>Next steps:</strong></p>
      <ul>
        <li>Check your email (including spam folder) for confirmation from ${data.partnerName}</li>
        <li>If you didn't complete checkout, you can <a href="https://hizovo.com" style="color: #6366f1;">search again</a></li>
        <li>For booking questions, contact ${data.partnerName} directly</li>
      </ul>
    `;
  }
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
      ${HEADER_HTML}
      
      ${statusBadge}
      
      <h2 style="font-size: 20px; margin-bottom: 16px;">Trip Summary</h2>
      
      <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <p style="margin: 0; white-space: pre-line;">${data.tripSummary}</p>
      </div>
      
      <div style="margin-bottom: 24px;">
        ${statusContent}
      </div>
      
      <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <h3 style="margin: 0 0 8px 0; font-size: 14px; color: #374151;">Need Help?</h3>
        <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #4b5563;">
          <li><strong>Booking changes/cancellations/refunds:</strong> Contact ${data.partnerName} directly${data.partnerSupportUrl ? ` at <a href="${data.partnerSupportUrl}" style="color: #6366f1;">${data.partnerSupportUrl}</a>` : ''}</li>
          <li><strong>Website issues:</strong> <a href="https://hizovo.com/contact" style="color: #6366f1;">Contact Hizovo Support</a></li>
        </ul>
      </div>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${data.tripsUrl}" style="display: inline-block; background: #1f2937; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          View Your Trips
        </a>
      </div>
      
      ${FOOTER_HTML(data.unsubscribeUrl)}
    </body>
    </html>
  `;
  
  const text = `
${subject}

${data.status === 'success' && data.bookingRef ? `Booking Reference: ${data.bookingRef}` : 'Booking Status Pending'}

TRIP SUMMARY
${data.tripSummary}

${data.status === 'success' && data.bookingRef ? `
Great news! We received confirmation that your booking with ${data.partnerName} has been initiated.
Your booking reference is: ${data.bookingRef}
Please check your email for a confirmation directly from ${data.partnerName} with your complete travel documents and itinerary.
` : `
We noticed you returned from ${data.partnerName}'s checkout.
If you completed your booking, you should receive a confirmation email directly from ${data.partnerName} shortly.

Next steps:
• Check your email (including spam folder) for confirmation from ${data.partnerName}
• If you didn't complete checkout, you can search again at https://hizovo.com
• For booking questions, contact ${data.partnerName} directly
`}

NEED HELP?
• Booking changes/cancellations/refunds: Contact ${data.partnerName} directly${data.partnerSupportUrl ? ` at ${data.partnerSupportUrl}` : ''}
• Website issues: Contact Hizovo Support at https://hizovo.com/contact

View Your Trips: ${data.tripsUrl}

${FOOTER_TEXT(data.unsubscribeUrl)}
  `.trim();
  
  return { subject, html, text };
}

/**
 * Support Auto-Reply Email
 * Sent when user submits a support ticket
 */
export function generateSupportAutoReplyEmail(data: SupportAutoReplyData): EmailTemplate {
  const subject = `[Ticket ${data.ticketNumber}] We received your message`;
  
  const bookingHelpSection = data.isBookingRelated ? `
    <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
      <h3 style="margin: 0 0 8px 0; font-size: 14px; color: #92400e;">📋 Booking-Related Issue?</h3>
      <p style="margin: 0; font-size: 14px; color: #78350f;">
        If your question is about <strong>changes, cancellations, refunds, or booking details</strong>, 
        please contact your booking partner directly. They are the merchant of record and can best assist you.
        ${data.partnerName && data.partnerSupportUrl ? `<br><br><a href="${data.partnerSupportUrl}" style="color: #92400e; font-weight: 600;">Contact ${data.partnerName} Support →</a>` : ''}
      </p>
    </div>
  ` : '';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
      ${HEADER_HTML}
      
      <div style="background: #f0fdf4; border: 1px solid #22c55e; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 24px;">
        <p style="margin: 0; font-size: 14px; color: #166534;">✓ Support ticket received</p>
        <p style="margin: 8px 0 0 0; font-size: 18px; font-weight: 600; color: #166534;">${data.ticketNumber}</p>
      </div>
      
      <p>Hi there,</p>
      
      <p>Thank you for contacting Hizovo Support. We've received your message and will get back to you within <strong>${data.responseWindowHours} hours</strong>.</p>
      
      <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin: 24px 0;">
        <p style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280; text-transform: uppercase;">Your Message</p>
        <p style="margin: 0 0 4px 0; font-weight: 600;">${data.subject}</p>
        <p style="margin: 0; font-size: 12px; color: #6b7280;">Category: ${data.category}</p>
      </div>
      
      ${bookingHelpSection}
      
      <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <h3 style="margin: 0 0 8px 0; font-size: 14px; color: #374151;">What Hizovo Support Can Help With:</h3>
        <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #4b5563;">
          <li>Website navigation and search issues</li>
          <li>Account and profile questions</li>
          <li>Technical problems on hizovo.com</li>
          <li>General inquiries about our service</li>
        </ul>
        <h3 style="margin: 16px 0 8px 0; font-size: 14px; color: #374151;">Contact Your Booking Partner For:</h3>
        <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #4b5563;">
          <li>Booking modifications or cancellations</li>
          <li>Refund requests</li>
          <li>Travel documents and itineraries</li>
          <li>Payment and billing questions</li>
        </ul>
      </div>
      
      <p style="font-size: 14px; color: #6b7280;">
        Please keep this ticket number for your reference: <strong>${data.ticketNumber}</strong>
      </p>
      
      ${FOOTER_HTML(data.unsubscribeUrl)}
    </body>
    </html>
  `;
  
  const text = `
[Ticket ${data.ticketNumber}] We received your message

Hi there,

Thank you for contacting Hizovo Support. We've received your message and will get back to you within ${data.responseWindowHours} hours.

YOUR MESSAGE
Subject: ${data.subject}
Category: ${data.category}

${data.isBookingRelated ? `
BOOKING-RELATED ISSUE?
If your question is about changes, cancellations, refunds, or booking details, please contact your booking partner directly. They are the merchant of record and can best assist you.
${data.partnerName && data.partnerSupportUrl ? `Contact ${data.partnerName} Support: ${data.partnerSupportUrl}` : ''}
` : ''}

WHAT HIZOVO SUPPORT CAN HELP WITH:
• Website navigation and search issues
• Account and profile questions
• Technical problems on hizovo.com
• General inquiries about our service

CONTACT YOUR BOOKING PARTNER FOR:
• Booking modifications or cancellations
• Refund requests
• Travel documents and itineraries
• Payment and billing questions

Please keep this ticket number for your reference: ${data.ticketNumber}

${FOOTER_TEXT(data.unsubscribeUrl)}
  `.trim();
  
  return { subject, html, text };
}
