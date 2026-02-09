/**
 * Notifications Page
 * Unified notification center with category filtering
 */
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCheck, Bell, Package, Gift, Headphones, Clock, User } from 'lucide-react';
import AppHeader from '@/components/app/AppHeader';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationItem from '@/components/notifications/NotificationItem';
import { cn } from '@/lib/utils';

type NotificationCategory = 'all' | 'orders' | 'promos' | 'support' | 'delays';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<NotificationCategory>('all');
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications(100);

  // Filter notifications by category
  const filteredNotifications = useMemo(() => {
    if (activeTab === 'all') return notifications;
    
    return notifications.filter(n => {
      switch (activeTab) {
        case 'orders':
          return n.category === 'transactional';
        case 'promos':
          return n.category === 'marketing';
        case 'support':
          return n.category === 'operational';
        case 'delays':
          return n.template?.toLowerCase().includes('delay') || 
                 n.title?.toLowerCase().includes('delay');
        default:
          return true;
      }
    });
  }, [notifications, activeTab]);

  // Calculate unread counts per category
  const categoryCounts = useMemo(() => {
    const counts = {
      all: 0,
      orders: 0,
      promos: 0,
      support: 0,
      delays: 0,
    };
    
    notifications.forEach(n => {
      if (!n.is_read) {
        counts.all++;
        
        if (n.category === 'transactional') counts.orders++;
        else if (n.category === 'marketing') counts.promos++;
        else if (n.category === 'operational') counts.support++;
        
        if (n.template?.toLowerCase().includes('delay') || 
            n.title?.toLowerCase().includes('delay')) {
          counts.delays++;
        }
      }
    });
    
    return counts;
  }, [notifications]);

  const handleNotificationClick = (notification: any) => {
    if (!notification.is_read) {
      markAsRead([notification.id]);
    }
    
    if (notification.action_url) {
      if (notification.action_url.startsWith('/')) {
        navigate(notification.action_url);
      } else {
        window.open(notification.action_url, '_blank');
      }
    }
  };

  const getEmptyMessage = (tab: NotificationCategory) => {
    switch (tab) {
      case 'all':
        return "No notifications yet. You'll see updates here.";
      case 'orders':
        return "No order updates yet. Place an order to get started.";
      case 'promos':
        return "No promotions right now. Check back for deals!";
      case 'support':
        return "No support messages. Need help? Contact us.";
      case 'delays':
        return "No delay alerts. Your orders are on time!";
    }
  };

  const getEmptyIcon = (tab: NotificationCategory) => {
    switch (tab) {
      case 'orders':
        return <Package className="h-12 w-12 mb-4 text-muted-foreground/50" />;
      case 'promos':
        return <Gift className="h-12 w-12 mb-4 text-muted-foreground/50" />;
      case 'support':
        return <Headphones className="h-12 w-12 mb-4 text-muted-foreground/50" />;
      case 'delays':
        return <Clock className="h-12 w-12 mb-4 text-muted-foreground/50" />;
      default:
        return <Bell className="h-12 w-12 mb-4 text-muted-foreground/50" />;
    }
  };

  const tabs: { value: NotificationCategory; label: string; icon: React.ReactNode }[] = [
    { value: 'all', label: 'All', icon: <Bell className="h-4 w-4" /> },
    { value: 'orders', label: 'Orders', icon: <Package className="h-4 w-4" /> },
    { value: 'promos', label: 'Promos', icon: <Gift className="h-4 w-4" /> },
    { value: 'support', label: 'Support', icon: <Headphones className="h-4 w-4" /> },
    { value: 'delays', label: 'Delays', icon: <Clock className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader 
        title="Notifications" 
        showBack 
        rightAction={
          unreadCount > 0 ? (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-9 text-xs"
              onClick={markAllAsRead}
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
          ) : null
        }
      />
      
      <main className="pt-16 px-4">
        {/* Unread count header */}
        {unreadCount > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-muted-foreground">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Category tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as NotificationCategory)}>
          <TabsList className="w-full grid grid-cols-5 h-auto p-1 mb-4">
            {tabs.map(tab => (
              <TabsTrigger 
                key={tab.value} 
                value={tab.value}
                className="relative flex flex-col items-center gap-1 py-2 px-1 text-xs"
              >
                {tab.icon}
                <span className="sr-only sm:not-sr-only">{tab.label}</span>
                {categoryCounts[tab.value] > 0 && (
                  <Badge 
                    className={cn(
                      "absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] flex items-center justify-center",
                      tab.value === 'delays' ? "bg-destructive" : "bg-primary"
                    )}
                  >
                    {categoryCounts[tab.value] > 9 ? '9+' : categoryCounts[tab.value]}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                {getEmptyIcon(activeTab)}
                <p className="text-muted-foreground text-sm max-w-[250px]">
                  {getEmptyMessage(activeTab)}
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-200px)]">
                <div className="space-y-2">
                  {filteredNotifications.map(notification => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={() => markAsRead([notification.id])}
                      onClick={() => handleNotificationClick(notification)}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default NotificationsPage;
