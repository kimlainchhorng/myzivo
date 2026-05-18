ALTER TABLE public.creator_subscriptions
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS stripe_session_id text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_creator_subscriptions_stripe_sub
  ON public.creator_subscriptions (stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_creator_subscriptions_stripe_session
  ON public.creator_subscriptions (stripe_session_id) WHERE stripe_session_id IS NOT NULL;;
