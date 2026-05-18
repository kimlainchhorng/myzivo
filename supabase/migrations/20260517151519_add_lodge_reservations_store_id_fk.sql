ALTER TABLE public.lodge_reservations
  ADD CONSTRAINT lodge_reservations_store_id_fkey
  FOREIGN KEY (store_id)
  REFERENCES public.store_profiles(id)
  ON DELETE RESTRICT;;
