/**
 * Notifications Page — 3D/4D Spatial UI
 */
import { useState, useMemo, useCallback, useEffect } from 'react';
import SEOHead from '@/components/SEOHead';
import { useNavigate } from 'react-router-dom';
import { CheckCheck, Bell, Package, Gift, Headphones, Clock, ArrowLeft, UserPlus, Check, X, Heart, MessageCircle as MessageCircleIcon, Share2, AtSign, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationItem from '@/components/notifications/NotificationItem';
import MobileBottomNav from '@/components/shared/MobileBottomNav';
import { useI18n } from '@/hooks/useI18n';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import PullToRefresh from '@/components/shared/PullToRefresh';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { useSocialNotifications, SocialNotification } from '@/hooks/useSocialNotifications';

type NotificationCategory = 'all' | 'social' | 'orders' | 'promos' | 'support' | 'delays';

interface FriendRequest {
  id: string;
  user_id: string;
  created_at: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

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

/* ── Friend Request Card ── */
const FriendRequestCard = ({ request, onAccept, onDecline }: { request: FriendRequest; onAccept: () => void; onDecline: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, x: -100, scale: 0.95 }}
    transition={{ duration: 0.3 }}
  >
    <div className="relative rounded-2xl overflow-hidden shadow-md ring-1 ring-border/20">
      <div className="absolute inset-0 bg-card/70 backdrop-blur-2xl" />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.03] via-transparent to-primary/[0.01]" />
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-blue-400 to-blue-300 rounded-l-2xl" />
      <div className="relative z-10 p-4 flex items-center gap-3">
        <Avatar className="w-11 h-11 border-2 border-blue-500/20 shadow-md">
          <AvatarImage src={request.profile?.avatar_url || ''} />
          <AvatarFallback className="bg-blue-500/10 text-blue-600 font-bold text-sm">
            {(request.profile?.full_name || '?')[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm truncate">{request.profile?.full_name || 'Unknown User'}</p>
          <p className="text-[10px] text-muted-foreground">
            Sent you a friend request · {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={onAccept}
            className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/25 touch-manipulation"
          >
            <Check className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={onDecline}
            className="w-9 h-9 rounded-xl bg-muted text-muted-foreground flex items-center justify-center shadow-sm touch-manipulation hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </div>
  </motion.div>
);

/* ── Social Notification Item ── */
const SOCIAL_NOTIF_ICONS: Record<string, typeof Heart> = {
  like: Heart, comment: MessageCircleIcon, reply: MessageCircleIcon,
  share: Share2, follow: UserPlus, mention: AtSign, story_reaction: Flame,
};
const SOCIAL_NOTIF_COLORS: Record<string, string> = {
  like: "text-red-500", comment: "text-blue-500", reply: "text-blue-400",
  share: "text-green-500", follow: "text-primary", mention: "text-purple-500", story_reaction: "text-orange-500",
};

const SocialNotifItem = ({ notif, index, onClick }: { notif: SocialNotification; index: number; onClick: () => void }) => {
  const Icon = SOCIAL_NOTIF_ICONS[notif.type] || Heart;
  const color = SOCIAL_NOTIF_COLORS[notif.type] || "text-primary";
  const timeAgo = (() => { try { return formatDistanceToNow(new Date(notif.created_at), { addSuffix: true }); } catch { return ""; } })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
    >
      <GlassCard3D glow={!notif.is_read}>
        <button onClick={onClick} className="w-full flex items-center gap-3 p-3 text-left touch-manipulation">
          <div className="relative shrink-0">
            <Avatar className="h-10 w-10">
              <AvatarImage src={notif.actor_avatar || undefined} />
              <AvatarFallback className="text-xs font-bold">{notif.actor_name?.[0] || "?"}</AvatarFallback>
            </Avatar>
            <div className={cn("absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full bg-card flex items-center justify-center", color)}>
              <Icon className="h-3 w-3" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className={cn("text-[13px] leading-snug", !notif.is_read && "font-semibold")}>
              {notif.message}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{timeAgo}</p>
          </div>
          {!notif.is_read && (
            <div className="h-2.5 w-2.5 rounded-full bg-primary shrink-0" />
          )}
        </button>
      </GlassCard3D>
    </motion.div>
  );
};

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<NotificationCategory>('all');
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [loadingFR, setLoadingFR] = useState(false);
  
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    markAsRead, 
    markAllAsRead,
    fetchNotifications,
  } = useNotifications(100);

  const {
    notifications: socialNotifs,
    unreadCount: socialUnread,
    markAsRead: markSocialRead,
    markAllAsRead: markAllSocialRead,
  } = useSocialNotifications(50);

  // Fetch pending friend requests
  const fetchFriendRequests = useCallback(async () => {
    if (!user) return;
    setLoadingFR(true);
    try {
      const { data, error } = await (supabase as any)
        .from('friendships')
        .select('id, user_id, created_at')
        .eq('friend_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      // Fetch profiles for each request
      if (data?.length) {
        const userIds = data.map((r: any) => r.user_id);
        const { data: profiles } = await (supabase as any)
          .from('profiles')
          .select('user_id, full_name, avatar_url')
          .in('user_id', userIds);

        const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));
        setFriendRequests(data.map((r: any) => ({
          ...r,
          profile: profileMap.get(r.user_id) || null,
        })));
      } else {
        setFriendRequests([]);
      }
    } catch (err) {
      console.error('Error fetching friend requests:', err);
    } finally {
      setLoadingFR(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFriendRequests();
  }, [fetchFriendRequests]);

  const handleAcceptFriend = async (request: FriendRequest) => {
    try {
      const { error } = await (supabase as any)
        .from('friendships')
        .update({ status: 'accepted', accepted_at: new Date().toISOString() })
        .eq('id', request.id);
      if (error) throw error;
      setFriendRequests(prev => prev.filter(r => r.id !== request.id));
      toast.success(`You are now friends with ${request.profile?.full_name || 'this user'}!`);

      // Notify the requester that their friend request was accepted
      try {
        const { data: myProfile } = await supabase.from("profiles").select("full_name, avatar_url").eq("user_id", user?.id).single();
        await supabase.functions.invoke("send-push-notification", {
          body: {
            user_id: request.user_id,
            notification_type: "friend_request_accepted",
            title: "Friend Request Accepted 🎉",
            body: `${myProfile?.full_name || "Someone"} accepted your friend request`,
            data: { type: "friend_accepted", sender_id: user?.id, avatar_url: myProfile?.avatar_url, action_url: `/user/${user?.id}` },
          },
        });
      } catch {}
    } catch (err) {
      console.error(err);
      toast.error('Failed to accept request');
    }
  };

  const handleDeclineFriend = async (request: FriendRequest) => {
    try {
      const { error } = await (supabase as any)
        .from('friendships')
        .update({ status: 'declined' })
        .eq('id', request.id);
      if (error) throw error;
      setFriendRequests(prev => prev.filter(r => r.id !== request.id));
      toast('Friend request declined');
    } catch (err) {
      console.error(err);
      toast.error('Failed to decline request');
    }
  };

  const handlePullRefresh = useCallback(async () => {
    await Promise.all([fetchNotifications(), fetchFriendRequests()]);
  }, [fetchNotifications, fetchFriendRequests]);

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'all' || activeTab === 'social') return notifications;
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
    const counts = { all: 0, social: friendRequests.length + socialUnread, orders: 0, promos: 0, support: 0, delays: 0 };
    notifications.forEach(n => {
      if (!n.is_read) {
        counts.all++;
        if (n.category === 'transactional') counts.orders++;
        else if (n.category === 'marketing') counts.promos++;
        else if (n.category === 'operational') counts.support++;
        if (n.template?.toLowerCase().includes('delay') || n.title?.toLowerCase().includes('delay')) counts.delays++;
      }
    });
    counts.all += friendRequests.length + socialUnread;
    return counts;
  }, [notifications, friendRequests, socialUnread]);

  const handleNotificationClick = (notification: any) => {
    if (!notification.is_read) markAsRead([notification.id]);
    if (notification.action_url) {
      let url = notification.action_url as string;
      // Remap legacy /dispatch/support/:id to /support/tickets/:id
      const dispatchMatch = url.match(/^\/dispatch\/support\/(.+)$/);
      if (dispatchMatch) {
        url = `/support/tickets/${dispatchMatch[1]}`;
      }
      if (url.startsWith('/')) navigate(url);
      else import('@/lib/openExternalUrl').then(({ openExternalUrl: oe }) => oe(url));
    }
  };

  const getEmptyMessage = (tab: NotificationCategory) => {
    const msgs: Record<NotificationCategory, string> = {
      all: "No notifications yet. You'll see updates here.",
      social: "No friend requests or social activity.",
      orders: "No order updates yet.",
      promos: "No promotions right now.",
      support: "No support messages.",
      delays: "No delay alerts. Your orders are on time!",
    };
    return msgs[tab];
  };

  const getEmptyIcon = (tab: NotificationCategory) => {
    const icons: Record<NotificationCategory, typeof Bell> = {
      all: Bell, social: UserPlus, orders: Package, promos: Gift, support: Headphones, delays: Clock,
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
    { value: 'social', label: 'Social', icon: UserPlus },
    { value: 'orders', label: t('notif.orders'), icon: Package },
    { value: 'promos', label: t('notif.promos'), icon: Gift },
    { value: 'support', label: t('notif.support'), icon: Headphones },
    { value: 'delays', label: t('notif.delays'), icon: Clock },
  ];

  return (
    <PullToRefresh onRefresh={handlePullRefresh} className="min-h-screen bg-background relative overflow-hidden safe-area-top safe-area-bottom">
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

          {/* ── Friend Requests Section (shown on 'all' and 'social' tabs) ── */}
          {(activeTab === 'all' || activeTab === 'social') && friendRequests.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <p className="text-xs font-bold text-foreground mb-2 flex items-center gap-2">
                <UserPlus className="w-3.5 h-3.5 text-blue-500" />
                Friend Requests
                <Badge className="bg-blue-500 text-white text-[9px] h-4 px-1.5 border-0">
                  {friendRequests.length}
                </Badge>
              </p>
              <div className="space-y-2.5">
                <AnimatePresence mode="popLayout">
                  {friendRequests.map((req) => (
                    <FriendRequestCard
                      key={req.id}
                      request={req}
                      onAccept={() => handleAcceptFriend(req)}
                      onDecline={() => handleDeclineFriend(req)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* ── Notification List ── */}
          {activeTab !== 'social' && (
            <>
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
              ) : filteredNotifications.length === 0 && friendRequests.length === 0 ? (
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
              ) : filteredNotifications.length > 0 ? (
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
              ) : null}
            </>
          )}

          {/* Social Notifications (likes, comments, shares, follows) */}
          {(activeTab === 'all' || activeTab === 'social') && socialNotifs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              {activeTab === 'social' && (
                <p className="text-xs font-bold text-foreground mb-2 flex items-center gap-2">
                  <Heart className="w-3.5 h-3.5 text-red-500" />
                  Activity
                </p>
              )}
              <div className="space-y-2">
                {socialNotifs.map((sn, i) => (
                  <SocialNotifItem
                    key={sn.id}
                    notif={sn}
                    index={i}
                    onClick={() => {
                      if (!sn.is_read) markSocialRead([sn.id]);
                      if (sn.entity_type === 'post' && sn.entity_id) navigate(`/reels`);
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Social tab empty state */}
          {activeTab === 'social' && friendRequests.length === 0 && socialNotifs.length === 0 && !loadingFR && (
            <motion.div
              initial={{ opacity: 0, y: 30, rotateX: 8 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{ perspective: '800px' }}
            >
              <GlassCard3D className="shadow-xl">
                <div className="p-10 text-center">
                  {getEmptyIcon('social')}
                  <h3 className="font-bold text-base mb-1">No activity yet</h3>
                  <p className="text-muted-foreground text-sm max-w-[250px] mx-auto">
                    When people like, comment, or share your posts, you'll see it here.
                  </p>
                </div>
              </GlassCard3D>
            </motion.div>
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
    </PullToRefresh>
  );
};

export default NotificationsPage;
