import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
// For testing, use onboarding@resend.dev. For production, verify your domain at https://resend.com/domains
const FROM_EMAIL = Deno.env.get("ZIVO_FROM_EMAIL") || "ZIVO <onboarding@resend.dev>";

async function sendEmail(to: string, subject: string, html: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [to],
      subject,
      html,
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API error: ${error}`);
  }
  
  return response.json();
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface OnboardingEmailRequest {
  email: string;
  firstName: string;
  emailType: "welcome" | "how_it_works" | "trust" | "popular";
}

const BASE_URL = "https://hizivo.com";

// Email templates
const emailTemplates = {
  welcome: {
    subject: "Welcome to ZIVO — Search & Compare Travel Worldwide",
    getHtml: (firstName: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ZIVO</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0b; color: #fafafa;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Logo -->
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="font-size: 28px; font-weight: bold; margin: 0;">
        <span style="background: linear-gradient(135deg, #10b981, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">ZIVO</span>
      </h1>
    </div>
    
    <!-- Main Content -->
    <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(99, 102, 241, 0.1)); border-radius: 16px; padding: 32px; border: 1px solid rgba(255,255,255,0.1);">
      <h2 style="font-size: 24px; margin: 0 0 16px 0; color: #fafafa;">Hi ${firstName},</h2>
      
      <p style="font-size: 16px; line-height: 1.6; color: #a1a1aa; margin: 0 0 24px 0;">
        Welcome to ZIVO 👋
      </p>
      
      <p style="font-size: 16px; line-height: 1.6; color: #a1a1aa; margin: 0 0 24px 0;">
        ZIVO helps you search and compare flights, hotels, and car rentals from trusted travel partners — all in one place.
      </p>
      
      <h3 style="font-size: 18px; color: #fafafa; margin: 0 0 16px 0;">How it works:</h3>
      
      <div style="margin-bottom: 24px;">
        <p style="font-size: 15px; color: #a1a1aa; margin: 8px 0;">
          <span style="color: #10b981; font-weight: bold;">1.</span> Search on ZIVO
        </p>
        <p style="font-size: 15px; color: #a1a1aa; margin: 8px 0;">
          <span style="color: #10b981; font-weight: bold;">2.</span> Compare options from our partners
        </p>
        <p style="font-size: 15px; color: #a1a1aa; margin: 8px 0;">
          <span style="color: #10b981; font-weight: bold;">3.</span> Book securely on the partner site
        </p>
      </div>
      
      <p style="font-size: 14px; line-height: 1.6; color: #71717a; margin: 0 0 32px 0; padding: 16px; background: rgba(0,0,0,0.3); border-radius: 8px;">
        ZIVO does not sell tickets or process payments. When you're ready to book, you'll be redirected to our trusted travel partners to complete your reservation.
      </p>
      
      <h3 style="font-size: 18px; color: #fafafa; margin: 0 0 16px 0;">Get started:</h3>
      
      <!-- CTAs -->
      <div style="margin-bottom: 24px;">
        <a href="${BASE_URL}/book-flight" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9, #6366f1); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 4px 8px 4px 0;">✈️ Search Flights</a>
        <a href="${BASE_URL}/book-hotel" style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #ef4444); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 4px 8px 4px 0;">🏨 Search Hotels</a>
        <a href="${BASE_URL}/rent-car" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6, #ec4899); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 4px 8px 4px 0;">🚗 Rent a Car</a>
      </div>
      
      <p style="font-size: 16px; line-height: 1.6; color: #a1a1aa; margin: 24px 0 0 0;">
        Happy travels,<br/>
        <strong style="color: #fafafa;">The ZIVO Team</strong>
      </p>
    </div>
    
    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.1);">
      <p style="font-size: 12px; color: #71717a; margin: 0 0 8px 0;">
        ZIVO is a travel search and comparison platform.
      </p>
      <p style="font-size: 12px; color: #71717a; margin: 0 0 16px 0;">
        ZIVO may earn a commission when users book through partner links.
      </p>
      <p style="font-size: 12px; color: #52525b; margin: 0;">
        <a href="${BASE_URL}/privacy" style="color: #71717a; text-decoration: underline;">Privacy Policy</a> | 
        <a href="${BASE_URL}/terms" style="color: #71717a; text-decoration: underline;">Terms of Service</a>
      </p>
    </div>
  </div>
</body>
</html>
    `,
  },

  how_it_works: {
    subject: "How ZIVO Helps You Find the Best Travel Options",
    getHtml: (firstName: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>How ZIVO Works</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0b; color: #fafafa;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="font-size: 28px; font-weight: bold; margin: 0;">
        <span style="background: linear-gradient(135deg, #10b981, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">ZIVO</span>
      </h1>
    </div>
    
    <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(99, 102, 241, 0.1)); border-radius: 16px; padding: 32px; border: 1px solid rgba(255,255,255,0.1);">
      <h2 style="font-size: 24px; margin: 0 0 16px 0; color: #fafafa;">Hi ${firstName},</h2>
      
      <p style="font-size: 16px; line-height: 1.6; color: #a1a1aa; margin: 0 0 24px 0;">
        Here's how to get the most out of ZIVO:
      </p>
      
      <!-- Flights -->
      <div style="background: rgba(14, 165, 233, 0.1); border-radius: 12px; padding: 20px; margin-bottom: 16px; border-left: 4px solid #0ea5e9;">
        <h3 style="font-size: 18px; color: #0ea5e9; margin: 0 0 8px 0;">✈️ Flights</h3>
        <p style="font-size: 14px; color: #a1a1aa; margin: 0;">Compare hundreds of airlines and routes worldwide.</p>
      </div>
      
      <!-- Hotels -->
      <div style="background: rgba(245, 158, 11, 0.1); border-radius: 12px; padding: 20px; margin-bottom: 16px; border-left: 4px solid #f59e0b;">
        <h3 style="font-size: 18px; color: #f59e0b; margin: 0 0 8px 0;">🏨 Hotels</h3>
        <p style="font-size: 14px; color: #a1a1aa; margin: 0;">Find hotels and stays from trusted partners.</p>
      </div>
      
      <!-- Car Rental -->
      <div style="background: rgba(139, 92, 246, 0.1); border-radius: 12px; padding: 20px; margin-bottom: 24px; border-left: 4px solid #8b5cf6;">
        <h3 style="font-size: 18px; color: #8b5cf6; margin: 0 0 8px 0;">🚗 Car Rental</h3>
        <p style="font-size: 14px; color: #a1a1aa; margin: 0;">Compare rental cars at airports and cities worldwide.</p>
      </div>
      
      <p style="font-size: 14px; line-height: 1.6; color: #71717a; margin: 0 0 24px 0; padding: 16px; background: rgba(0,0,0,0.3); border-radius: 8px;">
        You can search and compare for free. When you book, you'll be redirected to our partner to complete payment securely.
      </p>
      
      <h3 style="font-size: 18px; color: #fafafa; margin: 0 0 16px 0;">Start comparing:</h3>
      
      <div style="margin-bottom: 16px;">
        <a href="${BASE_URL}/book-flight" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9, #6366f1); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 4px 8px 4px 0;">👉 Search Flights</a>
        <a href="${BASE_URL}/book-hotel" style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #ef4444); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 4px 8px 4px 0;">👉 Search Hotels</a>
        <a href="${BASE_URL}/rent-car" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6, #ec4899); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 4px 8px 4px 0;">👉 Rent a Car</a>
      </div>
    </div>
    
    <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.1);">
      <p style="font-size: 12px; color: #71717a; margin: 0 0 8px 0;">ZIVO is a travel search and comparison platform.</p>
      <p style="font-size: 12px; color: #71717a; margin: 0 0 16px 0;">ZIVO may earn a commission when users book through partner links.</p>
      <p style="font-size: 12px; color: #52525b; margin: 0;">
        <a href="${BASE_URL}/privacy" style="color: #71717a; text-decoration: underline;">Privacy Policy</a> | 
        <a href="${BASE_URL}/terms" style="color: #71717a; text-decoration: underline;">Terms of Service</a>
      </p>
    </div>
  </div>
</body>
</html>
    `,
  },

  trust: {
    subject: "Is ZIVO Free to Use? Yes.",
    getHtml: (firstName: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ZIVO is Free</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0b; color: #fafafa;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="font-size: 28px; font-weight: bold; margin: 0;">
        <span style="background: linear-gradient(135deg, #10b981, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">ZIVO</span>
      </h1>
    </div>
    
    <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(99, 102, 241, 0.1)); border-radius: 16px; padding: 32px; border: 1px solid rgba(255,255,255,0.1);">
      <h2 style="font-size: 24px; margin: 0 0 16px 0; color: #fafafa;">Hi ${firstName},</h2>
      
      <p style="font-size: 20px; line-height: 1.6; color: #10b981; font-weight: bold; margin: 0 0 24px 0;">
        ZIVO is free to use.
      </p>
      
      <div style="margin-bottom: 24px;">
        <p style="font-size: 16px; color: #a1a1aa; margin: 8px 0;">
          ✅ We don't charge booking fees.
        </p>
        <p style="font-size: 16px; color: #a1a1aa; margin: 8px 0;">
          ✅ We don't process payments.
        </p>
      </div>
      
      <p style="font-size: 14px; line-height: 1.6; color: #71717a; margin: 0 0 24px 0; padding: 16px; background: rgba(0,0,0,0.3); border-radius: 8px;">
        ZIVO may earn a commission when users book through partner links — at no extra cost to you. This helps us keep the platform free and improving.
      </p>
      
      <p style="font-size: 16px; line-height: 1.6; color: #a1a1aa; margin: 0 0 32px 0;">
        Your booking and payment are always handled securely on our partners' websites.
      </p>
      
      <h3 style="font-size: 18px; color: #fafafa; margin: 0 0 16px 0;">Start planning your next trip:</h3>
      
      <div style="margin-bottom: 16px;">
        <a href="${BASE_URL}/book-flight" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9, #6366f1); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 4px 8px 4px 0;">👉 Compare Flights</a>
        <a href="${BASE_URL}/book-hotel" style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #ef4444); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 4px 8px 4px 0;">👉 Compare Hotels</a>
        <a href="${BASE_URL}/rent-car" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6, #ec4899); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 4px 8px 4px 0;">👉 Compare Car Rentals</a>
      </div>
    </div>
    
    <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.1);">
      <p style="font-size: 12px; color: #71717a; margin: 0 0 8px 0;">ZIVO is a travel search and comparison platform.</p>
      <p style="font-size: 12px; color: #71717a; margin: 0 0 16px 0;">ZIVO may earn a commission when users book through partner links.</p>
      <p style="font-size: 12px; color: #52525b; margin: 0;">
        <a href="${BASE_URL}/privacy" style="color: #71717a; text-decoration: underline;">Privacy Policy</a> | 
        <a href="${BASE_URL}/terms" style="color: #71717a; text-decoration: underline;">Terms of Service</a>
      </p>
    </div>
  </div>
</body>
</html>
    `,
  },

  popular: {
    subject: "Popular Travel Searches Right Now",
    getHtml: (firstName: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Popular Searches</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0b; color: #fafafa;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="text-align: center; margin-bottom: 32px;">
      <h1 style="font-size: 28px; font-weight: bold; margin: 0;">
        <span style="background: linear-gradient(135deg, #10b981, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">ZIVO</span>
      </h1>
    </div>
    
    <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(99, 102, 241, 0.1)); border-radius: 16px; padding: 32px; border: 1px solid rgba(255,255,255,0.1);">
      <h2 style="font-size: 24px; margin: 0 0 16px 0; color: #fafafa;">Hi ${firstName},</h2>
      
      <p style="font-size: 16px; line-height: 1.6; color: #a1a1aa; margin: 0 0 24px 0;">
        Here are some popular searches travelers are exploring on ZIVO:
      </p>
      
      <!-- Popular Flights -->
      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 18px; color: #0ea5e9; margin: 0 0 12px 0;">🔥 Popular Flights</h3>
        <p style="font-size: 14px; color: #a1a1aa; margin: 4px 0;">• <a href="${BASE_URL}/flights/new-york-to-london" style="color: #0ea5e9; text-decoration: none;">New York → London</a></p>
        <p style="font-size: 14px; color: #a1a1aa; margin: 4px 0;">• <a href="${BASE_URL}/flights/los-angeles-to-new-york" style="color: #0ea5e9; text-decoration: none;">Los Angeles → New York</a></p>
        <p style="font-size: 14px; color: #a1a1aa; margin: 4px 0;">• <a href="${BASE_URL}/flights/chicago-to-miami" style="color: #0ea5e9; text-decoration: none;">Chicago → Miami</a></p>
      </div>
      
      <!-- Popular Destinations -->
      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 18px; color: #f59e0b; margin: 0 0 12px 0;">🏨 Popular Destinations</h3>
        <p style="font-size: 14px; color: #a1a1aa; margin: 4px 0;">• <a href="${BASE_URL}/hotels/new-york" style="color: #f59e0b; text-decoration: none;">New York</a></p>
        <p style="font-size: 14px; color: #a1a1aa; margin: 4px 0;">• <a href="${BASE_URL}/hotels/paris" style="color: #f59e0b; text-decoration: none;">Paris</a></p>
        <p style="font-size: 14px; color: #a1a1aa; margin: 4px 0;">• <a href="${BASE_URL}/hotels/dubai" style="color: #f59e0b; text-decoration: none;">Dubai</a></p>
      </div>
      
      <!-- Popular Car Rentals -->
      <div style="margin-bottom: 32px;">
        <h3 style="font-size: 18px; color: #8b5cf6; margin: 0 0 12px 0;">🚗 Popular Car Rentals</h3>
        <p style="font-size: 14px; color: #a1a1aa; margin: 4px 0;">• <a href="${BASE_URL}/rent-car/los-angeles" style="color: #8b5cf6; text-decoration: none;">Los Angeles Airport</a></p>
        <p style="font-size: 14px; color: #a1a1aa; margin: 4px 0;">• <a href="${BASE_URL}/rent-car/miami" style="color: #8b5cf6; text-decoration: none;">Miami Airport</a></p>
        <p style="font-size: 14px; color: #a1a1aa; margin: 4px 0;">• <a href="${BASE_URL}/rent-car/orlando" style="color: #8b5cf6; text-decoration: none;">Orlando Airport</a></p>
      </div>
      
      <p style="font-size: 16px; line-height: 1.6; color: #a1a1aa; margin: 0 0 16px 0;">
        Click any option to see available deals:
      </p>
      
      <div style="margin-bottom: 16px;">
        <a href="${BASE_URL}/book-flight" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9, #6366f1); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 4px 8px 4px 0;">👉 Search Flights</a>
        <a href="${BASE_URL}/book-hotel" style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #ef4444); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 4px 8px 4px 0;">👉 Search Hotels</a>
        <a href="${BASE_URL}/rent-car" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6, #ec4899); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 4px 8px 4px 0;">👉 Rent a Car</a>
      </div>
    </div>
    
    <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.1);">
      <p style="font-size: 12px; color: #71717a; margin: 0 0 8px 0;">ZIVO is a travel search and comparison platform.</p>
      <p style="font-size: 12px; color: #71717a; margin: 0 0 16px 0;">ZIVO may earn a commission when users book through partner links.</p>
      <p style="font-size: 12px; color: #52525b; margin: 0;">
        <a href="${BASE_URL}/privacy" style="color: #71717a; text-decoration: underline;">Privacy Policy</a> | 
        <a href="${BASE_URL}/terms" style="color: #71717a; text-decoration: underline;">Terms of Service</a>
      </p>
    </div>
  </div>
</body>
</html>
    `,
  },
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName, emailType }: OnboardingEmailRequest = await req.json();

    if (!email || !firstName || !emailType) {
      throw new Error("Missing required fields: email, firstName, emailType");
    }

    const template = emailTemplates[emailType];
    if (!template) {
      throw new Error(`Invalid email type: ${emailType}`);
    }

    const emailResponse = await sendEmail(
      email,
      template.subject,
      template.getHtml(firstName)
    );

    console.log(`Onboarding email (${emailType}) sent successfully to ${email}:`, emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailType,
        messageId: emailResponse.id 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-onboarding-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
