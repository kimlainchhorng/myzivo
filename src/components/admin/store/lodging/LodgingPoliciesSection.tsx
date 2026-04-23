import { ShieldCheck } from "lucide-react";
import { LoadingPanel, NextActions, PolicySummary, SectionShell, StatCard, useLodgingOpsData } from "./LodgingOperationsShared";

export default function LodgingPoliciesSection({ storeId }: { storeId: string }) {
  const { rooms, profile, isLoading } = useLodgingOpsData(storeId);
  const rules = profile?.house_rules || {};
  return (
    <SectionShell title="Policies & Rules" subtitle="Check-in, cancellation, deposit, child, pet, payment, and house-rule status." icon={ShieldCheck}>
      {isLoading ? <LoadingPanel /> : <>
        <div className="grid gap-3 sm:grid-cols-3"><StatCard label="Payment methods" value={String(profile?.payment_methods?.length || 0)} icon={ShieldCheck} /><StatCard label="Currencies" value={String(profile?.currencies_accepted?.length || 0)} icon={ShieldCheck} /><StatCard label="House rules" value={Object.keys(rules).length ? "Set" : "Missing"} icon={ShieldCheck} /></div>
        <PolicySummary profile={profile} rooms={rooms} />
        <div className="rounded-lg border border-border bg-muted/20 p-3 text-sm text-muted-foreground">Quiet hours: <span className="font-medium text-foreground">{rules.quiet_hours || [rules.quiet_from, rules.quiet_to].filter(Boolean).join("–") || "Not set"}</span> · Parties: <span className="font-medium text-foreground">{rules.parties_allowed ? "Allowed" : "Not allowed / not set"}</span> · Smoking: <span className="font-medium text-foreground">{rules.smoking_zones || "Not set"}</span></div>
        <NextActions actions={[{ label: "Edit property policies", tab: "lodge-property", hint: "Set check-in/out, deposit, contact, pet, and child policies." }, { label: "Edit amenities policies", tab: "lodge-amenities", hint: "Set parking, internet, smoking, and extra-charge rules." }, { label: "Review reservations", tab: "lodge-reservations", hint: "Apply policies to current stays." }]} />
      </>}
    </SectionShell>
  );
}
