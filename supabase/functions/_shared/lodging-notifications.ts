import { createClient } from "./deps.ts";

export type LodgingNotificationEvent =
  | "receipt_ready"
  | "receipt_shared"
  | "addon_success"
  | "addon_failed"
  | "cancellation_update"
  | "reschedule_update"
  | "refund_dispute_submitted"
  | "refund_dispute_update";

type NotifyOptions = {
  reservationId: string;
  event: LodgingNotificationEvent;
  templateName: string;
  idempotencyKey: string;
  title: string;
  message: string;
  templateData?: Record<string, unknown>;
  smsBody?: string;
};

const maskEmail = (email?: string | null) => email ? email.replace(/(^.).*(@.*$)/, "$1***$2") : null;
const maskPhone = (phone?: string | null) => phone ? `***${phone.slice(-4)}` : null;

async function audit(admin: any, row: Record<string, unknown>) {
  await admin.from("notification_audit").insert(row).then(() => null);
}

async function sendSms(to: string, body: string) {
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  const twilioKey = Deno.env.get("TWILIO_API_KEY");
  const from = Deno.env.get("TWILIO_FROM_NUMBER") || Deno.env.get("TWILIO_PHONE_NUMBER");
  if (!lovableKey || !twilioKey || !from) return { skipped: true, reason: "sms_not_configured" };
  const res = await fetch("https://connector-gateway.lovable.dev/twilio/Messages.json", {
    method: "POST",
    headers: { Authorization: `Bearer ${lovableKey}`, "X-Connection-Api-Key": twilioKey, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ To: to, From: from, Body: body.slice(0, 1200) }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(JSON.stringify(data));
  return { skipped: false, provider_id: data.sid as string | undefined };
}

export async function notifyLodgingReservation(admin: ReturnType<typeof createClient>, options: NotifyOptions) {
  try {
    const { data: r } = await admin
      .from("lodge_reservations")
      .select("id, number, guest_id, guest_email, guest_phone, guest_name, check_in, check_out, payment_status, status, store_id")
      .eq("id", options.reservationId)
      .maybeSingle();
    if (!r) return;
    const { data: store } = await admin.from("restaurants").select("name").eq("id", r.store_id).maybeSingle();
    const data = { reservationNumber: r.number, propertyName: store?.name || "Your stay", guestName: r.guest_name || "Guest", checkIn: r.check_in, checkOut: r.check_out, status: r.status, paymentStatus: r.payment_status, message: options.message, title: options.title, ...options.templateData };

    if (r.guest_email) {
      try {
        await admin.functions.invoke("send-transactional-email", { body: { templateName: options.templateName, recipientEmail: r.guest_email, idempotencyKey: options.idempotencyKey, templateData: data } });
        await audit(admin, { user_id: r.guest_id, channel: "email", event_type: options.event, destination_masked: maskEmail(r.guest_email), status: "queued", metadata: { reservation_id: r.id, template: options.templateName } });
      } catch (e) {
        await audit(admin, { user_id: r.guest_id, channel: "email", event_type: options.event, destination_masked: maskEmail(r.guest_email), status: "failed", error: String((e as Error).message || e), metadata: { reservation_id: r.id } });
      }
    }

    if (options.smsBody) {
      try {
        const { data: prefs } = await admin.from("notification_preferences").select("sms_enabled, operational_enabled, phone_number, phone_verified").eq("user_id", r.guest_id).maybeSingle();
        const smsAllowed = prefs?.sms_enabled === true && prefs?.operational_enabled !== false;
        const phone = prefs?.phone_number || r.guest_phone;
        if (!smsAllowed) {
          await audit(admin, { user_id: r.guest_id, channel: "sms", event_type: options.event, destination_masked: maskPhone(phone), status: "skipped", skip_reason: "sms_disabled", metadata: { reservation_id: r.id } });
        } else if (!phone) {
          await audit(admin, { user_id: r.guest_id, channel: "sms", event_type: options.event, destination_masked: null, status: "skipped", skip_reason: "phone_missing", metadata: { reservation_id: r.id } });
        } else if (prefs?.phone_verified === false) {
          await audit(admin, { user_id: r.guest_id, channel: "sms", event_type: options.event, destination_masked: maskPhone(phone), status: "skipped", skip_reason: "phone_not_verified", metadata: { reservation_id: r.id } });
        } else {
        const sms = await sendSms(phone, options.smsBody);
        await audit(admin, { user_id: r.guest_id, channel: "sms", event_type: options.event, destination_masked: maskPhone(r.guest_phone), provider_id: sms.provider_id || null, status: sms.skipped ? "skipped" : "sent", skip_reason: sms.reason || null, metadata: { reservation_id: r.id } });
        }
      } catch (e) {
        await audit(admin, { user_id: r.guest_id, channel: "sms", event_type: options.event, destination_masked: maskPhone(r.guest_phone), status: "failed", error: String((e as Error).message || e), metadata: { reservation_id: r.id } });
      }
    }
  } catch (e) {
    console.warn("[lodging-notifications] skipped", e);
  }
}
