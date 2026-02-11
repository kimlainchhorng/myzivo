/**
 * Fraud Assessment Edge Function
 * Calculates risk score based on multiple signals and returns decision
 */
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders } from "../_shared/cors.ts";

interface FraudAssessmentRequest {
  orderId?: string;
  userId?: string;
  sessionId?: string;
  orderTotal?: number;
  currency?: string;
  ipAddress?: string;
  userAgent?: string;
  deviceFingerprint?: string;
  geoCountry?: string;
  cardCountry?: string;
  stripeRiskScore?: number;
  stripeRiskLevel?: string;
  bookingDetails?: {
    type: string;
    nights?: number;
    isLuxury?: boolean;
    isLastMinute?: boolean;
  };
}

interface FraudSignal {
  type: string;
  name: string;
  value: string;
  weight: number;
  contribution: number;
  metadata?: Record<string, unknown>;
}

interface ThresholdConfig {
  level: string;
  min_score: number;
  max_score: number;
  default_decision: string;
  auto_action: string | null;
  notify_admin: boolean;
}

// Known disposable email domains
const DISPOSABLE_EMAIL_DOMAINS = [
  "tempmail", "guerrillamail", "10minutemail", "mailinator", 
  "throwaway", "fakeinbox", "temp-mail", "yopmail", "trashmail"
];

// Known VPN/Proxy indicators (simplified)
const VPN_INDICATORS = ["vpn", "proxy", "tor", "datacenter"];

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth: require service role key or authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const token = authHeader.replace("Bearer ", "");
    if (token !== supabaseServiceKey) {
      const authClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user }, error: userError } = await authClient.auth.getUser();
      if (userError || !user) {
        return new Response(
          JSON.stringify({ error: "Invalid authentication" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: FraudAssessmentRequest = await req.json();
    const signals: FraudSignal[] = [];
    let totalScore = 0;

    // ===== SIGNAL 1: Account Age =====
    if (body.userId) {
      const { data: userData } = await supabase.auth.admin.getUserById(body.userId);
      if (userData?.user) {
        const accountAgeDays = Math.floor(
          (Date.now() - new Date(userData.user.created_at).getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (accountAgeDays <= 1) {
          const contribution = 15;
          signals.push({
            type: "account_age",
            name: "New Account (< 24h)",
            value: `${accountAgeDays} days`,
            weight: 15,
            contribution,
          });
          totalScore += contribution;
        } else if (accountAgeDays <= 7) {
          const contribution = 8;
          signals.push({
            type: "account_age",
            name: "Young Account (< 7 days)",
            value: `${accountAgeDays} days`,
            weight: 8,
            contribution,
          });
          totalScore += contribution;
        }

        // Check email domain
        const email = userData.user.email || "";
        const emailDomain = email.split("@")[1]?.toLowerCase() || "";
        const isDisposable = DISPOSABLE_EMAIL_DOMAINS.some(d => emailDomain.includes(d));
        
        if (isDisposable) {
          const contribution = 25;
          signals.push({
            type: "email_reputation",
            name: "Disposable Email Domain",
            value: emailDomain,
            weight: 25,
            contribution,
          });
          totalScore += contribution;
        }
      }
    }

    // ===== SIGNAL 2: Velocity Check =====
    if (body.userId || body.sessionId) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      
      let query = supabase
        .from("travel_orders")
        .select("id", { count: "exact" })
        .gte("created_at", oneHourAgo);
      
      if (body.userId) {
        query = query.eq("user_id", body.userId);
      }
      
      const { count: recentOrders } = await query;
      
      if ((recentOrders || 0) >= 3) {
        const contribution = 30;
        signals.push({
          type: "velocity",
          name: "High Velocity (3+ orders/hour)",
          value: String(recentOrders),
          weight: 30,
          contribution,
        });
        totalScore += contribution;
      } else if ((recentOrders || 0) >= 2) {
        const contribution = 10;
        signals.push({
          type: "velocity",
          name: "Moderate Velocity",
          value: String(recentOrders),
          weight: 10,
          contribution,
        });
        totalScore += contribution;
      }
    }

    // ===== SIGNAL 3: Stripe Risk =====
    if (body.stripeRiskLevel) {
      if (body.stripeRiskLevel === "highest") {
        const contribution = 40;
        signals.push({
          type: "stripe_risk",
          name: "Stripe Highest Risk",
          value: body.stripeRiskLevel,
          weight: 40,
          contribution,
        });
        totalScore += contribution;
      } else if (body.stripeRiskLevel === "elevated") {
        const contribution = 20;
        signals.push({
          type: "stripe_risk",
          name: "Stripe Elevated Risk",
          value: body.stripeRiskLevel,
          weight: 20,
          contribution,
        });
        totalScore += contribution;
      }
    }

    // ===== SIGNAL 4: Geo Mismatch =====
    if (body.geoCountry && body.cardCountry && body.geoCountry !== body.cardCountry) {
      const contribution = 15;
      signals.push({
        type: "geo_mismatch",
        name: "Card Country Mismatch",
        value: `Geo: ${body.geoCountry}, Card: ${body.cardCountry}`,
        weight: 15,
        contribution,
      });
      totalScore += contribution;
    }

    // ===== SIGNAL 5: High Value Order =====
    if (body.orderTotal) {
      if (body.orderTotal > 5000) {
        const contribution = 20;
        signals.push({
          type: "high_value",
          name: "Very High Value Order (> $5000)",
          value: `$${body.orderTotal}`,
          weight: 20,
          contribution,
        });
        totalScore += contribution;
      } else if (body.orderTotal > 2000) {
        const contribution = 10;
        signals.push({
          type: "high_value",
          name: "High Value Order (> $2000)",
          value: `$${body.orderTotal}`,
          weight: 10,
          contribution,
        });
        totalScore += contribution;
      }
    }

    // ===== SIGNAL 6: Chargeback History =====
    if (body.userId) {
      const { data: profile } = await supabase
        .from("user_fraud_profiles")
        .select("chargeback_count, is_blocked")
        .eq("user_id", body.userId)
        .maybeSingle();
      
      if (profile?.is_blocked) {
        const contribution = 100;
        signals.push({
          type: "chargeback_history",
          name: "User is Blocked",
          value: "blocked",
          weight: 100,
          contribution,
        });
        totalScore += contribution;
      } else if (profile?.chargeback_count && profile.chargeback_count > 0) {
        const contribution = 50;
        signals.push({
          type: "chargeback_history",
          name: "Previous Chargebacks",
          value: String(profile.chargeback_count),
          weight: 50,
          contribution,
        });
        totalScore += contribution;
      }
    }

    // ===== SIGNAL 7: VPN Detection (simplified) =====
    const userAgentLower = (body.userAgent || "").toLowerCase();
    const isVpn = VPN_INDICATORS.some(indicator => userAgentLower.includes(indicator));
    if (isVpn) {
      const contribution = 10;
      signals.push({
        type: "vpn_detected",
        name: "VPN/Proxy Detected",
        value: "true",
        weight: 10,
        contribution,
      });
      totalScore += contribution;
    }

    // ===== SIGNAL 8: Booking Pattern =====
    if (body.bookingDetails) {
      const { type, nights, isLuxury, isLastMinute } = body.bookingDetails;
      
      if (type === "hotel" && nights === 1 && isLuxury) {
        const contribution = 12;
        signals.push({
          type: "booking_pattern",
          name: "Luxury Single Night Stay",
          value: "luxury_single_night",
          weight: 12,
          contribution,
        });
        totalScore += contribution;
      }
      
      if (isLastMinute && (body.orderTotal || 0) > 1000) {
        const contribution = 8;
        signals.push({
          type: "booking_pattern",
          name: "Last Minute High Value",
          value: "last_minute_high_value",
          weight: 8,
          contribution,
        });
        totalScore += contribution;
      }
    }

    // ===== SIGNAL 9: Cancellation History =====
    if (body.userId) {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      
      const { count: cancellations } = await supabase
        .from("travel_orders")
        .select("id", { count: "exact" })
        .eq("user_id", body.userId)
        .eq("status", "cancelled")
        .gte("created_at", thirtyDaysAgo);
      
      if ((cancellations || 0) >= 3) {
        const contribution = 15;
        signals.push({
          type: "cancellation_history",
          name: "Multiple Recent Cancellations",
          value: String(cancellations),
          weight: 15,
          contribution,
        });
        totalScore += contribution;
      }
    }

    // ===== SIGNAL 10: Failed Payment Attempts =====
    if (body.userId) {
      const { data: profile } = await supabase
        .from("user_fraud_profiles")
        .select("failed_payment_count")
        .eq("user_id", body.userId)
        .maybeSingle();
      
      if (profile?.failed_payment_count && profile.failed_payment_count >= 2) {
        const contribution = 25;
        signals.push({
          type: "payment_failures",
          name: "Multiple Failed Payments",
          value: String(profile.failed_payment_count),
          weight: 25,
          contribution,
        });
        totalScore += contribution;
      }
    }

    // Cap score at 100
    totalScore = Math.min(100, totalScore);

    // Get thresholds from database
    const { data: thresholds } = await supabase
      .from("fraud_thresholds")
      .select("*")
      .order("min_score", { ascending: true });

    // Determine risk level and decision
    let riskLevel = "low";
    let decision = "allow";
    let autoAction: string | null = null;
    let notifyAdmin = false;

    for (const threshold of (thresholds as ThresholdConfig[] || [])) {
      if (totalScore >= threshold.min_score && totalScore <= threshold.max_score) {
        riskLevel = threshold.level;
        decision = threshold.default_decision;
        autoAction = threshold.auto_action;
        notifyAdmin = threshold.notify_admin;
        break;
      }
    }

    // Build reasons array from signals
    const reasons = signals.map(s => s.name);

    // Insert fraud assessment
    const { data: assessment, error: assessmentError } = await supabase
      .from("fraud_assessments")
      .insert({
        order_id: body.orderId || null,
        user_id: body.userId || null,
        session_id: body.sessionId || null,
        risk_score: totalScore,
        risk_level: riskLevel,
        decision,
        reasons,
        signals: signals,
        ip_address: body.ipAddress || null,
        user_agent: body.userAgent || null,
        device_fingerprint: body.deviceFingerprint || null,
        geo_country: body.geoCountry || null,
        card_country: body.cardCountry || null,
        is_vpn: isVpn,
        stripe_risk_score: body.stripeRiskScore || null,
        stripe_risk_level: body.stripeRiskLevel || null,
      })
      .select()
      .single();

    if (assessmentError) {
      console.error("Error creating fraud assessment:", assessmentError);
      throw new Error("Failed to create fraud assessment");
    }

    // Insert individual signals
    if (signals.length > 0 && assessment) {
      const signalRecords = signals.map(s => ({
        assessment_id: assessment.id,
        signal_type: s.type,
        signal_name: s.name,
        signal_value: s.value,
        weight: s.weight,
        contribution: s.contribution,
        metadata: s.metadata || {},
      }));

      await supabase.from("fraud_signals").insert(signalRecords);
    }

    // Update user fraud profile
    if (body.userId) {
      const { data: existingProfile } = await supabase
        .from("user_fraud_profiles")
        .select("id, total_assessments, lifetime_risk_score, review_count, blocked_count")
        .eq("user_id", body.userId)
        .maybeSingle();

      if (existingProfile) {
        // Update existing profile
        const newTotalAssessments = (existingProfile.total_assessments || 0) + 1;
        const newAvgScore = Math.round(
          ((existingProfile.lifetime_risk_score || 0) * (existingProfile.total_assessments || 0) + totalScore) / newTotalAssessments
        );
        
        await supabase
          .from("user_fraud_profiles")
          .update({
            total_assessments: newTotalAssessments,
            lifetime_risk_score: newAvgScore,
            review_count: decision === "review" ? (existingProfile.review_count || 0) + 1 : existingProfile.review_count,
            blocked_count: decision === "block" ? (existingProfile.blocked_count || 0) + 1 : existingProfile.blocked_count,
            is_blocked: decision === "block" ? true : undefined,
            blocked_at: decision === "block" ? new Date().toISOString() : undefined,
            blocked_reason: decision === "block" ? `Auto-blocked: Risk score ${totalScore}` : undefined,
          })
          .eq("id", existingProfile.id);
      } else {
        // Create new profile
        await supabase.from("user_fraud_profiles").insert({
          user_id: body.userId,
          lifetime_risk_score: totalScore,
          total_assessments: 1,
          review_count: decision === "review" ? 1 : 0,
          blocked_count: decision === "block" ? 1 : 0,
          is_blocked: decision === "block",
          blocked_at: decision === "block" ? new Date().toISOString() : null,
          blocked_reason: decision === "block" ? `Auto-blocked: Risk score ${totalScore}` : null,
        });
      }
    }

    // If decision is block and order exists, update order status
    if (decision === "block" && body.orderId) {
      await supabase
        .from("travel_orders")
        .update({ status: "fraud_blocked" })
        .eq("id", body.orderId);

      // Log audit event
      await supabase.from("booking_audit_logs").insert({
        order_id: body.orderId,
        user_id: body.userId,
        event: "fraud_blocked",
        meta: {
          risk_score: totalScore,
          risk_level: riskLevel,
          reasons,
        },
      });
    }

    // If notify admin, create notification
    if (notifyAdmin && (riskLevel === "medium" || riskLevel === "high" || riskLevel === "critical")) {
      await supabase.from("notifications").insert({
        channel: "in_app",
        template: "fraud_alert",
        title: `${riskLevel.toUpperCase()} Risk Alert`,
        body: `Order ${body.orderId?.slice(0, 8) || "N/A"} flagged with risk score ${totalScore}. Reasons: ${reasons.join(", ")}`,
        status: "sent",
      });
    }

    console.log(`[FraudAssessment] Score: ${totalScore}, Level: ${riskLevel}, Decision: ${decision}`);

    return new Response(
      JSON.stringify({
        success: true,
        assessmentId: assessment?.id,
        riskScore: totalScore,
        riskLevel,
        decision,
        reasons,
        autoAction,
        shouldProceed: decision === "allow",
        requiresReview: decision === "review",
        isBlocked: decision === "block",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: unknown) {
    console.error("[FraudAssessment] Error:", error);
    const message = error instanceof Error ? error.message : "An error occurred";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
