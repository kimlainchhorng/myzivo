-- Drop and recreate the service_type check constraint to include 'driver'
ALTER TABLE public.zivo_support_tickets
DROP CONSTRAINT zivo_support_tickets_service_type_check;

ALTER TABLE public.zivo_support_tickets
ADD CONSTRAINT zivo_support_tickets_service_type_check
CHECK (service_type = ANY (ARRAY['flights','cars','p2p_cars','rides','eats','move','hotels','extras','account','general','driver']));
;
