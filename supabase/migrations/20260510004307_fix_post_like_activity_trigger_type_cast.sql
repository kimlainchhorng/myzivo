-- Fix the like-button-doesn't-work bug: tg_activity_post_like compared a
-- UUID column to a TEXT column without an explicit cast, raising 42883
-- which rolled back the INSERT. Cast both sides to text and wrap the body
-- in EXCEPTION WHEN OTHERS so a downstream activity-feed failure can never
-- block the user's actual like.
CREATE OR REPLACE FUNCTION public.tg_activity_post_like()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner uuid;
BEGIN
  SELECT user_id INTO v_owner
    FROM public.user_posts
    WHERE id::text = NEW.post_id::text
    LIMIT 1;

  IF v_owner IS NULL OR v_owner = NEW.user_id THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.activity_feed (user_id, role, event_type, event_data)
  VALUES (
    v_owner, 'recipient', 'post_liked',
    jsonb_build_object('actor_id', NEW.user_id, 'post_id', NEW.post_id)
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'tg_activity_post_like failed: % (%)', SQLERRM, SQLSTATE;
  RETURN NEW;
END;
$$;;
