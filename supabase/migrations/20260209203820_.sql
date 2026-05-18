
ALTER TABLE public.order_ratings
  ADD COLUMN merchant_reply text,
  ADD COLUMN merchant_reply_at timestamptz;
;
