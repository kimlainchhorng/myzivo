import { Check, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageStatusProps {
  isRead: boolean;
  className?: string;
}

const MessageStatus = ({ isRead, className }: MessageStatusProps) => {
  return (
    <span className={cn("inline-flex items-center ml-1", className)}>
      {isRead ? (
        <CheckCheck className="h-3.5 w-3.5 text-blue-400" />
      ) : (
        <Check className="h-3.5 w-3.5 text-primary-foreground/60" />
      )}
    </span>
  );
};

export default MessageStatus;
