import { CalendarClock, CircleHelp, CreditCard, FileText, MessageCircle, ReceiptText, RefreshCw, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerTrigger } from "@/components/ui/drawer";

interface Props {
  reservationNumber: string;
  propertyName: string;
  dates: string;
  paymentStatus: string;
}

const links = [
  { href: "#stay-summary", label: "Reservation details", icon: CalendarClock, text: "Review property, room, dates, and current stay status." },
  { href: "#manage-stay", label: "Change or cancel", icon: RefreshCw, text: "Date changes may be instant or sent to the host when approval is needed." },
  { href: "#payment-summary", label: "Payments", icon: CreditCard, text: "Saved-card charges, refunds, and balances are shown in the payment section." },
  { href: "#addon-status", label: "Add-ons", icon: ShoppingBag, text: "Extra services show charge status and any failure reason after checkout." },
  { href: "#receipt-history", label: "Receipts", icon: ReceiptText, text: "Download, re-download, share, or email receipts from saved snapshots." },
  { href: "#refund-disputes", label: "Refund requests", icon: FileText, text: "After cancellation, submit a refund review and track its status." },
  { href: "#message-property", label: "Message property", icon: MessageCircle, text: "Contact the host with this reservation context attached." },
];

export default function LodgingTripHelpDrawer({ reservationNumber, propertyName, dates, paymentStatus }: Props) {
  const go = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <CircleHelp className="h-4 w-4" /> Help with this stay
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[88vh]">
        <DrawerHeader>
          <DrawerTitle>Help for reservation {reservationNumber}</DrawerTitle>
          <DrawerDescription>{propertyName} · {dates} · {paymentStatus.replace(/_/g, " ")}</DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-6 space-y-3 overflow-y-auto">
          {links.map(({ href, label, icon: Icon, text }) => (
            <button
              key={href}
              type="button"
              onClick={() => go(href)}
              className="w-full rounded-lg border bg-card p-3 text-left transition-colors hover:bg-accent"
            >
              <span className="flex items-start gap-3">
                <span className="mt-0.5 rounded-md bg-primary/10 p-2 text-primary"><Icon className="h-4 w-4" /></span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{label}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{text}</span>
                </span>
              </span>
            </button>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
