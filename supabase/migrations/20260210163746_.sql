
-- Increment forum post likes (atomic)
CREATE OR REPLACE FUNCTION public.increment_forum_post_likes(post_id_input uuid)
RETURNS void AS $$
BEGIN
  UPDATE forum_posts SET likes = COALESCE(likes, 0) + 1 WHERE id = post_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Decrement forum post likes (atomic, min 0)
CREATE OR REPLACE FUNCTION public.decrement_forum_post_likes(post_id_input uuid)
RETURNS void AS $$
BEGIN
  UPDATE forum_posts SET likes = GREATEST(COALESCE(likes, 0) - 1, 0) WHERE id = post_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Increment forum post views (atomic)
CREATE OR REPLACE FUNCTION public.increment_forum_post_views(post_id_input uuid)
RETURNS void AS $$
BEGIN
  UPDATE forum_posts SET views = COALESCE(views, 0) + 1 WHERE id = post_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
;
