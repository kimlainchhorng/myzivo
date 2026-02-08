/**
 * Order Chat Button
 * Entry point to order chat with unread badge
 */
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useOrderChatUnread } from "@/hooks/useEatsUnreadChats";
import { cn } from "@/lib/utils";

interface OrderChatButtonProps {
  orderId: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "icon";
  basePath?: string; // e.g., "/eats/orders", "/driver/orders", "/merchant/orders"
  className?: string;
  showLabel?: boolean;
}

export function OrderChatButton({
  orderId,
  variant = "outline",
  size = "default",
  basePath = "/eats/orders",
  className,
  showLabel = true,
}: OrderChatButtonProps) {
  const navigate = useNavigate();
  const { data: unreadCount = 0 } = useOrderChatUnread(orderId);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    navigate(`${basePath}/${orderId}/chat`);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={cn("relative", className)}
    >
      <MessageCircle className="w-4 h-4" />
      {showLabel && size !== "icon" && <span className="ml-2">Chat</span>}
      {unreadCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-1.5 -right-1.5 h-5 min-w-[20px] px-1.5 text-[10px] font-bold rounded-full"
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </Badge>
      )}
    </Button>
  );
}
