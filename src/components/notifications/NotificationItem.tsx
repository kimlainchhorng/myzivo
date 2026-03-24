/**
 * Notification Item — 3D/4D Spatial UI
 */
import { Package, Gift, Headphones, Clock, User, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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
        badgeClass: 'bg-destructive/15 text-destructive border-destructive/20',
        iconBg: 'from-destructive/20 to-destructive/10',
        iconColor: 'text-destructive',
      };
    }
    switch (notification.category) {
      case 'transactional':
        return {
          icon: Package,
          label: 'Order',
          badgeClass: 'bg-primary/12 text-primary border-primary/20',
          iconBg: 'from-primary/20 to-primary/10',
          iconColor: 'text-primary',
        };
      case 'marketing':
        return {
          icon: Gift,
          label: 'Promo',
          badgeClass: 'bg-emerald-500/12 text-emerald-600 border-emerald-500/20',
          iconBg: 'from-emerald-500/20 to-emerald-500/10',
          iconColor: 'text-emerald-500',
        };
      case 'operational':
        return {
          icon: Headphones,
          label: 'Support',
          badgeClass: 'bg-amber-500/12 text-amber-600 border-amber-500/20',
          iconBg: 'from-amber-500/20 to-amber-500/10',
          iconColor: 'text-amber-500',
        };
      case 'account':
        return {
          icon: User,
          label: 'Account',
          badgeClass: 'bg-blue-500/12 text-blue-600 border-blue-500/20',
          iconBg: 'from-blue-500/20 to-blue-500/10',
          iconColor: 'text-blue-500',
        };
      default:
        return {
          icon: Package,
          label: notification.category,
          badgeClass: 'bg-muted text-muted-foreground border-border/20',
          iconBg: 'from-muted/30 to-muted/20',
          iconColor: 'text-muted-foreground',
        };
    }
  };

  const config = getCategoryConfig();
  const Icon = config.icon;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2, rotateX: 1 }}
      whileTap={{ scale: 0.97 }}
      style={{ perspective: '800px', transformStyle: 'preserve-3d' }}
    >
      <div
        className={cn(
          "relative rounded-2xl overflow-hidden cursor-pointer touch-manipulation transition-shadow duration-300",
          !notification.is_read
            ? "shadow-lg shadow-primary/[0.08] ring-1 ring-primary/20"
            : "shadow-md shadow-foreground/[0.03] ring-1 ring-border/20"
        )}
        onClick={onClick}
      >
        {/* Glass layers */}
        <div className="absolute inset-0 bg-card/70 backdrop-blur-2xl" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-primary/[0.01]" />
        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/[0.06] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]" />

        {/* Unread glow accent */}
        {!notification.is_read && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-primary/80 to-primary/40 rounded-l-2xl" />
        )}

        <div className="relative z-10 p-4 flex items-start gap-3">
          {/* 3D Icon */}
          <div className={cn(
            "flex-shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-inner border border-white/[0.08]",
            config.iconBg
          )}>
            <Icon className={cn("h-5 w-5", config.iconColor)} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge
                variant="secondary"
                className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold border", config.badgeClass)}
              >
                {config.label}
              </Badge>
              {!notification.is_read && (
                <span className="h-2 w-2 rounded-full bg-primary shadow-md shadow-primary/40 flex-shrink-0 animate-pulse" />
              )}
            </div>

            <h4 className={cn(
              "text-sm line-clamp-1 mb-0.5",
              !notification.is_read ? "font-bold text-foreground" : "font-medium text-foreground/80"
            )}>
              {notification.title}
            </h4>

            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {notification.body}
            </p>

            <p className="text-[10px] text-muted-foreground/60 mt-1.5 font-medium">
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
            </p>
          </div>

          {/* Arrow */}
          {notification.action_url && (
            <ChevronRight className="h-5 w-5 text-muted-foreground/40 flex-shrink-0 mt-1" />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationItem;
