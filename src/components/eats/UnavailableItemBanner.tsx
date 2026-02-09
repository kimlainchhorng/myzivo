/**
 * Unavailable Item Banner Component
 * Warning banner shown in cart/checkout when items are unavailable
 */
import { AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UnavailableItem {
  id: string;
  name: string;
}

interface UnavailableItemBannerProps {
  unavailableItems: UnavailableItem[];
  onRemoveAll: () => void;
  className?: string;
}

export function UnavailableItemBanner({
  unavailableItems,
  onRemoveAll,
  className,
}: UnavailableItemBannerProps) {
  if (unavailableItems.length === 0) return null;

  return (
    <div
      className={cn(
        "bg-amber-500/10 border border-amber-500/30 rounded-xl p-4",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-amber-600 dark:text-amber-400">
            Some items are no longer available
          </p>
          <ul className="text-sm text-muted-foreground mt-2 space-y-1">
            {unavailableItems.map((item) => (
              <li key={item.id} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                {item.name}
              </li>
            ))}
          </ul>
          <Button
            variant="outline"
            size="sm"
            onClick={onRemoveAll}
            className="mt-3 gap-2 text-amber-600 border-amber-500/30 hover:bg-amber-500/10"
          >
            <Trash2 className="w-4 h-4" />
            Remove Unavailable Items
          </Button>
        </div>
      </div>
    </div>
  );
}
