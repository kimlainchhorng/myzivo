/**
 * Chat Status Banner
 * Visual indicator for live chat connection status
 */

import { Loader2, CheckCircle, XCircle, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ChatStatus = "waiting" | "active" | "ended";

interface ChatStatusBannerProps {
  status: ChatStatus;
  agentName?: string;
  onCancel?: () => void;
  className?: string;
}

export function ChatStatusBanner({
  status,
  agentName,
  onCancel,
  className,
}: ChatStatusBannerProps) {
  const statusConfig = {
    waiting: {
      icon: Loader2,
      iconClass: "animate-spin text-amber-500",
      bgClass: "bg-amber-500/10 border-amber-500/20",
      title: "Connecting...",
      subtitle: "Finding an available agent",
      showCancel: true,
    },
    active: {
      icon: Headphones,
      iconClass: "text-emerald-500",
      bgClass: "bg-emerald-500/10 border-emerald-500/20",
      title: agentName ? `${agentName} joined` : "Agent joined",
      subtitle: "You're now connected",
      showCancel: false,
    },
    ended: {
      icon: XCircle,
      iconClass: "text-muted-foreground",
      bgClass: "bg-muted border-border",
      title: "Conversation ended",
      subtitle: "This chat session has ended",
      showCancel: false,
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 p-3 rounded-xl border",
        config.bgClass,
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-background/50 flex items-center justify-center shrink-0">
          <Icon className={cn("w-5 h-5", config.iconClass)} />
        </div>
        <div>
          <p className="font-medium text-sm">{config.title}</p>
          <p className="text-xs text-muted-foreground">{config.subtitle}</p>
        </div>
      </div>
      
      {config.showCancel && onCancel && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="shrink-0 text-muted-foreground hover:text-foreground"
        >
          Cancel
        </Button>
      )}
    </div>
  );
}

export default ChatStatusBanner;
