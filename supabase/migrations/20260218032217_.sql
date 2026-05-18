-- Add missing driver support categories to the support_tickets check constraint
ALTER TABLE public.support_tickets DROP CONSTRAINT support_tickets_category_check;
ALTER TABLE public.support_tickets ADD CONSTRAINT support_tickets_category_check
CHECK (category = ANY (ARRAY['general','payment','trip','order','account','technical','complaint','feedback','customer','app','emergency']));

-- Add 'waiting' status if not present (admin code uses it)
ALTER TABLE public.support_tickets DROP CONSTRAINT support_tickets_status_check;
ALTER TABLE public.support_tickets ADD CONSTRAINT support_tickets_status_check
CHECK (status = ANY (ARRAY['open','in_progress','waiting_response','waiting','resolved','closed']));
;
