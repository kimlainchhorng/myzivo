/**
 * Notification Item Component
 * Reusable notification list item with consistent styling
 */
import { Package, Gift, Headphones, Clock, User, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  user_id: string | null;
  order_id: string | null;
  channel: 'email' | 'in_app' | 'sms';
  category: 'transactional' | 'account' | 'operational' | 'marketing';
  template: string;
  title: string;
  body: string;
  action_url: string | null;
  status: 'queued' | 'sent' | 'failed' | 'read';
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  metadata: Record<string, any>;
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: () => void;
  onClick: () => void;
}

const NotificationItem = ({ notification, onMarkAsRead, onClick }: NotificationItemProps) => {
  const isDelay = notification.template?.toLowerCase().includes('delay') || 
                  notification.title?.toLowerCase().includes('delay');

  const getCategoryConfig = () => {
    if (isDelay) {
      return {
        icon: Clock,
        label: 'Delay',
        className: 'bg-destructive/10 text-destructive',
      };
    }

    switch (notification.category) {
      case 'transactional':
        return {
          icon: Package,
          label: 'Order',
          className: 'bg-primary/10 text-primary',
        };
      case 'marketing':
        return {
          icon: Gift,
          label: 'Promo',
          className: 'bg-emerald-500/10 text-emerald-600',
        };
      case 'operational':
        return {
          icon: Headphones,
          label: 'Support',
          className: 'bg-amber-500/10 text-amber-600',
        };
      case 'account':
        return {
          icon: User,
          label: 'Account',
          className: 'bg-blue-500/10 text-blue-600',
        };
      default:
        return {
          icon: Package,
          label: notification.category,
          className: 'bg-muted text-muted-foreground',
        };
    }
  };

  const config = getCategoryConfig();
  const Icon = config.icon;

  return (
    <Card
      className={cn(
        "p-4 cursor-pointer transition-all hover:shadow-md active:scale-[0.99]",
        !notification.is_read && "border-l-4 border-l-primary bg-primary/5"
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn(
          "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
          config.className
        )}>
          <Icon className="h-5 w-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge 
              variant="secondary" 
              className={cn("text-[10px] px-1.5 py-0", config.className)}
            >
              {config.label}
            </Badge>
            {!notification.is_read && (
              <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
            )}
          </div>
          
          <h4 className={cn(
            "text-sm line-clamp-1 mb-0.5",
            !notification.is_read ? "font-semibold" : "font-medium"
          )}>
            {notification.title}
          </h4>
          
          <p className="text-xs text-muted-foreground line-clamp-2">
            {notification.body}
          </p>
          
          <p className="text-[10px] text-muted-foreground mt-2">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </p>
        </div>

        {/* Action arrow */}
        {notification.action_url && (
          <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
        )}
      </div>
    </Card>
  );
};

export default NotificationItem;
