
alter table public.bbq_payments add column if not exists option text;
alter table public.bbq_payments add column if not exists payment_url text;
alter table public.bbq_payments add column if not exists deeplink text;

-- Expand payment_method enum on bbq_orders to include cash + card already supported
-- by existing check constraint. No change needed.
;
