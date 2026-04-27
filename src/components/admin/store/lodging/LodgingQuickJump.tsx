import { KeyRound, CalendarRange, Sparkles, BellRing, Inbox, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const goTab = (tab: string) => window.dispatchEvent(new CustomEvent("lodge-set-tab", { detail: { tab } }));

const CHIPS = [
  { id: "lodge-frontdesk", label: "Front Desk", icon: KeyRound },
  { id: "lodge-reservations", label: "Reservations", icon: CalendarRange },
  { id: "lodge-housekeeping", label: "Housekeeping", icon: Sparkles },
  { id: "lodge-inbox", label: "Inbox", icon: Inbox },
  { id: "lodge-concierge", label: "Concierge", icon: BellRing },
  { id: "lodge-lostfound", label: "Lost & Found", icon: Search },
];

export default function LodgingQuickJump({ active }: { active: string }) {
  return (
    <div className="-mx-1 mb-3 flex gap-1.5 overflow-x-auto px-1 pb-1 scrollbar-thin">
      {CHIPS.map((c) => {
        const isActive = c.id === active;
        return (
          <button
            key={c.id}
            onClick={() => goTab(c.id)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition",
              isActive
                ? "border-primary/30 bg-primary/10 text-primary"
                : "border-border bg-card text-foreground/70 hover:border-primary/30 hover:text-primary",
            )}
          >
            <c.icon className="h-3 w-3" />
            <span>{c.label}</span>
          </button>
        );
      })}
    </div>
  );
}
