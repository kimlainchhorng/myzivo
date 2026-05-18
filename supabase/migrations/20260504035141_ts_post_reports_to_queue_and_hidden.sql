-- 1) Add soft-hide columns to user_posts so the admin "resolve" action can
-- actually take a post down without deleting it (audit trail preserved).
ALTER TABLE public.user_posts
  ADD COLUMN IF NOT EXISTS hidden_at timestamptz,
  ADD COLUMN IF NOT EXISTS hidden_reason text,
  ADD COLUMN IF NOT EXISTS hidden_by uuid;

CREATE INDEX IF NOT EXISTS idx_user_posts_visible
  ON public.user_posts (created_at DESC) WHERE hidden_at IS NULL;

-- 2) Trigger so user-submitted post_reports automatically appear in the
-- admin moderation queue. Multiple reports on the same post bump priority.
CREATE OR REPLACE FUNCTION public.fan_post_report_to_queue() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_existing_id uuid;
  v_existing_priority int;
BEGIN
  -- Reuse an open queue row for the same post if one already exists.
  SELECT id, priority INTO v_existing_id, v_existing_priority
  FROM public.content_moderation_queue
  WHERE content_type = 'post' AND content_id = NEW.post_id::text
    AND (status IS NULL OR status = 'pending')
  LIMIT 1;

  IF v_existing_id IS NOT NULL THEN
    UPDATE public.content_moderation_queue
       SET priority = COALESCE(v_existing_priority, 0) + 1,
           updated_at = now(),
           reason = COALESCE(reason, '') || E'\n+ ' || COALESCE(NEW.reason, 'reported')
     WHERE id = v_existing_id;
  ELSE
    INSERT INTO public.content_moderation_queue (
      content_type, content_id, reported_by, reason, severity, status, priority
    ) VALUES (
      'post',
      NEW.post_id::text,
      NEW.reporter_id,
      COALESCE(NEW.reason, 'reported'),
      'medium',
      'pending',
      1
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_post_reports_to_queue ON public.post_reports;
CREATE TRIGGER trg_post_reports_to_queue
  AFTER INSERT ON public.post_reports
  FOR EACH ROW EXECUTE FUNCTION public.fan_post_report_to_queue();

-- 3) Backfill: any existing post_reports that don't have a queue row.
INSERT INTO public.content_moderation_queue (content_type, content_id, reported_by, reason, severity, status, priority, created_at)
SELECT 'post', pr.post_id::text, pr.reporter_id, COALESCE(pr.reason, 'reported'), 'medium', 'pending', 1, pr.created_at
FROM public.post_reports pr
WHERE NOT EXISTS (
  SELECT 1 FROM public.content_moderation_queue q
   WHERE q.content_type = 'post' AND q.content_id = pr.post_id::text
);;
