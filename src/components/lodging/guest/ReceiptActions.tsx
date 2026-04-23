/**
 * ReceiptActions — download PDF receipt + .ics calendar export.
 */
import { Button } from "@/components/ui/button";
import { FileText, CalendarPlus } from "lucide-react";
import { format, parseISO } from "date-fns";

interface Props {
  reservationNumber: string;
  reservationId: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
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
    `SUMMARY:Stay at ${propertyName}`,
    `DESCRIPTION:Reservation ${reservationNumber}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export default function ReceiptActions(props: Props) {
  const downloadIcs = () => {
    const ics = buildIcs(props);
    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${props.reservationNumber}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printReceipt = () => {
    window.print();
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={printReceipt} className="gap-2">
        <FileText className="w-4 h-4" /> Receipt
      </Button>
      <Button variant="outline" size="sm" onClick={downloadIcs} className="gap-2">
        <CalendarPlus className="w-4 h-4" /> Add to calendar
      </Button>
    </div>
  );
}
