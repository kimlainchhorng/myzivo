import { createClient } from "../_shared/deps.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function money(cents: number | null | undefined) {
  return `$${((cents || 0) / 100).toFixed(2)}`;
}

function escPdf(value: unknown) {
  return String(value ?? "").replace(/[\\()]/g, "\\$&").replace(/[\r\n]+/g, " ");
}

function makePdf(lines: string[]) {
  const content = ["BT", "/F1 18 Tf", "54 760 Td", `(ZIVO Lodging Receipt) Tj`, "/F1 10 Tf", "0 -28 Td"];
  for (const line of lines) content.push(`(${escPdf(line)}) Tj`, "0 -16 Td");
  content.push("ET");
  const stream = content.join("\n");
  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    `5 0 obj << /Length ${new TextEncoder().encode(stream).length} >> stream\n${stream}\nendstream endobj`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (const obj of objects) {
    offsets.push(new TextEncoder().encode(pdf).length);
    pdf += obj + "\n";
  }
  const xref = new TextEncoder().encode(pdf).length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i < offsets.length; i++) pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new TextEncoder().encode(pdf);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") || "";
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "", { global: { headers: { Authorization: authHeader } } });
    const admin = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "unauthenticated" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    let body: any = {};
    if (req.method !== "GET") body = await req.json().catch(() => ({}));
    const url = new URL(req.url);
    const reservationId = url.searchParams.get("reservation_id") || body.reservation_id;
    if (!reservationId) return new Response(JSON.stringify({ error: "missing_reservation_id" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: r, error } = await admin
      .from("lodge_reservations")
      .select("id, store_id, room_id, guest_id, number, guest_name, guest_email, check_in, check_out, nights, room_number, status, payment_status, total_cents, paid_cents, deposit_cents, extras_cents, tax_cents, addons, addon_selections, fee_breakdown")
      .eq("id", reservationId)
      .maybeSingle();
    if (error || !r) return new Response(JSON.stringify({ error: "not_found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: store } = await admin.from("restaurants").select("name, owner_id").eq("id", r.store_id).maybeSingle();
    const { data: room } = await admin.from("lodge_rooms").select("name, room_type, cancellation_policy").eq("id", r.room_id).maybeSingle();
    const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", user.id);
    const isAdmin = (roles || []).some((role: any) => role.role === "admin");
    if (r.guest_id !== user.id && store?.owner_id !== user.id && !isAdmin) {
      return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: charges } = await admin.from("lodge_reservation_charges").select("label, amount_cents, created_at").eq("reservation_id", r.id).order("created_at", { ascending: true });
    const balance = Math.max(0, (r.total_cents || 0) - (r.paid_cents || 0));
    const lines = [
      `Property: ${store?.name || "ZIVO property"}`,
      `Reservation: ${r.number}`,
      `Guest: ${r.guest_name || r.guest_email || "Guest"}`,
      `Stay: ${r.check_in} to ${r.check_out} (${r.nights || 0} nights)`,
      `Room: ${r.room_number || room?.name || room?.room_type || "Assigned room"}`,
      `Reservation status: ${r.status}`,
      `Payment status: ${r.payment_status || "pending"}`,
      `Total: ${money(r.total_cents)}`,
      `Paid: ${money(r.paid_cents)}`,
      `Deposit: ${money(r.deposit_cents)}`,
      `Add-ons/extras: ${money(r.extras_cents)}`,
      `Taxes/fees: ${money(r.tax_cents)}`,
      `Balance: ${money(balance)}`,
      `Cancellation policy: ${room?.cancellation_policy || "Standard ZIVO lodging policy"}`,
      "",
      "Charges:",
      ...((charges || []).length ? (charges || []).map((c: any) => `${c.label}: ${money(c.amount_cents)}`) : ["No extra charges recorded"]),
      "",
      `Generated: ${new Date().toISOString()}`,
    ];

    return new Response(makePdf(lines), {
      headers: { ...corsHeaders, "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="ZIVO-reservation-${r.number}.pdf"` },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String((err as Error).message || err) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
