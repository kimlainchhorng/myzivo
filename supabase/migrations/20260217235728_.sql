ALTER TABLE public.restricted_zones ADD COLUMN county TEXT;

NOTIFY pgrst, 'reload schema';;
