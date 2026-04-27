/**
 * notify-store-expiries — daily scheduler.
 *
 * Scans `store_documents` for items expiring within 7 days, and
 * `store_training_assignments` for items past their `due_date` that are
 * not yet completed. For each finding, writes a row to `store_audit_log`
 * (resource_type = 'system', action = 'notify_expiry' / 'notify_overdue')
 * so managers see it in the in-app feed. Best-effort push notifications
 * are sent if `send-push-notification` is reachable.
 */
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface DocRow {
  id: string;
  store_id: string;
  name: string;
  expires_at: string;
}

interface AssignmentRow {
  id: string;
  store_id: string;
  employee_id: string;
  due_date: string;
  status: string;
  program_id: string;
}

async function bestEffortPush(
  supabase: ReturnType<typeof createClient>,
  userIds: string[],
  title: string,
  body: string,
  data: Record<string, unknown>,
) {
  if (userIds.length === 0) return;
  try {
    await supabase.functions.invoke("send-push-notification", {
      body: { user_ids: userIds, title, body, data },
    });
  } catch (e) {
    console.warn("[notify-store-expiries] push failed", e);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  let docCount = 0;
  let overdueCount = 0;

  // ---------- Documents expiring within 7 days ----------
  const { data: docs, error: docErr } = await supabase
    .from("store_documents")
    .select("id, store_id, name, expires_at")
    .gte("expires_at", now.toISOString())
    .lte("expires_at", in7Days.toISOString());

  if (docErr) {
    console.error("[notify-store-expiries] docs query failed", docErr);
  } else {
    for (const d of (docs || []) as DocRow[]) {
      // Audit row
      await supabase.from("store_audit_log").insert({
        store_id: d.store_id,
        actor_user_id: null,
        action: "notify_expiry",
        resource_type: "system",
        resource_id: d.id,
        diff: { document_name: d.name, expires_at: d.expires_at },
      });

      // Find managers of this store via the helper-backed view
      const { data: mgrs } = await supabase
        .from("store_employees")
        .select("user_id")
        .eq("store_id", d.store_id)
        .in("role", ["owner", "manager", "supervisor"]);
      const userIds = Array.from(
        new Set((mgrs || []).map((m: any) => m.user_id).filter(Boolean)),
      );
      const days = Math.max(
        1,
        Math.round((new Date(d.expires_at).getTime() - now.getTime()) / 86_400_000),
      );
      await bestEffortPush(
        supabase,
        userIds,
        "Document expiring soon",
        `${d.name} expires in ${days} day${days === 1 ? "" : "s"}.`,
        { type: "document_expiry", store_id: d.store_id, document_id: d.id },
      );
      docCount += 1;
    }
  }

  // ---------- Training assignments past due ----------
  const { data: overdue, error: ovErr } = await supabase
    .from("store_training_assignments")
    .select("id, store_id, employee_id, due_date, status, program_id")
    .lt("due_date", now.toISOString())
    .neq("status", "completed");

  if (ovErr) {
    console.error("[notify-store-expiries] overdue query failed", ovErr);
  } else {
    for (const a of (overdue || []) as AssignmentRow[]) {
      await supabase.from("store_audit_log").insert({
        store_id: a.store_id,
        actor_user_id: null,
        action: "notify_overdue",
        resource_type: "system",
        resource_id: a.id,
        diff: { employee_id: a.employee_id, due_date: a.due_date, program_id: a.program_id },
      });

      // Notify the assignee directly (employee → user_id lookup)
      const { data: emp } = await supabase
        .from("store_employees")
        .select("user_id")
        .eq("id", a.employee_id)
        .maybeSingle();
      const uid = (emp as any)?.user_id;
      if (uid) {
        await bestEffortPush(
          supabase,
          [uid],
          "Training overdue",
          "You have a training assignment past its due date.",
          { type: "training_overdue", assignment_id: a.id },
        );
      }
      overdueCount += 1;
    }
  }

  const summary = { docs_notified: docCount, overdue_notified: overdueCount };
  console.log("[notify-store-expiries]", summary);
  return new Response(JSON.stringify(summary), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
});
