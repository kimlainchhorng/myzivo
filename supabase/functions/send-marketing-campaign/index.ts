// send-marketing-campaign — fan-out marketing campaign sends across push/email/sms/inapp.
// Supports test sends (single recipient) and full audience sends with batched event writes.
import { createClient } from "../_shared/deps.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type Channel = "push" | "email" | "sms" | "inapp";

function detectChannels(c: any): Channel[] {
  const out: Channel[] = [];
  if (c.push_enabled) out.push("push");
  if (c.email_enabled) out.push("email");
  if (c.sms_enabled) out.push("sms");
  if (!out.length && c.notification_title) out.push("push");
  return out;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization");
    const isCron = auth === `Bearer ${Deno.env.get("CRON_SECRET")}`;

    if (!isCron && (!auth || !auth.startsWith("Bearer "))) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(url, serviceKey);

    let userId: string | null = null;
    if (!isCron) {
      const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: auth! } },
      });
      const token = auth!.replace("Bearer ", "");
      const { data, error } = await userClient.auth.getClaims(token);
      if (error || !data?.claims) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      userId = data.claims.sub as string;
    }

    const body = await req.json();
    const campaignId = String(body?.campaign_id || "");
    const isTest = !!body?.is_test;
    const testRecipient = body?.test_recipient_user_id || userId;

    if (!campaignId) {
      return new Response(JSON.stringify({ error: "campaign_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Load campaign
    const { data: campaign, error: campErr } = await admin
      .from("marketing_campaigns")
      .select("*")
      .eq("id", campaignId)
      .maybeSingle();
    if (campErr || !campaign) {
      return new Response(JSON.stringify({ error: "Campaign not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const storeId = campaign.target_restaurant_id;
    const channels = detectChannels(campaign);

    // ── Test send ──
    if (isTest) {
      if (!testRecipient) {
        return new Response(JSON.stringify({ error: "No test recipient" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      for (const ch of channels) {
        await admin.from("marketing_test_sends").insert({
          store_id: storeId,
          channel: ch,
          payload_jsonb: {
            campaign_id: campaignId,
            title: campaign.notification_title || campaign.title,
            body: campaign.notification_body || campaign.message,
          },
          sent_by: userId || testRecipient,
        });
      }
      // Best-effort push to operator
      if (channels.includes("push")) {
        await admin.functions.invoke("send-push-notification", {
          body: {
            user_id: testRecipient,
            title: `[TEST] ${campaign.notification_title || campaign.title || "Campaign"}`,
            body: campaign.notification_body || campaign.message || "",
          },
        }).catch(() => {});
      }
      return new Response(JSON.stringify({ ok: true, recipients: 1, test: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Resolve audience ──
    let recipientIds: string[] = [];
    if (campaign.target_segment_id) {
      const { data: members } = await admin
        .from("marketing_segment_members" as any)
        .select("user_id")
        .eq("segment_id", campaign.target_segment_id)
        .limit(50000);
      recipientIds = ((members as any[]) || []).map((m: any) => m.user_id).filter(Boolean);
    } else {
      // Fallback: all profiles in city, or all
      const q = admin.from("profiles").select("id").limit(10000);
      if (campaign.target_city) q.eq("city", campaign.target_city);
      const { data: profiles } = await q;
      recipientIds = ((profiles as any[]) || []).map((p: any) => p.id);
    }

    let sent = 0;
    let errors = 0;
    const batches = Math.ceil(recipientIds.length / 500);

    // Insert sent events in batches
    for (let i = 0; i < recipientIds.length; i += 500) {
      const chunk = recipientIds.slice(i, i + 500);
      const events = chunk.flatMap((uid: string) =>
        channels.map((ch) => ({
          campaign_id: campaignId,
          store_id: storeId,
          user_id: uid,
          channel: ch,
          event_type: "sent",
        }))
      );
      const { error } = await admin.from("marketing_campaign_events" as any).insert(events);
      if (error) errors++;
      else sent += chunk.length;

      // Push channel: best-effort fan-out
      if (channels.includes("push")) {
        for (const uid of chunk) {
          admin.functions.invoke("send-push-notification", {
            body: {
              user_id: uid,
              title: campaign.notification_title || campaign.title || "",
              body: campaign.notification_body || campaign.message || "",
              data: { campaign_id: campaignId },
            },
          }).catch(() => {});
        }
      }

      // In-app notifications
      if (channels.includes("inapp" as any) || campaign.campaign_type === "inapp") {
        const notifs = chunk.map((uid: string) => ({
          user_id: uid,
          title: campaign.notification_title || campaign.title || "Update",
          message: campaign.notification_body || campaign.message || "",
          type: "marketing",
          metadata: { campaign_id: campaignId },
        }));
        await admin.from("notifications" as any).insert(notifs).catch(() => {});
      }
    }

    // Mark campaign as sent
    await admin
      .from("marketing_campaigns")
      .update({ status: "sent", sent_at: new Date().toISOString() })
      .eq("id", campaignId);

    return new Response(
      JSON.stringify({ ok: true, recipients: sent, batches, errors, channels }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("[send-marketing-campaign] error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
