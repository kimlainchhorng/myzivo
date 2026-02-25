// CSS animations used instead of framer-motion for performance
import { useState } from "react";
import { Bell, Check, CheckCheck, Trash2, Car, UtensilsCrossed, Truck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotificationCenter, Notification } from "@/hooks/useNotificationCenter";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

const NotificationIcon = ({ type }: { type: Notification["type"] }) => {
  switch (type) {
    case "trip":
      return <Car className="h-4 w-4 text-primary" />;
    case "order":
      return <UtensilsCrossed className="h-4 w-4 text-orange-500" />;
    case "delivery":
      return <Truck className="h-4 w-4 text-green-500" />;
    default:
      return <Bell className="h-4 w-4 text-muted-foreground" />;
  }
};

const NotificationItem = ({
  notification,
  onMarkAsRead,
  index,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  index: number;
}) => {
  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 border-b border-border/50 last:border-0 transition-all hover:bg-muted/30 animate-in fade-in slide-in-from-left-2",
        !notification.read && "bg-gradient-to-r from-primary/5 to-teal-400/5"
      )}
      style={{ animationDelay: `${index * 30}ms`, animationFillMode: 'both' }}
    >
      <div className={cn(
        "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center",
        notification.type === "trip" && "bg-primary/10",
        notification.type === "order" && "bg-eats/10",
        notification.type === "delivery" && "bg-emerald-500/10",
        !["trip", "order", "delivery"].includes(notification.type) && "bg-muted"
      )}>
        <NotificationIcon type={notification.type} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold text-sm truncate">{notification.title}</p>
          {!notification.read && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 flex-shrink-0 rounded-lg hover:bg-primary/10 transition-all duration-200 hover:scale-110 active:scale-90 touch-manipulation"
              onClick={() => onMarkAsRead(notification.id)}
            >
              <Check className="h-3 w-3" />
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{notification.message}</p>
        <p className="text-[10px] text-muted-foreground/70 mt-1.5 font-medium">
          {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
        </p>
      </div>
    </div>
  );
};

const NotificationCenter = () => {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotificationCenter();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative rounded-xl hover:bg-primary/10 transition-all duration-200 hover:scale-110 active:scale-95 touch-manipulation w-10 h-10"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1.5 -right-1.5 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-gradient-to-r from-primary to-teal-400 border-0 shadow-lg shadow-primary/30 animate-in zoom-in duration-200"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 border-0 bg-card/95 backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in-95 duration-150" align="end">
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-gradient-to-r from-primary/5 to-teal-400/5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="font-bold text-sm">Notifications</h3>
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs rounded-lg hover:bg-primary/10 active:scale-95 transition-all duration-200 touch-manipulation"
                onClick={markAllAsRead}
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg hover:bg-destructive/10 active:scale-90 transition-all duration-200 touch-manipulation"
                onClick={clearAll}
              >
                <Trash2 className="h-3 w-3 text-destructive" />
              </Button>
            )}
          </div>
        </div>
        <ScrollArea className="h-[320px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-muted-foreground animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 flex items-center justify-center mb-4">
                <Bell className="h-8 w-8 opacity-50" />
              </div>
              <p className="text-sm font-medium">No notifications yet</p>
              <p className="text-xs">Updates will appear here</p>
            </div>
          ) : (
            <div className="animate-in fade-in duration-200">
              {notifications.map((notification, index) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  index={index}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;
