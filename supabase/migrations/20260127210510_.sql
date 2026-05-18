-- Create forum_posts table for driver community discussions
CREATE TABLE public.forum_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  likes INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create forum_post_likes table to track who liked what
CREATE TABLE public.forum_post_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, driver_id)
);

-- Create forum_replies table for post comments
CREATE TABLE public.forum_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create driver_referrals table for tracking referrals
CREATE TABLE public.driver_referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  referee_name TEXT NOT NULL,
  referee_email TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'expired')),
  trips_completed INTEGER DEFAULT 0,
  bonus_earned NUMERIC(10,2) DEFAULT 0,
  signed_up_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create driver_notifications table for persistent notifications
CREATE TABLE public.driver_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('earnings', 'order', 'rating', 'achievement', 'system', 'promo')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(10,2),
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  icon TEXT DEFAULT '📱',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_notifications ENABLE ROW LEVEL SECURITY;

-- Forum posts: Everyone can read, drivers can create/update their own
CREATE POLICY "Anyone can read forum posts" ON public.forum_posts FOR SELECT USING (true);
CREATE POLICY "Drivers can create posts" ON public.forum_posts FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.drivers WHERE id = driver_id AND user_id = auth.uid())
);
CREATE POLICY "Drivers can update own posts" ON public.forum_posts FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.drivers WHERE id = driver_id AND user_id = auth.uid())
);
CREATE POLICY "Drivers can delete own posts" ON public.forum_posts FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.drivers WHERE id = driver_id AND user_id = auth.uid())
);

-- Forum likes: Drivers can manage their own likes
CREATE POLICY "Anyone can read post likes" ON public.forum_post_likes FOR SELECT USING (true);
CREATE POLICY "Drivers can like posts" ON public.forum_post_likes FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.drivers WHERE id = driver_id AND user_id = auth.uid())
);
CREATE POLICY "Drivers can unlike posts" ON public.forum_post_likes FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.drivers WHERE id = driver_id AND user_id = auth.uid())
);

-- Forum replies: Everyone can read, drivers can create/update/delete their own
CREATE POLICY "Anyone can read replies" ON public.forum_replies FOR SELECT USING (true);
CREATE POLICY "Drivers can create replies" ON public.forum_replies FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.drivers WHERE id = driver_id AND user_id = auth.uid())
);
CREATE POLICY "Drivers can update own replies" ON public.forum_replies FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.drivers WHERE id = driver_id AND user_id = auth.uid())
);
CREATE POLICY "Drivers can delete own replies" ON public.forum_replies FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.drivers WHERE id = driver_id AND user_id = auth.uid())
);

-- Referrals: Drivers can only see their own
CREATE POLICY "Drivers can read own referrals" ON public.driver_referrals FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.drivers WHERE id = referrer_id AND user_id = auth.uid())
);
CREATE POLICY "Drivers can create referrals" ON public.driver_referrals FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.drivers WHERE id = referrer_id AND user_id = auth.uid())
);
CREATE POLICY "Drivers can update own referrals" ON public.driver_referrals FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.drivers WHERE id = referrer_id AND user_id = auth.uid())
);

-- Notifications: Drivers can only see/manage their own
CREATE POLICY "Drivers can read own notifications" ON public.driver_notifications FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.drivers WHERE id = driver_id AND user_id = auth.uid())
);
CREATE POLICY "Drivers can update own notifications" ON public.driver_notifications FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.drivers WHERE id = driver_id AND user_id = auth.uid())
);
CREATE POLICY "System can create notifications" ON public.driver_notifications FOR INSERT WITH CHECK (true);

-- Create triggers for updated_at
CREATE TRIGGER update_forum_posts_updated_at
BEFORE UPDATE ON public.forum_posts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_forum_posts_driver ON public.forum_posts(driver_id);
CREATE INDEX idx_forum_posts_category ON public.forum_posts(category);
CREATE INDEX idx_forum_posts_created ON public.forum_posts(created_at DESC);
CREATE INDEX idx_forum_post_likes_post ON public.forum_post_likes(post_id);
CREATE INDEX idx_forum_replies_post ON public.forum_replies(post_id);
CREATE INDEX idx_driver_referrals_referrer ON public.driver_referrals(referrer_id);
CREATE INDEX idx_driver_notifications_driver ON public.driver_notifications(driver_id);
CREATE INDEX idx_driver_notifications_unread ON public.driver_notifications(driver_id, is_read) WHERE NOT is_read;

-- Seed some initial forum posts
INSERT INTO public.forum_posts (driver_id, title, content, category, likes, replies_count, views, is_pinned)
SELECT 
  d.id,
  '🔥 Best times to drive in downtown area',
  'I''ve been tracking my earnings for 3 months and found that lunch rush (11am-2pm) and dinner (5-8pm) are consistently the best times. Downtown areas near office buildings are gold during lunch!',
  'Tips & Tricks',
  45, 23, 342, true
FROM public.drivers d
LIMIT 1;

INSERT INTO public.forum_posts (driver_id, title, content, category, likes, replies_count, views, is_pinned)
SELECT 
  d.id,
  'New bonus program announcement',
  'Starting this week, we''re introducing a new peak hours bonus program. Complete 5 deliveries during peak hours to earn an extra $15!',
  'Market Updates',
  128, 56, 892, true
FROM public.drivers d
LIMIT 1;

INSERT INTO public.forum_posts (driver_id, title, content, category, likes, replies_count, views, is_pinned)
SELECT 
  d.id,
  'Hit $1000 this week! Here''s how',
  'Finally reached my goal! My top strategies: 1) Start early (7am), 2) Stay near restaurant clusters, 3) Accept stacked orders when possible. Consistency is key!',
  'Success Stories',
  89, 34, 567, false
FROM public.drivers d
LIMIT 1;;
