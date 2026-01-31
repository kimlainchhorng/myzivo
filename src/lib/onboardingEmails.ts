import { supabase } from "@/integrations/supabase/client";

/**
 * Email Onboarding Sequence
 * 
 * Email 1: Welcome - Sent immediately on signup
 * Email 2: How It Works - Day 1
 * Email 3: Trust & Transparency - Day 3
 * Email 4: Popular Searches - Day 5
 */

type EmailType = "welcome" | "how_it_works" | "trust" | "popular";

interface SendOnboardingEmailParams {
  email: string;
  firstName: string;
  emailType: EmailType;
}

export async function sendOnboardingEmail({
  email,
  firstName,
  emailType,
}: SendOnboardingEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke("send-onboarding-email", {
      body: {
        email,
        firstName,
        emailType,
      },
    });

    if (error) {
      console.error("Failed to send onboarding email:", error);
      return { success: false, error: error.message };
    }

    console.log(`Onboarding email (${emailType}) sent successfully:`, data);
    return { success: true };
  } catch (err: any) {
    console.error("Error sending onboarding email:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Send welcome email immediately after signup
 */
export async function sendWelcomeEmail(email: string, firstName: string) {
  return sendOnboardingEmail({ email, firstName, emailType: "welcome" });
}

/**
 * Send the complete onboarding sequence
 * This is typically called from a cron job or scheduled function
 */
export const EMAIL_SEQUENCE = [
  { type: "welcome" as EmailType, dayOffset: 0, description: "Welcome email - sent immediately" },
  { type: "how_it_works" as EmailType, dayOffset: 1, description: "How ZIVO works - Day 1" },
  { type: "trust" as EmailType, dayOffset: 3, description: "Trust & Transparency - Day 3" },
  { type: "popular" as EmailType, dayOffset: 5, description: "Popular Searches - Day 5" },
];

/**
 * Helper to determine which email to send based on days since signup
 */
export function getEmailTypeForDay(daysSinceSignup: number): EmailType | null {
  const emailForDay = EMAIL_SEQUENCE.find(e => e.dayOffset === daysSinceSignup);
  return emailForDay?.type || null;
}
