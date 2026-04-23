import { MessageSquareText } from "lucide-react";
import { EmptyPanel, LoadingPanel, NextActions, SectionShell, StatCard, useLodgingOpsData } from "./LodgingOperationsShared";

export default function LodgingReviewsSection({ storeId }: { storeId: string }) {
  const { reservations, isLoading } = useLodgingOpsData(storeId);
  const checkedOut = reservations.filter((r) => r.status === "checked_out").length;
  return (
    <SectionShell title="Reviews & Guest Feedback" subtitle="Follow-up workspace for completed stays and guest feedback readiness." icon={MessageSquareText}>
      {isLoading ? <LoadingPanel /> : <>
        <div className="grid gap-3 sm:grid-cols-3"><StatCard label="Completed stays" value={String(checkedOut)} icon={MessageSquareText} /><StatCard label="Follow-up queue" value={String(checkedOut)} icon={MessageSquareText} /><StatCard label="Review source" value="Ready" icon={MessageSquareText} /></div>
        <EmptyPanel title="Review inbox is ready for data" body="When review records are connected, this section can show guest ratings, public replies, and issue follow-up. For now, use completed reservations for outreach." actionLabel="Open completed stays" tab="lodge-reservations" />
        <NextActions actions={[{ label: "View checked-out stays", tab: "lodge-reservations", hint: "Filter reservations to completed stays for follow-up." }, { label: "Check guest profiles", tab: "lodge-guests", hint: "Review VIPs, repeat guests, and notes." }, { label: "Improve property details", tab: "lodge-property", hint: "Keep facilities and policies guest-ready." }]} />
      </>}
    </SectionShell>
  );
}
