/**
 * ReceiptActions — download PDF receipt + .ics calendar export.
 */
import { Button } from "@/components/ui/button";
import { FileText, CalendarPlus, Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { buildBookingIcs, downloadIcsFile } from "@/lib/lodging/ics";

interface Props {
  reservationNumber: string;
  reservationId: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
}

function escapeIcs(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\n/g, "\\n");
}

function buildIcs({ reservationNumber, propertyName, checkIn, checkOut }: Omit<Props, "reservationId">) {
  const dt = (s: string) => format(parseISO(s), "yyyyMMdd");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ZIVO//Lodging//EN",
    "BEGIN:VEVENT",
    `UID:${reservationNumber}@hizivo.com`,
    `DTSTAMP:${format(new Date(), "yyyyMMdd'T'HHmmss'Z'")}`,
    `DTSTART;VALUE=DATE:${dt(checkIn)}`,
    `DTEND;VALUE=DATE:${dt(checkOut)}`,
    `SUMMARY:${escapeIcs(`Stay at ${propertyName}`)}`,
    `LOCATION:${escapeIcs(propertyName)}`,
    `DESCRIPTION:${escapeIcs(`ZIVO lodging reservation ${reservationNumber}`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export default function ReceiptActions(props: Props) {
  const [loadingReceipt, setLoadingReceipt] = useState(false);
  const downloadIcs = () => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Phnom_Penh";
    const ics = buildBookingIcs({
      reference: props.reservationNumber,
      storeName: props.propertyName,
      roomName: props.roomName || "Assigned room",
      guestName: props.guestName || "Guest",
      guestEmail: props.guestEmail,
      checkIn: props.checkIn,
      checkOut: props.checkOut,
      checkInTime: props.checkInTime || "15:00",
      checkOutTime: props.checkOutTime || "11:00",
      timezone,
      totalText: props.totalText,
      cancellationText: props.cancellationText || undefined,
    });
    downloadIcsFile(props.reservationNumber, ics);
  };

  const downloadReceipt = async () => {
    setLoadingReceipt(true);
    const { data, error } = await supabase.functions.invoke("lodging-reservation-receipt", {
      body: { reservation_id: props.reservationId },
    });
    setLoadingReceipt(false);
    if (error || !data) {
      toast.error(error?.message || "Could not download receipt");
      return;
    }
    const blob = data instanceof Blob ? data : new Blob([data], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ZIVO-reservation-${props.reservationNumber}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    props.onReceiptDownloaded?.();
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={downloadReceipt} disabled={loadingReceipt} className="gap-2">
        {loadingReceipt ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />} Receipt
      </Button>
      <Button variant="outline" size="sm" onClick={downloadIcs} className="gap-2">
        <CalendarPlus className="w-4 h-4" /> Add to calendar
      </Button>
    </div>
  );
}
