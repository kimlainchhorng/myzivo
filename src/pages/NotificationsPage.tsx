/**
 * Notifications Page — 3D/4D Spatial UI
 */
import { useState, useMemo } from 'react';
import SEOHead from '@/components/SEOHead';
import { useNavigate } from 'react-router-dom';
import { CheckCheck, Bell, Package, Gift, Headphones, Clock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationItem from '@/components/notifications/NotificationItem';
import MobileBottomNav from '@/components/shared/MobileBottomNav';
import { useI18n } from '@/hooks/useI18n';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import PullToRefresh from '@/components/shared/PullToRefresh';
import { useCallback } from 'react';

type NotificationCategory = 'all' | 'orders' | 'promos' | 'support' | 'delays';

/* ── Bokeh Particle ── */
const BokehParticle = ({ delay, size, x, y, color }: { delay: number; size: number; x: string; y: string; color: string }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{ width: size, height: size, left: x, top: y, background: color, filter: `blur(${size * 0.4}px)` }}
    animate={{ opacity: [0.12, 0.35, 0.12], scale: [0.8, 1.2, 0.8], y: [0, -15, 0] }}
    transition={{ duration: 5 + delay, repeat: Infinity, ease: "easeInOut", delay }}
  />
);

/* ── Glass Card ── */
const GlassCard3D = ({ children, className = "", glow = false }: { children: React.ReactNode; className?: string; glow?: boolean }) => (
  <div className={`relative rounded-2xl overflow-hidden ${className}`}>
    <div className="absolute inset-0 bg-card/65 backdrop-blur-2xl" />
    <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-primary/[0.015]" />
    <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/[0.06] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]" />
    {glow && <div className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-primary/15 via-transparent to-primary/8 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />}
    <div className="relative z-10">{children}</div>
  </div>
);

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<NotificationCategory>('all');
  
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    markAsRead, 
    markAllAsRead,
    fetchNotifications,
  } = useNotifications(100);

  const handlePullRefresh = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

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
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto mb-4 shadow-inner border border-primary/10"
      >
        <Icon className="w-9 h-9 text-primary/30" />
      </motion.div>
    );
  };

  const tabs: { value: NotificationCategory; label: string; icon: typeof Bell }[] = [
    { value: 'all', label: t('notif.all'), icon: Bell },
    { value: 'orders', label: t('notif.orders'), icon: Package },
    { value: 'promos', label: t('notif.promos'), icon: Gift },
    { value: 'support', label: t('notif.support'), icon: Headphones },
    { value: 'delays', label: t('notif.delays'), icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden safe-area-top safe-area-bottom">
      <SEOHead title="Notifications – ZIVO" description="View your travel alerts, order updates, and promotional offers." noIndex={true} />

      {/* ── 3D Background with parallax depth ── */}
      <div className="pointer-events-none fixed inset-0 z-0">
        {/* Photo background */}
        <img
          src="/images/notif-bg-3d.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-[0.12]"
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/90" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.04] via-transparent to-primary/[0.03]" />
        {/* Radial glows */}
        <div className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-primary/[0.06] blur-[100px]" />
        <div className="absolute bottom-[10%] left-[-15%] w-[50vw] h-[50vw] rounded-full bg-primary/[0.04] blur-[80px]" />
        {/* Bokeh */}
        <BokehParticle delay={0} size={50} x="8%" y="12%" color="hsl(var(--primary) / 0.07)" />
        <BokehParticle delay={1.8} size={35} x="78%" y="20%" color="hsl(var(--primary) / 0.05)" />
        <BokehParticle delay={2.5} size={60} x="85%" y="55%" color="hsl(var(--primary) / 0.04)" />
        <BokehParticle delay={0.6} size={40} x="15%" y="65%" color="hsl(var(--primary) / 0.06)" />
        <BokehParticle delay={3.2} size={30} x="50%" y="80%" color="hsl(var(--primary) / 0.05)" />
      </div>

      {/* ── Scrollable Content ── */}
      <div className="relative z-10 h-screen overflow-y-auto pb-24 scroll-smooth" style={{ scrollbarWidth: 'none' }}>

        {/* ── Sticky 3D Header ── */}
        <div className="sticky top-0 safe-area-top z-40">
          <div className="relative">
            <div className="absolute inset-0 bg-background/70 backdrop-blur-2xl" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border/30 to-transparent" />
            <div className="relative z-10 px-4 py-3 safe-area-top">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div whileHover={{ scale: 1.1, rotateY: 10 }} whileTap={{ scale: 0.88 }}>
                    <button
                      onClick={() => navigate(-1)}
                      className="w-10 h-10 min-w-[44px] min-h-[44px] rounded-2xl bg-card/60 backdrop-blur-xl border border-border/30 flex items-center justify-center touch-manipulation shadow-lg shadow-primary/[0.05] hover:bg-card/80 transition-all"
                      aria-label="Go back"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                  </motion.div>
                  <div>
                    <h1 className="text-lg font-bold flex items-center gap-2">
                      {t('notif.title')}
                      {unreadCount > 0 && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400 }}>
                          <Badge className="bg-destructive text-destructive-foreground text-[10px] font-bold h-5 min-w-[20px] px-1.5 shadow-md shadow-destructive/30">
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </Badge>
                        </motion.div>
                      )}
                    </h1>
                    <p className="text-[10px] text-muted-foreground">{t('notif.subtitle')}</p>
                  </div>
                </div>
                {unreadCount > 0 && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }}>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-9 text-xs font-bold rounded-2xl text-primary hover:bg-primary/8"
                      onClick={markAllAsRead}
                    >
                      <CheckCheck className="h-4 w-4 mr-1" />
                      {t('notif.read_all')}
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="px-4 pt-4 space-y-4 max-w-lg mx-auto">
          {/* ── 3D Category Tab Bar ── */}
          <motion.div
            initial={{ opacity: 0, y: 20, rotateX: 8 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{ perspective: '1000px' }}
          >
            <GlassCard3D className="shadow-xl shadow-primary/[0.06]">
              <div className="flex gap-0.5 p-1.5">
                {tabs.map(tab => {
                  const isActive = activeTab === tab.value;
                  return (
                    <motion.button
                      key={tab.value}
                      whileHover={{ scale: 1.05, y: -1 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => setActiveTab(tab.value)}
                      className={cn(
                        "flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl text-[10px] font-bold transition-all duration-300 touch-manipulation relative",
                        isActive 
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                          : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                      )}
                    >
                      <tab.icon className="w-4 h-4" />
                      <span className="hidden sm:block">{tab.label}</span>
                      {categoryCounts[tab.value] > 0 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          <Badge 
                            className={cn(
                              "absolute -top-1.5 -right-0.5 h-4 min-w-[16px] px-1 text-[9px] flex items-center justify-center border-0 shadow-sm",
                              tab.value === 'delays' 
                                ? "bg-destructive text-destructive-foreground shadow-destructive/30" 
                                : isActive
                                  ? "bg-primary-foreground text-primary"
                                  : "bg-primary text-primary-foreground shadow-primary/30"
                            )}
                          >
                            {categoryCounts[tab.value] > 9 ? '9+' : categoryCounts[tab.value]}
                          </Badge>
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </GlassCard3D>
          </motion.div>

          {/* ── Notification List ── */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="relative rounded-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-card/50 backdrop-blur-xl" />
                    <div className="relative h-20 animate-pulse" />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 30, rotateX: 8 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{ perspective: '800px' }}
            >
              <GlassCard3D className="shadow-xl">
                <div className="p-10 text-center">
                  {getEmptyIcon(activeTab)}
                  <h3 className="font-bold text-base mb-1">All caught up</h3>
                  <p className="text-muted-foreground text-sm max-w-[250px] mx-auto">
                    {getEmptyMessage(activeTab)}
                  </p>
                </div>
              </GlassCard3D>
            </motion.div>
          ) : (
            <div className="space-y-2.5">
              {filteredNotifications.map((notification, i) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20, rotateX: 6 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  style={{ perspective: '800px' }}
                >
                  <NotificationItem
                    notification={notification}
                    onMarkAsRead={() => markAsRead([notification.id])}
                    onClick={() => handleNotificationClick(notification)}
                  />
                </motion.div>
              ))}
            </div>
          )}

          {/* ── Weekly Summary (3D Glass) ── */}
          <motion.div
            initial={{ opacity: 0, y: 30, rotateX: 8 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{ perspective: '800px' }}
          >
            <GlassCard3D glow className="shadow-xl shadow-primary/[0.06] group">
              <div className="p-4">
                <p className="text-xs font-bold text-foreground mb-3 flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5 text-primary" /> This Week's Summary
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Total", value: String(notifications.length), icon: "📬" },
                    { label: "Unread", value: String(unreadCount), icon: "🔴" },
                    { label: "Actions", value: String(notifications.filter(n => n.action_url).length), icon: "⚡" },
                  ].map(s => (
                    <motion.div
                      key={s.label}
                      whileHover={{ scale: 1.06, y: -2 }}
                      className="text-center p-3 rounded-2xl bg-card/40 backdrop-blur-xl border border-border/20 shadow-inner"
                    >
                      <p className="text-sm mb-0.5">{s.icon}</p>
                      <p className="text-base font-bold text-foreground">{s.value}</p>
                      <p className="text-[9px] text-muted-foreground font-medium">{s.label}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </GlassCard3D>
          </motion.div>

          {/* ── Quick Preferences (3D Glass) ── */}
          <motion.div
            initial={{ opacity: 0, y: 30, rotateX: 8 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            style={{ perspective: '800px' }}
          >
            <GlassCard3D className="shadow-xl">
              <div className="p-4">
                <p className="text-xs font-bold text-foreground mb-3">Quick Preferences</p>
                <div className="space-y-2">
                  {[
                    { pref: "Price drop alerts", desc: "Get notified when tracked prices drop", enabled: true },
                    { pref: "Booking reminders", desc: "Upcoming trip & check-in reminders", enabled: true },
                    { pref: "Promo notifications", desc: "Deals, discounts & member offers", enabled: false },
                    { pref: "Weekly digest", desc: "Summary of activity every Monday", enabled: true },
                  ].map(p => (
                    <div key={p.pref} className="flex items-center justify-between py-1.5">
                      <div>
                        <p className="text-[11px] font-bold text-foreground">{p.pref}</p>
                        <p className="text-[9px] text-muted-foreground">{p.desc}</p>
                      </div>
                      <div className={cn(
                        "w-9 h-5 rounded-full transition-all duration-300 shadow-inner cursor-pointer",
                        p.enabled 
                          ? "bg-primary shadow-primary/20" 
                          : "bg-muted/50"
                      )}>
                        <motion.div
                          animate={{ x: p.enabled ? 17 : 2 }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                          className="w-4 h-4 rounded-full bg-white shadow-md mt-[2px]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard3D>
          </motion.div>

          {/* ── Activity Timeline (3D Glass) ── */}
          <motion.div
            initial={{ opacity: 0, y: 30, rotateX: 8 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            style={{ perspective: '800px' }}
            className="pb-4"
          >
            <GlassCard3D className="shadow-xl">
              <div className="p-4">
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
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.06, duration: 0.35 }}
                      className="flex items-start gap-3"
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-sm">{a.emoji}</span>
                        {i < 3 && <div className="w-px h-6 bg-border/30 mt-1" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-[11px] font-bold text-foreground">{a.action}</p>
                        <p className="text-[10px] text-muted-foreground">{a.detail}</p>
                      </div>
                      <span className="text-[9px] text-muted-foreground/60 font-medium">{a.time}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </GlassCard3D>
          </motion.div>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default NotificationsPage;
