import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type ChatNotificationToastProps = {
  senderId: string;
  senderName: string;
  messageText: string;
  senderAvatar?: string | null;
  onReply: (senderId: string) => void;
  onDismiss?: () => void;
};

export default function ChatNotificationToast({
  senderId,
  senderName,
  messageText,
  senderAvatar,
  onReply,
  onDismiss,
}: ChatNotificationToastProps) {
  const initials = senderName
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

  return (
    <div className="w-[min(92vw,430px)] rounded-[26px] border border-border/40 bg-background/95 p-3.5 shadow-[0_18px_50px_rgba(0,0,0,0.14)] backdrop-blur-2xl ring-1 ring-white/10">
      <div className="flex items-start gap-3.5">
        <div className="relative shrink-0 pt-0.5">
          <Avatar className="h-12 w-12 ring-2 ring-primary/15 shadow-md">
            <AvatarImage src={senderAvatar || undefined} alt={senderName} />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-semibold text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-background bg-primary" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-semibold leading-5 text-foreground">
                {senderName}
              </p>
              <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-primary/80">
                New message
              </p>
            </div>
            <button
              onClick={() => {
                onDismiss?.();
                onReply(senderId);
              }}
              className="shrink-0 rounded-2xl bg-primary px-3.5 py-2 text-[12px] font-semibold text-primary-foreground shadow-md shadow-primary/25 transition-all active:scale-95"
            >
              Reply
            </button>
          </div>

          <p className="mt-2 max-h-10 overflow-hidden break-words text-[13px] leading-5 text-muted-foreground">
            {messageText || "Sent you a message"}
          </p>
        </div>
      </div>
    </div>
  );
}