create table if not exists public.bot_apps (
  id uuid primary key default gen_random_uuid(),
  bot_id uuid not null references public.bots(id) on delete cascade,
  slug text not null check (slug ~ '^[a-z0-9-]{2,40}$'),
  title text not null,
  description text,
  icon_emoji text,
  app_url text not null check (app_url ~ '^https://'),
  open_in_chat boolean not null default false,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (bot_id, slug)
);
create index if not exists bot_apps_bot_idx on public.bot_apps(bot_id, sort_order);

alter table public.bot_apps enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename='bot_apps' and policyname='Anyone reads active apps') then
    create policy "Anyone reads active apps" on public.bot_apps for select to anon, authenticated using (is_active = true);
  end if;
  if not exists (select 1 from pg_policies where tablename='bot_apps' and policyname='Owner manages apps') then
    create policy "Owner manages apps" on public.bot_apps for all to authenticated
      using (exists (select 1 from public.bots b where b.id = bot_id and b.owner_id = auth.uid()))
      with check (exists (select 1 from public.bots b where b.id = bot_id and b.owner_id = auth.uid()));
  end if;
end $$;

-- Public RPC for the bot's profile page to surface its apps
create or replace function public.bot_public_apps(p_username text)
returns table (slug text, title text, description text, icon_emoji text, app_url text, open_in_chat boolean)
language sql stable security definer set search_path = public as $$
  select a.slug, a.title, a.description, a.icon_emoji, a.app_url, a.open_in_chat
  from public.bot_apps a
  join public.bots b on b.id = a.bot_id
  where b.username = lower(p_username) and b.is_active = true and a.is_active = true
  order by a.sort_order asc, a.created_at asc;
$$;
grant execute on function public.bot_public_apps(text) to anon, authenticated;;
