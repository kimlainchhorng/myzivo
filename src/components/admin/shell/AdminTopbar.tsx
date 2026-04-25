import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { AdminVertical } from "./useAdminContext";

interface AdminTopbarProps {
  vertical: AdminVertical;
}

const VERTICAL_LABEL: Record<AdminVertical, string> = {
  restaurant: "Restaurant",
  business: "Business",
  grocery: "Grocery",
  retail: "Retail",
  cafe: "Cafe",
  service: "Service",
  mobility: "Mobility",
  generic: "Admin",
};

export function AdminTopbar({ vertical }: AdminTopbarProps) {
  return (
    <div className="flex-1 flex items-center justify-between gap-2 min-w-0 pr-2">
      <div className="flex items-center gap-2 min-w-0">
        <Badge variant="secondary" className="rounded-full text-[10px] px-2">
          {VERTICAL_LABEL[vertical]}
        </Badge>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Search"
          title="Search (coming soon)"
          className="h-8 w-8"
        >
          <Search className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          title="Notifications"
          className="h-8 w-8"
        >
          <Bell className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
