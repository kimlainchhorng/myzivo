
-- Enable RLS on all bbq_ tables
alter table public.bbq_profiles enable row level security;
alter table public.bbq_menu_categories enable row level security;
alter table public.bbq_menu_items enable row level security;
alter table public.bbq_bookings enable row level security;
alter table public.bbq_orders enable row level security;
alter table public.bbq_order_items enable row level security;
alter table public.bbq_promo_codes enable row level security;
alter table public.bbq_payments enable row level security;
alter table public.bbq_settings enable row level security;

-- helper: is admin?
create or replace function public.bbq_is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.bbq_profiles where id = auth.uid() and role in ('admin','staff'));
$$;

-- profiles policies
drop policy if exists bbq_profiles_select_own on public.bbq_profiles;
create policy bbq_profiles_select_own on public.bbq_profiles
  for select using (id = auth.uid() or public.bbq_is_admin());

drop policy if exists bbq_profiles_update_own on public.bbq_profiles;
create policy bbq_profiles_update_own on public.bbq_profiles
  for update using (id = auth.uid() or public.bbq_is_admin());

-- menu categories: public read, admin write
drop policy if exists bbq_cats_read on public.bbq_menu_categories;
create policy bbq_cats_read on public.bbq_menu_categories for select using (true);
drop policy if exists bbq_cats_admin on public.bbq_menu_categories;
create policy bbq_cats_admin on public.bbq_menu_categories for all using (public.bbq_is_admin()) with check (public.bbq_is_admin());

-- menu items: public read, admin write
drop policy if exists bbq_items_read on public.bbq_menu_items;
create policy bbq_items_read on public.bbq_menu_items for select using (true);
drop policy if exists bbq_items_admin on public.bbq_menu_items;
create policy bbq_items_admin on public.bbq_menu_items for all using (public.bbq_is_admin()) with check (public.bbq_is_admin());

-- bookings: insert allowed for anyone (guest booking ok); read own + admin
drop policy if exists bbq_bookings_insert on public.bbq_bookings;
create policy bbq_bookings_insert on public.bbq_bookings for insert with check (true);
drop policy if exists bbq_bookings_select on public.bbq_bookings;
create policy bbq_bookings_select on public.bbq_bookings for select using (user_id = auth.uid() or public.bbq_is_admin());
drop policy if exists bbq_bookings_admin_update on public.bbq_bookings;
create policy bbq_bookings_admin_update on public.bbq_bookings for update using (public.bbq_is_admin()) with check (public.bbq_is_admin());

-- orders: same — guest checkout allowed; read own + admin
drop policy if exists bbq_orders_insert on public.bbq_orders;
create policy bbq_orders_insert on public.bbq_orders for insert with check (true);
drop policy if exists bbq_orders_select on public.bbq_orders;
create policy bbq_orders_select on public.bbq_orders for select using (user_id = auth.uid() or public.bbq_is_admin());
drop policy if exists bbq_orders_admin_update on public.bbq_orders;
create policy bbq_orders_admin_update on public.bbq_orders for update using (public.bbq_is_admin()) with check (public.bbq_is_admin());

-- order items: linked to order
drop policy if exists bbq_oi_insert on public.bbq_order_items;
create policy bbq_oi_insert on public.bbq_order_items for insert with check (true);
drop policy if exists bbq_oi_select on public.bbq_order_items;
create policy bbq_oi_select on public.bbq_order_items for select using (
  exists (select 1 from public.bbq_orders o where o.id = order_id and (o.user_id = auth.uid() or public.bbq_is_admin()))
);

-- promo codes: public read (for validation), admin write
drop policy if exists bbq_promo_read on public.bbq_promo_codes;
create policy bbq_promo_read on public.bbq_promo_codes for select using (is_active = true);
drop policy if exists bbq_promo_admin on public.bbq_promo_codes;
create policy bbq_promo_admin on public.bbq_promo_codes for all using (public.bbq_is_admin()) with check (public.bbq_is_admin());

-- payments: read own order's payment + admin
drop policy if exists bbq_payments_select on public.bbq_payments;
create policy bbq_payments_select on public.bbq_payments for select using (
  exists (select 1 from public.bbq_orders o where o.id = order_id and (o.user_id = auth.uid() or public.bbq_is_admin()))
);
drop policy if exists bbq_payments_insert on public.bbq_payments;
create policy bbq_payments_insert on public.bbq_payments for insert with check (true);

-- settings: public read, admin write
drop policy if exists bbq_settings_read on public.bbq_settings;
create policy bbq_settings_read on public.bbq_settings for select using (true);
drop policy if exists bbq_settings_admin on public.bbq_settings;
create policy bbq_settings_admin on public.bbq_settings for all using (public.bbq_is_admin()) with check (public.bbq_is_admin());
;
