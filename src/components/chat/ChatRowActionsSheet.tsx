import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import Pin from "lucide-react/dist/esm/icons/pin";
import BellOff from "lucide-react/dist/esm/icons/bell-off";
import Bell from "lucide-react/dist/esm/icons/bell";
import CheckCheck from "lucide-react/dist/esm/icons/check-check";
import Archive from "lucide-react/dist/esm/icons/archive";
import ArchiveRestore from "lucide-react/dist/esm/icons/archive-restore";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import Eraser from "lucide-react/dist/esm/icons/eraser";
import { cn } from "@/lib/utils";

export interface ChatRowActionsTarget {
  id: string;
  name: string;
  isPinned: boolean;
  isMuted: boolean;
  isArchived: boolean;
  hasUnread: boolean;
}

interface Props {
  target: ChatRowActionsTarget | null;
  onClose: () => void;
  onTogglePin: () => void;
  onToggleMute: () => void;
  onMarkRead: () => void;
  onToggleArchive: () => void;
  onClearHistory: () => void;
  onDelete: () => void;
}

export default function ChatRowActionsSheet({
  target, onClose, onTogglePin, onToggleMute, onMarkRead,
  onToggleArchive, onClearHistory, onDelete,
}: Props) {
  if (!target) return null;
  const items = [
    { key: "pin", label: target.isPinned ? "Unpin" : "Pin to top", icon: Pin, onClick: onTogglePin },
    { key: "mute", label: target.isMuted ? "Unmute" : "Mute notifications", icon: target.isMuted ? Bell : BellOff, onClick: onToggleMute },
    { key: "read", label: "Mark as read", icon: CheckCheck, onClick: onMarkRead, disabled: !target.hasUnread },
    { key: "archive", label: target.isArchived ? "Unarchive" : "Archive chat", icon: target.isArchived ? ArchiveRestore : Archive, onClick: onToggleArchive },
    { key: "clear", label: "Clear history", icon: Eraser, onClick: onClearHistory },
    { key: "delete", label: "Delete chat", icon: Trash2, onClick: onDelete, destructive: true },
  ];

  return (
    <Sheet open={!!target} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent side="bottom" className="rounded-t-3xl pb-8">
        <SheetHeader className="text-left">
          <SheetTitle className="text-base truncate">{target.name}</SheetTitle>
        </SheetHeader>
        <div className="mt-3 flex flex-col">
          {items.map((it) => {
            const Icon = it.icon;
            return (
              <button
                key={it.key}
                disabled={it.disabled}
                onClick={() => { it.onClick(); onClose(); }}
                className={cn(
                  "flex items-center gap-3 px-2 py-3 text-left rounded-xl active:scale-[0.98] transition-all",
                  it.disabled && "opacity-40",
                  it.destructive ? "text-destructive" : "text-foreground",
                  "hover:bg-muted/60"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{it.label}</span>
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
