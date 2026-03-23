/**
 * Notifications Page — Premium 2026
 * Unified notification center with category filtering
 */
import { useState, useMemo } from 'react';
import SEOHead from '@/components/SEOHead';
import { useNavigate } from 'react-router-dom';
import { CheckCheck, Bell, Package, Gift, Headphones, Clock, ArrowLeft, ShieldCheck, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationItem from '@/components/notifications/NotificationItem';
import MobileBottomNav from '@/components/shared/MobileBottomNav';
import { useI18n } from '@/hooks/useI18n';
import { cn } from '@/lib/utils';
import { usePhoneVerificationGate } from '@/hooks/usePhoneVerificationGate';
import { PhoneVerificationDialog } from '@/components/account/PhoneVerificationDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

type NotificationCategory = 'all' | 'orders' | 'promos' | 'support' | 'delays';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<NotificationCategory>('all');
  const [showPhoneVerify, setShowPhoneVerify] = useState(false);
  
  // Check phone verification status
  const { isChecking: phoneChecking, isVerified: phoneVerified } = usePhoneVerificationGate();
  
  // Get user's phone number from profile
  const { data: profilePhone } = useQuery({
    queryKey: ["profile-phone", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("profiles")
        .select("phone_e164, phone")
        .eq("user_id", user.id)
        .single();
      return data as { phone_e164: string | null; phone: string | null } | null;
    },
    enabled: !!user?.id && !phoneVerified,
  });
  
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications(100);

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'all') return notifications;
    return notifications.filter(n => {
      switch (activeTab) {
        case 'orders': return n.category === 'transactional';
        case 'promos': return n.category === 'marketing';
        case 'support': return n.category === 'operational';
        case 'delays': return n.template?.toLowerCase().includes('delay') || n.title?.toLowerCase().includes('delay');
        default: return true;
      }
    });
  }, [notifications, activeTab]);

  const categoryCounts = useMemo(() => {
    const counts = { all: 0, orders: 0, promos: 0, support: 0, delays: 0 };
    notifications.forEach(n => {
      if (!n.is_read) {
        counts.all++;
        if (n.category === 'transactional') counts.orders++;
        else if (n.category === 'marketing') counts.promos++;
        else if (n.category === 'operational') counts.support++;
        if (n.template?.toLowerCase().includes('delay') || n.title?.toLowerCase().includes('delay')) counts.delays++;
      }
    });
    return counts;
  }, [notifications]);

  const handleNotificationClick = (notification: any) => {
    if (!notification.is_read) markAsRead([notification.id]);
    if (notification.action_url) {
      if (notification.action_url.startsWith('/')) navigate(notification.action_url);
      else import('@/lib/openExternalUrl').then(({ openExternalUrl: oe }) => oe(notification.action_url));
    }
  };

  const getEmptyMessage = (tab: NotificationCategory) => {
    const msgs: Record<NotificationCategory, string> = {
      all: "No notifications yet. You'll see updates here.",
      orders: "No order updates yet.",
      promos: "No promotions right now.",
      support: "No support messages.",
      delays: "No delay alerts. Your orders are on time!",
    };
    return msgs[tab];
  };

  const getEmptyIcon = (tab: NotificationCategory) => {
    const icons: Record<NotificationCategory, typeof Bell> = {
      all: Bell, orders: Package, promos: Gift, support: Headphones, delays: Clock,
    };
    const Icon = icons[tab];
    return <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4"><Icon className="w-8 h-8 text-muted-foreground/40" /></div>;
  };

  const tabs: { value: NotificationCategory; label: string; icon: typeof Bell }[] = [
    { value: 'all', label: t('notif.all'), icon: Bell },
    { value: 'orders', label: t('notif.orders'), icon: Package },
    { value: 'promos', label: t('notif.promos'), icon: Gift },
    { value: 'support', label: t('notif.support'), icon: Headphones },
    { value: 'delays', label: t('notif.delays'), icon: Clock },
  ];

  // Show loading while checking phone status
  if (phoneChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Show phone verification gate if not verified
  if (!phoneVerified) {
    const userPhone = profilePhone?.phone_e164 || profilePhone?.phone || '';
    return (
      <div className="min-h-screen bg-background pb-20">
        <SEOHead title="Verify Phone – ZIVO" description="Verify your phone number to receive notifications." noIndex={true} />
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-2xl border-b border-border/30">
          <div className="px-4 py-3 safe-area-top">
            <div className="flex items-center gap-3">
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => navigate(-1)}
                className="w-10 h-10 min-w-[44px] min-h-[44px] rounded-xl bg-card/80 border border-border/40 flex items-center justify-center touch-manipulation"
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
              <h1 className="text-lg font-bold">Notifications</h1>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center px-6 pt-16">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 20 }}
            className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-6"
          >
            <ShieldCheck className="w-10 h-10 text-primary" />
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-center space-y-3 mb-8"
          >
            <h2 className="text-xl font-bold text-foreground">Verify Your Phone Number</h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              To receive notifications about your trips, orders, and alerts, please verify your phone number first. This keeps your account secure.
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-xs space-y-3"
          >
            {userPhone ? (
              <>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/50 border border-border/40">
                  <Smartphone className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">{userPhone}</span>
                </div>
                <Button
                  onClick={() => setShowPhoneVerify(true)}
                  className="w-full h-12 rounded-xl font-semibold text-base"
                >
                  Send Verification Code
                </Button>
              </>
            ) : (
              <Button
                onClick={() => navigate('/verify-phone')}
                className="w-full h-12 rounded-xl font-semibold text-base"
              >
                <Smartphone className="w-5 h-5 mr-2" />
                Add & Verify Phone Number
              </Button>
            )}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-[11px] text-muted-foreground/60 mt-6 text-center max-w-xs"
          >
            We'll send a 6-digit code via SMS. Standard messaging rates may apply.
          </motion.p>
        </div>

        {userPhone && (
          <PhoneVerificationDialog
            open={showPhoneVerify}
            onOpenChange={setShowPhoneVerify}
            phoneNumber={userPhone}
            onVerified={() => {
              setShowPhoneVerify(false);
              window.location.reload();
            }}
          />
        )}

        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <SEOHead title="Notifications – ZIVO" description="View your travel alerts, order updates, and promotional offers." noIndex={true} />
      {/* Premium Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-2xl border-b border-border/30">
        <div className="px-4 py-3 safe-area-top">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => navigate(-1)}
                className="w-10 h-10 min-w-[44px] min-h-[44px] rounded-xl bg-card/80 border border-border/40 flex items-center justify-center touch-manipulation"
              >
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
              <div>
                 <h1 className="text-lg font-bold flex items-center gap-2">
                  {t('notif.title')}
                  {unreadCount > 0 && (
                    <Badge className="bg-destructive text-destructive-foreground text-[10px] font-bold h-5 min-w-[20px] px-1.5">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                  )}
                </h1>
                <p className="text-[10px] text-muted-foreground">{t('notif.subtitle')}</p>
              </div>
            </div>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-9 text-xs font-bold rounded-xl text-primary"
                onClick={markAllAsRead}
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                {t('notif.read_all')}
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <div className="px-4 pt-4 space-y-4">
        {/* Premium Category Tabs */}
        <div className="flex gap-1 bg-muted/50 rounded-xl p-1">
          {tabs.map(tab => {
            const isActive = activeTab === tab.value;
            return (
              <button 
                key={tab.value} 
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  "flex-1 flex flex-col items-center gap-1 py-2.5 rounded-lg text-[10px] font-bold transition-all duration-200 touch-manipulation relative",
                  isActive 
                    ? "bg-card text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:block">{tab.label}</span>
                {categoryCounts[tab.value] > 0 && (
                  <Badge 
                    className={cn(
                      "absolute -top-1 -right-0 h-4 min-w-[16px] px-1 text-[9px] flex items-center justify-center border-0",
                      tab.value === 'delays' ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"
                    )}
                  >
                    {categoryCounts[tab.value] > 9 ? '9+' : categoryCounts[tab.value]}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-muted/50 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-border/30">
              <CardContent className="p-10 text-center">
                {getEmptyIcon(activeTab)}
                <h3 className="font-bold text-base mb-1">All caught up</h3>
                <p className="text-muted-foreground text-sm max-w-[250px] mx-auto">
                  {getEmptyMessage(activeTab)}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <ScrollArea className="h-[calc(100vh-220px)]">
            <div className="space-y-2">
              {filteredNotifications.map((notification, i) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <NotificationItem
                    notification={notification}
                    onMarkAsRead={() => markAsRead([notification.id])}
                    onClick={() => handleNotificationClick(notification)}
                  />
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* === WAVE 8: Notification Intelligence === */}
        <div className="space-y-4 mt-6">
          {/* Weekly Summary */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <p className="text-xs font-bold text-foreground mb-2 flex items-center gap-2">
                <Bell className="w-3.5 h-3.5 text-primary" /> This Week's Summary
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Total", value: String(notifications.length), icon: "📬" },
                  { label: "Unread", value: String(unreadCount), icon: "🔴" },
                  { label: "Actions", value: String(notifications.filter(n => n.action_url).length), icon: "⚡" },
                ].map(s => (
                  <div key={s.label} className="text-center p-2 rounded-xl bg-card/60 border border-border/30">
                    <p className="text-sm">{s.icon}</p>
                    <p className="text-sm font-bold text-foreground">{s.value}</p>
                    <p className="text-[9px] text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notification Preferences Quick Access */}
          <Card className="border-border/40">
            <CardContent className="p-4">
              <p className="text-xs font-bold text-foreground mb-3">Quick Preferences</p>
              <div className="space-y-2">
                {[
                  { pref: "Price drop alerts", desc: "Get notified when tracked prices drop", enabled: true },
                  { pref: "Booking reminders", desc: "Upcoming trip & check-in reminders", enabled: true },
                  { pref: "Promo notifications", desc: "Deals, discounts & member offers", enabled: false },
                  { pref: "Weekly digest", desc: "Summary of activity every Monday", enabled: true },
                ].map(p => (
                  <div key={p.pref} className="flex items-center justify-between py-1">
                    <div>
                      <p className="text-[11px] font-bold text-foreground">{p.pref}</p>
                      <p className="text-[9px] text-muted-foreground">{p.desc}</p>
                    </div>
                    <div className={cn("w-8 h-4 rounded-full transition-all", p.enabled ? "bg-primary" : "bg-muted/60")}>
                      <div className={cn("w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform mt-[1px]", p.enabled ? "translate-x-[17px]" : "translate-x-[1px]")} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card className="border-border/40">
            <CardContent className="p-4">
              <p className="text-xs font-bold text-foreground mb-3 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" /> Recent Activity
              </p>
              <div className="space-y-3">
                {[
                  { action: "Price alert triggered", detail: "NYC→Miami dropped $45", time: "2h ago", emoji: "📉" },
                  { action: "Booking confirmed", detail: "Hotel in Paris, Mar 15-18", time: "5h ago", emoji: "✅" },
                  { action: "Points earned", detail: "+250 ZIVO Points from flight", time: "1d ago", emoji: "⭐" },
                  { action: "Review reminder", detail: "Rate your Miami trip", time: "2d ago", emoji: "📝" },
                ].map((a, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <span className="text-sm">{a.emoji}</span>
                      {i < 3 && <div className="w-px h-6 bg-border/50 mt-1" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-[11px] font-bold text-foreground">{a.action}</p>
                      <p className="text-[10px] text-muted-foreground">{a.detail}</p>
                    </div>
                    <span className="text-[9px] text-muted-foreground">{a.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default NotificationsPage;
