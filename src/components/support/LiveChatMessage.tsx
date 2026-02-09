/**
 * Live Chat Message
 * Individual message bubble with support for images and system messages
 */

import { format } from "date-fns";
import { User, Headphones, Info } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface LiveChatMessageProps {
  message: string | null;
  imageUrl: string | null;
  senderType: "user" | "agent" | "system";
  createdAt: string;
}

export function LiveChatMessage({
  message,
  imageUrl,
  senderType,
  createdAt,
}: LiveChatMessageProps) {
  // System messages are centered
  if (senderType === "system") {
    return (
      <div className="flex justify-center py-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-xs">
          <Info className="w-3 h-3" />
          <span>{message}</span>
        </div>
      </div>
    );
  }

  const isUser = senderType === "user";

  return (
    <div
      className={cn(
        "flex gap-3 max-w-[85%]",
        isUser ? "ml-auto flex-row-reverse" : ""
      )}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback
          className={cn(
            isUser
              ? "bg-primary/10 text-primary"
              : "bg-emerald-500/10 text-emerald-500"
          )}
        >
          {isUser ? (
            <User className="h-4 w-4" />
          ) : (
            <Headphones className="h-4 w-4" />
          )}
        </AvatarFallback>
      </Avatar>

      <div className={cn("flex flex-col gap-1", isUser ? "items-end" : "")}>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium">
            {isUser ? "You" : "Support Agent"}
          </span>
          <span>•</span>
          <span>{format(new Date(createdAt), "h:mm a")}</span>
        </div>

        {/* Message bubble */}
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "bg-muted text-foreground rounded-tl-sm"
          )}
        >
          {message && <p className="whitespace-pre-wrap">{message}</p>}
          
          {imageUrl && (
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-2"
            >
              <img
                src={imageUrl}
                alt="Chat attachment"
                className="max-w-full max-h-48 rounded-lg"
              />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default LiveChatMessage;
