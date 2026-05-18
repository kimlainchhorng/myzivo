create table if not exists public.bot_payment_links (
  id uuid primary key default gen_random_uuid(),
  bot_id uuid not null references public.bots(id) on delete cascade,
  slug text not null check (slug ~ '^[a-z0-9_-]{2,40}$'),
  title text not null,
  description text,
  amount_cents int not null check (amount_cents > 0),
  currency text not null default 'usd' check (currency ~ '^[a-z]{3}$'),
  checkout_url text not null check (checkout_url ~ '^https://'),
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (bot_id, slug)
);
create index if not exists bot_payment_links_bot_idx on public.bot_payment_links(bot_id, sort_order);

alter table public.bot_payment_links enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='bot_payment_links' and policyname='Anyone reads active payment links') then
    create policy "Anyone reads active payment links" on public.bot_payment_links
      for select to anon, authenticated using (is_active = true);
  end if;
  if not exists (select 1 from pg_policies where tablename='bot_payment_links' and policyname='Owner manages payment links') then
    create policy "Owner manages payment links" on public.bot_payment_links for all to authenticated
      using (exists (select 1 from public.bots b where b.id = bot_id and b.owner_id = auth.uid()))
      with check (exists (select 1 from public.bots b where b.id = bot_id and b.owner_id = auth.uid()));
  end if;
end $$;

-- Helper for AI handler / public profile
create or replace function public.bot_public_payments(p_username text)
returns table (slug text, title text, description text, amount_cents int, currency text, checkout_url text)
language sql stable security definer set search_path = public as $$
  select p.slug, p.title, p.description, p.amount_cents, p.currency, p.checkout_url
  from public.bot_payment_links p
  join public.bots b on b.id = p.bot_id
  where b.username = lower(p_username) and b.is_active = true and p.is_active = true
  order by p.sort_order asc, p.created_at asc;
$$;
grant execute on function public.bot_public_payments(text) to anon, authenticated;

-- Workflow extension: a special trigger value `pay:<slug>` sends the link as a message.
-- Simpler: workflows reply_text can include {{pay:slug}} and dispatcher expands it.
-- We do this at the dispatcher level (next deploy).;
