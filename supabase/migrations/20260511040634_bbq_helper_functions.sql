
create or replace function public.bbq_bump_promo(promo_id uuid) returns void
language sql security definer set search_path = public as $$
  update public.bbq_promo_codes set uses_count = uses_count + 1 where id = promo_id;
$$;

create or replace function public.bbq_add_loyalty_points(uid uuid, n integer) returns void
language sql security definer set search_path = public as $$
  update public.bbq_profiles set loyalty_points = loyalty_points + n where id = uid;
$$;
;
