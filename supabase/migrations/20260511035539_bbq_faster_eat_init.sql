
-- BBQ Faster Eat schema (prefixed bbq_*)

create extension if not exists "pgcrypto";

-- profiles (1:1 with auth.users)
create table if not exists public.bbq_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  email text,
  role text not null default 'customer' check (role in ('customer','admin','staff')),
  loyalty_points integer not null default 0,
  telegram_chat_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- menu categories
create table if not exists public.bbq_menu_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order integer not null default 0,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- menu items
create table if not exists public.bbq_menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.bbq_menu_categories(id) on delete cascade,
  name text not null,
  slug text not null unique,
  description text,
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'USD',
  image_url text,
  is_available boolean not null default true,
  is_featured boolean not null default false,
  prep_time_minutes integer not null default 15,
  spicy_level smallint not null default 0 check (spicy_level between 0 and 3),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bbq_menu_items_category_idx on public.bbq_menu_items(category_id);

-- bookings (table reservations)
create table if not exists public.bbq_bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  guest_name text not null,
  guest_phone text not null,
  guest_email text,
  party_size integer not null check (party_size between 1 and 50),
  booking_at timestamptz not null,
  special_requests text,
  status text not null default 'pending' check (status in ('pending','confirmed','seated','completed','cancelled','no_show')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bbq_bookings_user_idx on public.bbq_bookings(user_id);
create index if not exists bbq_bookings_at_idx on public.bbq_bookings(booking_at);

-- promo codes
create table if not exists public.bbq_promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  discount_type text not null check (discount_type in ('percent','fixed')),
  discount_value integer not null check (discount_value >= 0),
  min_subtotal_cents integer not null default 0,
  max_uses integer,
  uses_count integer not null default 0,
  valid_from timestamptz not null default now(),
  valid_until timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- orders
create table if not exists public.bbq_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  fulfillment_type text not null check (fulfillment_type in ('delivery','pickup','dine_in')),
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  delivery_address text,
  delivery_notes text,
  table_number text,
  scheduled_at timestamptz,
  subtotal_cents integer not null default 0,
  discount_cents integer not null default 0,
  delivery_fee_cents integer not null default 0,
  tax_cents integer not null default 0,
  total_cents integer not null default 0,
  currency text not null default 'USD',
  promo_code_id uuid references public.bbq_promo_codes(id) on delete set null,
  loyalty_points_used integer not null default 0,
  loyalty_points_earned integer not null default 0,
  status text not null default 'pending' check (status in ('pending','confirmed','preparing','ready','out_for_delivery','completed','cancelled')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid','pending','paid','refunded','failed')),
  payment_method text check (payment_method in ('aba_khqr','cash','card')),
  payment_reference text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bbq_orders_user_idx on public.bbq_orders(user_id);
create index if not exists bbq_orders_status_idx on public.bbq_orders(status);
create index if not exists bbq_orders_created_idx on public.bbq_orders(created_at desc);

-- order items
create table if not exists public.bbq_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.bbq_orders(id) on delete cascade,
  menu_item_id uuid references public.bbq_menu_items(id) on delete set null,
  item_name text not null,
  item_image_url text,
  unit_price_cents integer not null,
  quantity integer not null check (quantity > 0),
  total_cents integer not null,
  special_instructions text,
  created_at timestamptz not null default now()
);

create index if not exists bbq_order_items_order_idx on public.bbq_order_items(order_id);

-- payments (ABA KHQR transactions)
create table if not exists public.bbq_payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.bbq_orders(id) on delete cascade,
  provider text not null default 'aba_khqr',
  provider_reference text,
  qr_string text,
  md5 text,
  amount_cents integer not null,
  currency text not null default 'USD',
  status text not null default 'pending' check (status in ('pending','paid','expired','failed','refunded')),
  raw_payload jsonb,
  paid_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists bbq_payments_order_idx on public.bbq_payments(order_id);

-- restaurant settings (single-row)
create table if not exists public.bbq_settings (
  id boolean primary key default true check (id),
  restaurant_name text not null default 'BBQ Faster Eat',
  tagline text default 'Real Smoke. Real Fast.',
  address text default '123 Riverside, Phnom Penh, Cambodia',
  phone text default '+855 12 345 678',
  email text default 'hello@bbqfastereat.com',
  open_hours jsonb default '{"mon":"11:00-22:00","tue":"11:00-22:00","wed":"11:00-22:00","thu":"11:00-22:00","fri":"11:00-23:00","sat":"10:00-23:00","sun":"10:00-22:00"}'::jsonb,
  delivery_fee_cents integer not null default 200,
  delivery_min_order_cents integer not null default 1000,
  delivery_radius_km numeric not null default 5,
  tax_rate numeric not null default 0,
  loyalty_points_per_dollar integer not null default 1,
  loyalty_redeem_rate_cents integer not null default 1,
  telegram_owner_chat_id text,
  aba_merchant_id text,
  hero_image_url text,
  updated_at timestamptz not null default now()
);

insert into public.bbq_settings (id) values (true) on conflict do nothing;

-- updated_at trigger helper
create or replace function public.bbq_set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists bbq_profiles_updated on public.bbq_profiles;
create trigger bbq_profiles_updated before update on public.bbq_profiles
  for each row execute function public.bbq_set_updated_at();

drop trigger if exists bbq_menu_items_updated on public.bbq_menu_items;
create trigger bbq_menu_items_updated before update on public.bbq_menu_items
  for each row execute function public.bbq_set_updated_at();

drop trigger if exists bbq_bookings_updated on public.bbq_bookings;
create trigger bbq_bookings_updated before update on public.bbq_bookings
  for each row execute function public.bbq_set_updated_at();

drop trigger if exists bbq_orders_updated on public.bbq_orders;
create trigger bbq_orders_updated before update on public.bbq_orders
  for each row execute function public.bbq_set_updated_at();

-- auto-create profile on signup
create or replace function public.bbq_handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.bbq_profiles (id, email, full_name, phone)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''), coalesce(new.raw_user_meta_data->>'phone', ''))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists bbq_on_auth_user_created on auth.users;
create trigger bbq_on_auth_user_created
  after insert on auth.users
  for each row execute function public.bbq_handle_new_user();

-- order_number generator
create or replace function public.bbq_generate_order_number() returns trigger
language plpgsql as $$
begin
  if new.order_number is null or new.order_number = '' then
    new.order_number := 'BBQ-' || to_char(now(),'YYMMDD') || '-' || lpad((floor(random()*100000))::text, 5, '0');
  end if;
  return new;
end $$;

drop trigger if exists bbq_orders_number on public.bbq_orders;
create trigger bbq_orders_number before insert on public.bbq_orders
  for each row execute function public.bbq_generate_order_number();
;
