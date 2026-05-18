-- Add the columns the ChannelPostCard / ChannelPostComments components
-- already expect, plus the count-maintenance trigger.

ALTER TABLE public.channel_posts
  ADD COLUMN IF NOT EXISTS comments_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS comments_enabled BOOLEAN NOT NULL DEFAULT true;

-- Trigger: maintain comments_count when comments are inserted/deleted.
-- Soft-delete (deleted_at IS NOT NULL) does NOT decrement; only physical
-- delete does. The comments component uses a UI-side `is_deleted` view so
-- the count remains accurate to "comments ever posted" and the user sees
-- the placeholder "[deleted]" row, matching the rest of the app.
CREATE OR REPLACE FUNCTION public.tg_channel_post_comments_count()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.channel_posts
       SET comments_count = comments_count + 1
     WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.channel_posts
       SET comments_count = GREATEST(comments_count - 1, 0)
     WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS channel_post_comments_count_trg ON public.channel_post_comments;
CREATE TRIGGER channel_post_comments_count_trg
AFTER INSERT OR DELETE ON public.channel_post_comments
FOR EACH ROW EXECUTE FUNCTION public.tg_channel_post_comments_count();

-- Backfill counts in case any test rows already exist.
UPDATE public.channel_posts cp
   SET comments_count = (SELECT count(*) FROM public.channel_post_comments c WHERE c.post_id = cp.id);;
