
-- Allow empty description on support tickets
ALTER TABLE public.support_tickets ALTER COLUMN description SET DEFAULT '';
ALTER TABLE public.support_tickets ALTER COLUMN description DROP NOT NULL;
;
